"use strict";
const cds = require("@sap/cds");

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
   * Checks DepartmentBudget for current month. If enough → reserves amount.
   * Returns "WITHIN" or throws if not configured / exceeded.
   */
  const reserveBudget = async (costCenter, costCenterName, amount) => {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();
    const fiscalMonth = currentDate.getMonth() + 1;

    const budget = await SELECT.one.from(DepartmentBudget).where({
      costCenter,
      fiscalYear,
      fiscalMonth,
    });

    if (!budget) {
      throw new Error(
        `Budget not configured for cost center: ${costCenterName} (${costCenter})`
      );
    }

    if (budget.remainingAmount < amount) {
      throw new Error(
        `Insufficient budget for ${costCenterName} — requested: ${amount}, remaining: ${budget.remainingAmount}`
      );
    }

    await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: budget.reservedAmount + amount,
        remainingAmount: budget.remainingAmount - amount,
      })
      .where({ costCenter, fiscalYear, fiscalMonth });

    return "WITHIN";
  };

  /**
   * releaseBudget — called on cancel and reject.
   * Moves amount back from reserved → remaining.
   */
  const releaseBudget = async (costCenter, amount) => {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();
    const fiscalMonth = currentDate.getMonth() + 1;

    const budget = await SELECT.one.from(DepartmentBudget).where({
      costCenter,
      fiscalYear,
      fiscalMonth,
    });

    if (!budget) return; // nothing to release if no record

    await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: Math.max(0, budget.reservedAmount - amount),
        remainingAmount: budget.remainingAmount + amount,
      })
      .where({ costCenter, fiscalYear, fiscalMonth });
  };

  /**
   * consumeBudget — called on final approve.
   * Moves amount from reserved → consumed.
   */
  const consumeBudget = async (costCenter, amount) => {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();
    const fiscalMonth = currentDate.getMonth() + 1;

    const budget = await SELECT.one.from(DepartmentBudget).where({
      costCenter,
      fiscalYear,
      fiscalMonth,
    });

    if (!budget) return;

    await UPDATE(DepartmentBudget)
      .set({
        reservedAmount: Math.max(0, budget.reservedAmount - amount),
        consumedAmount: budget.consumedAmount + amount,
      })
      .where({ costCenter, fiscalYear, fiscalMonth });
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
      const budgetStatus = await reserveBudget(
        request.costCenter,
        request.costCenterName,
        request.totalAmount
      );

      await UPDATE(PurchaseRequest)
        .set({ budgetCheckStatus: budgetStatus })
        .where({ ID });
    } catch (e) {
      await UPDATE(PurchaseRequest)
        .set({ budgetCheckStatus: "EXCEEDED" })
        .where({ ID });
      return req.error(400, e.message);
    }

    // ── Generate requestNumber only on first submission ──
    if (!request.requestNumber) {
      const year = new Date().getFullYear();
      const existing = await SELECT.from(PurchaseRequest).where({
        requestNumber: { "!=": null },
      });
      const seq = String(existing.length + 1).padStart(3, "0");
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
        approverUserId: "manager@company.com",
        stepStatus: "ACTIVE",
        decision: "PENDING",
      });
    } else {
      steps.push(
        {
          request_ID: ID,
          stepNumber: 1,
          approverRole: "Manager",
          approverUserId: "manager@company.com",
          stepStatus: "ACTIVE",
          decision: "PENDING",
        },
        {
          request_ID: ID,
          stepNumber: 2,
          approverRole: "Finance",
          approverUserId: "finance@company.com",
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
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  // ─── cancel ────────────────────────────────────────────────────────────────
  srv.on("cancel", "Requests", async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);

    if (request.status !== "DRAFT" && request.status !== "SUBMITTED") {
      return req.error(
        400,
        `Cannot cancel — current status is '${request.status}'`
      );
    }

    // ── Release budget if it was reserved ──
    if (request.budgetCheckStatus === "WITHIN") {
      await releaseBudget(request.costCenter, request.totalAmount);
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

    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  // ─── lineTotal + totalAmount recalculation ─────────────────────────────────
  srv.after(["CREATE", "UPDATE"], "Requests", async (data, req) => {
    const requestId = data?.ID;
    if (!requestId) return;

    const items = data.items;
    if (!items || !items.length) return;

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

 

  // ─── Export budget helpers for use in approval-handler.js ─────────────────
  srv._releaseBudget = releaseBudget;
  srv._consumeBudget = consumeBudget;
};