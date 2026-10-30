"use strict";
const cds = require("@sap/cds");
const { sendAlert } = require("./ans-helper");

module.exports = async (srv) => {
  const {
    PurchaseRequest,
    ApprovalStep,
    AuditLog,
    WorkflowInstance,
    RequestItem,
    DepartmentBudget,
  } = cds.entities("com.enterprise.approval");

  // ─── Budget Helper Functions ───────────────────────────────────────────────

  /**
   * reserveBudget — called on submit.
   * Reserves amount in the current month's DepartmentBudget in one atomic UPDATE,
   * so concurrent submits cannot both pass the check.
   * Returns the reserved period or throws if not configured / exceeded.
   */
  const reserveBudget = async (costCenter, costCenterName, amount) => {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();
    const fiscalMonth = currentDate.getMonth() + 1;
    const amt = parseFloat(amount) || 0;

    const reserved = await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: { "+=": amt },
        remainingAmount: { "-=": amt },
      })
      .where({ costCenter, fiscalYear, fiscalMonth, remainingAmount: { ">=": amt } });

    if (!reserved) {
      const budget = await SELECT.one.from(DepartmentBudget).where({
        costCenter,
        fiscalYear,
        fiscalMonth,
      });
      throw new Error(
        budget
          ? `Insufficient budget for ${costCenterName} — requested: ${amount}, remaining: ${budget.remainingAmount}`
          : `Budget not configured for cost center: ${costCenterName} (${costCenter})`
      );
    }

    return { fiscalYear, fiscalMonth };
  };

  // Budget row the request reserved against; requests submitted before the
  // period was stored fall back to the current month (old behaviour).
  const budgetPeriod = (request) => {
    const now = new Date();
    return {
      costCenter: request.costCenter,
      fiscalYear: request.budgetFiscalYear ?? now.getFullYear(),
      fiscalMonth: request.budgetFiscalMonth ?? now.getMonth() + 1,
    };
  };

  /**
   * releaseBudget — called on cancel and reject.
   * Moves amount back from reserved → remaining.
   */
  const releaseBudget = async (request) => {
    const amt = parseFloat(request.totalAmount) || 0;
    await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: { "-=": amt },
        remainingAmount: { "+=": amt },
      })
      .where(budgetPeriod(request));
  };

  /**
   * consumeBudget — called on final approve.
   * Moves amount from reserved → consumed.
   */
  const consumeBudget = async (request) => {
    const amt = parseFloat(request.totalAmount) || 0;
    await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: { "-=": amt },
        consumedAmount: { "+=": amt },
      })
      .where(budgetPeriod(request));
  };


  // ─── Auto-assign itemNumber on new draft RequestItem ──────────────────────
  srv.before("NEW", "RequestItems.drafts", async (req) => {
    const { request_ID } = req.data;
    if (!request_ID) return;

    const { RequestItems } = srv.entities;
    const existing = await SELECT.from(RequestItems.drafts).where({
      request_ID,
    });

    req.data.itemNumber = existing.length + 1;
  });

  // ─── Live line/request totals while editing a draft ───────────────────────
  srv.after("UPDATE", "RequestItems.drafts", async (_, req) => {
    const { RequestItems, Requests } = srv.entities;
    const { ID } = req.params.at(-1);
    const item = await SELECT.one.from(RequestItems.drafts).where({ ID });
    if (!item) return;

    const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    await UPDATE(RequestItems.drafts).set({ lineTotal }).where({ ID });

    const items = await SELECT.from(RequestItems.drafts).columns("lineTotal").where({ request_ID: item.request_ID });
    const totalAmount = items.reduce((sum, i) => sum + (parseFloat(i.lineTotal) || 0), 0);
    await UPDATE(Requests.drafts).set({ totalAmount }).where({ ID: item.request_ID });
  });


  // ─── Lock submitted requests ───────────────────────────────────────────────
  // Amount and cost center must stay what the budget reserved and the approvers saw.
  srv.before(["EDIT", "SAVE", "DELETE"], "Requests", async (req) => {
    const { ID } = req.params?.[0] ?? req.data;
    const active = await SELECT.one.from(PurchaseRequest).columns("status").where({ ID });
    if (active && active.status !== "DRAFT" && active.status !== "REJECTED") {
      req.reject(400, `Cannot ${req.event === "DELETE" ? "delete" : "edit"} — current status is '${active.status}'`);
    }
  });

  srv.before("SAVE", "Requests", async (req) => {
    const date = req.data.requestedDeliveryDate;
    if (date && date < new Date().toISOString().slice(0, 10)) {
      req.error({ status: 400, message: "Delivery date cannot be in the past", target: "in/requestedDeliveryDate" });
    }

    const items = await SELECT.from(srv.entities.RequestItems.drafts)
      .columns("ID", "itemNumber", "quantity", "unitPrice")
      .where({ request_ID: req.data.ID });
    for (const item of items) {
      const target = (field) => `in/items(ID=${item.ID},IsActiveEntity=false)/${field}`;
      if (item.quantity != null && Number(item.quantity) <= 0) {
        req.error({ status: 400, message: `Item ${item.itemNumber}: quantity must be greater than 0`, target: target("quantity") });
      }
      if (item.unitPrice != null && Number(item.unitPrice) < 0) {
        req.error({ status: 400, message: `Item ${item.itemNumber}: unit price cannot be negative`, target: target("unitPrice") });
      }
    }
  });

  // ─── submit ────────────────────────────────────────────────────────────────
  srv.on("submit", "Requests", async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);

    if (request.status !== "DRAFT" && request.status !== "REJECTED") {
      return req.error(
        400,
        `Cannot submit — current status is '${request.status}'`
      );
    }

    if (!(Number(request.totalAmount) > 0)) {
      return req.error(400, "Add at least one item with a quantity and price before submitting");
    }

    // ── Run number check (max 3 submissions) ──
    const runs = await SELECT.from(WorkflowInstance).where({ request_ID: ID });
    const runNumber = runs.length + 1;
    if (runNumber > 3) {
      return req.error(
        400,
        "Maximum resubmissions reached. Request is permanently closed."
      );
    }

    // ── Budget check ──
    try {
      const { fiscalYear, fiscalMonth } = await reserveBudget(
        request.costCenter,
        request.costCenterName,
        request.totalAmount
      );

      // Warn when this request leaves less than 10% of the month's budget.
      const budget = await SELECT.one.from(DepartmentBudget)
        .columns("monthlyAllocation", "remainingAmount")
        .where({ costCenter: request.costCenter, fiscalYear, fiscalMonth });
      const allocation = Number(budget.monthlyAllocation) || 0;
      const lowBudget = allocation > 0 && Number(budget.remainingAmount) < allocation * 0.1;
      if (lowBudget) {
        req.warn(`Budget for ${request.costCenterName || request.costCenter} is almost used up: ${budget.remainingAmount} ${request.currency || ""} left this month`);
      }

      await UPDATE(PurchaseRequest)
        .set({
          budgetCheckStatus: lowBudget ? "WARNING" : "WITHIN",
          budgetFiscalYear: fiscalYear,
          budgetFiscalMonth: fiscalMonth,
        })
        .where({ ID });
    } catch (e) {
      await UPDATE(PurchaseRequest)
        .set({ budgetCheckStatus: "EXCEEDED" })
        .where({ ID });
      return req.error(400, e.message);
    }

    // ── Generate requestNumber only on first submission ──
    if (!request.requestNumber) {
      // shortcut: two submits in the same instant can get the same number; add a DB sequence if that shows up.
      const year = new Date().getFullYear();
      const { count } = await SELECT.one.from(PurchaseRequest)
        .columns("count(1) as count")
        .where({ requestNumber: { like: `PR-${year}-%` } });
      const seq = String(count + 1).padStart(3, "0");
      const requestNumber = `PR-${year}-${seq}`;

      await UPDATE(PurchaseRequest)
        .set({ requestNumber, submittedAt: new Date() })
        .where({ ID });
    }

    await UPDATE(PurchaseRequest).set({ status: "SUBMITTED" }).where({ ID });

    // ── Mark old active steps as completed (resubmission cleanup) ──
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "COMPLETED" })
      .where({ request_ID: ID, stepStatus: "ACTIVE" });

    // ── Create approval steps based on amount ──
    const steps = [];
    if (request.totalAmount <= 5000) {
      steps.push({
        request_ID: ID,
        stepNumber: 1,
        approverRole: "Manager",
        approverUserId: "Manager",
        stepStatus: "ACTIVE",
        decision: "PENDING",
      });
    } else {
      steps.push(
        {
          request_ID: ID,
          stepNumber: 1,
          approverRole: "Manager",
          approverUserId: "Manager",
          stepStatus: "ACTIVE",
          decision: "PENDING",
        },
        {
          request_ID: ID,
          stepNumber: 2,
          approverRole: "Finance",
          approverUserId: "Finance",
          stepStatus: "ACTIVE",
          decision: "PENDING",
        }
      );
    }

    await INSERT.into(ApprovalStep).entries(steps);

    // ── Create WorkflowInstance record ──
    await INSERT.into(WorkflowInstance).entries({
      request_ID: ID,
      runNumber,
      workflowInstanceId: `manual-run-${runNumber}`,
      status: "RUNNING",
      startedAt: new Date(),
    });

    // ── Final status update ──
    await UPDATE(PurchaseRequest)
      .set({ status: "IN_APPROVAL" })
      .where({ ID });

    // ── Audit log ──
    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: runNumber === 1 ? "SUBMITTED" : "RESUBMITTED",
      oldValue: request.status,
      newValue: "IN_APPROVAL",
      performedBy: req.user?.id || "anonymous",
    });
    const result = await SELECT.one.from(PurchaseRequest).where({ ID });
    await sendAlert({
      eventType: "purchase-request.submitted",
      severity: "INFO",
      subject: `New Purchase Request Submitted: ${result.requestNumber}`,
      body: `Request submitted by ${req.user?.id || "anonymous"} for ${request.costCenterName} — Amount: ${request.totalAmount} ${request.currency || ""}`
    });
    req.notify(`Request ${result.requestNumber} submitted for approval`);
    return result;
  });

  // ─── cancel ────────────────────────────────────────────────────────────────
  srv.on("cancel", "Requests", async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);

    // Only drafts can be cancelled, and a draft never holds a budget reservation.
    if (request.status !== "DRAFT") {
      return req.error(
        400,
        `Cannot cancel — current status is '${request.status}'`
      );
    }

    await UPDATE(PurchaseRequest).set({ status: "CANCELLED" }).where({ ID });

    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: "CANCELLED",
      oldValue: request.status,
      newValue: "CANCELLED",
      performedBy: req.user?.id || "anonymous",
    });

    req.notify("Request cancelled");
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  // ─── lineTotal + totalAmount recalculation ─────────────────────────────────
  srv.after(["CREATE", "UPDATE"], "Requests", async (data, req) => {
    const requestId = data?.ID;
    if (!requestId) return;

    const items = await SELECT.from(RequestItem).where({ request_ID: requestId });
    if (!items.length) {
      await UPDATE(PurchaseRequest).set({ totalAmount: 0 }).where({ ID: requestId });
      return;
    }

    let totalAmount = 0;
    for (const item of items) {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const lineTotal = qty * price;
      totalAmount += lineTotal;
      await UPDATE(RequestItem).set({ lineTotal }).where({ ID: item.ID });
    }

    await UPDATE(PurchaseRequest).set({ totalAmount }).where({ ID: requestId });
  });

  srv.on("READ", "UserInfo", (req) => ({ hideCreate: !req.user.is("Requester") }));

  // ─── Populate per-user button flags ───────────────────────────────────────
  // isApprover: user can act on an active step now (Approve/Reject).
  // isOwner / hideEdit: only the requester submits, cancels, edits or deletes.
  // Read from the DB because the UI's $select may not include createdBy/status.
  srv.after("READ", "Requests", async (data, req) => {
    const rows = (Array.isArray(data) ? data : [data]).filter((r) => r?.ID);
    if (!rows.length) return;
    const ids = rows.map((r) => r.ID);
    const [steps, actives] = await Promise.all([
      SELECT.from(ApprovalStep).columns("request_ID", "approverRole")
        .where({ request_ID: { in: ids }, stepStatus: "ACTIVE" }),
      SELECT.from(PurchaseRequest).columns("ID", "createdBy", "status").where({ ID: { in: ids } }),
    ]);
    for (const row of rows) {
      const active = actives.find((a) => a.ID === row.ID);
      row.isApprover = steps.some((s) => s.request_ID === row.ID && req.user.is(s.approverRole));
      // No active row yet = a new draft, which only its creator can see.
      row.isOwner = !active || active.createdBy === req.user.id;
      row.hideEdit = !row.isOwner || (!!active && active.status !== "DRAFT" && active.status !== "REJECTED");
    }
  });

  // ─── Export budget helpers for use in approval-handler.js ─────────────────
  srv._releaseBudget = releaseBudget;
  srv._consumeBudget = consumeBudget;
};