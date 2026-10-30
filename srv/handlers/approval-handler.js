const cds = require("@sap/cds");
const { sendAlert } = require("./ans-helper");
module.exports = async (srv) => {
  const { PurchaseRequest, ApprovalStep, AuditLog } = cds.entities(
    "com.enterprise.approval",
  );

  // Manager and Finance steps are active together, so pick the one this user can act on.
  const activeStepFor = async (ID, req) => {
    const steps = await SELECT.from(ApprovalStep)
      .where({ request_ID: ID, stepStatus: "ACTIVE" })
      .orderBy("stepNumber");
    if (!steps.length) req.reject(403, "No active step found for you");
    const step = steps.find((s) => req.user.is(s.approverRole));
    if (!step) req.reject(403, `Only a ${steps.map((s) => s.approverRole).join(" or ")} can act on this request`);
    return step;
  };

  srv.on("approve", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, "Request is not available for approval");
    }
    const step = await activeStepFor(ID, req);

    // And record who acted:
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "APPROVED",
        decidedAt: new Date(),
        approverUserId: req.user.id,  // capture real identity at action time
      })
      .where({ ID: step.ID });
    const pendingSteps = await SELECT.from(ApprovalStep).where({
      request_ID: ID,
      decision: "PENDING",
    });
    let newStatus = "IN_APPROVAL";
    if (!pendingSteps.length) {
      await UPDATE(PurchaseRequest).set({ status: "APPROVED", completedAt: new Date() }).where({ ID });
      await srv._consumeBudget(request);
      newStatus = "APPROVED";
    }
    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: "APPROVE",
      oldValue: request.status,
      newValue: newStatus,
      performedBy: req.user.id,
    });
    await sendAlert({
      eventType: "purchase-request.approved",
      severity: "INFO",
      subject: `Purchase Request Approved: ${request.requestNumber || ID}`,
      body: `Request approved by ${req.user.id} for ${request.costCenterName} — Amount: ${request.totalAmount} EUR`
    });
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  srv.on("reject", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, "Request is not available for approval");
    }
    const step = await activeStepFor(ID, req);

    // And record who acted:
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "REJECTED",
        comment: req.data.comment || "No reason provided",
        decidedAt: new Date(),
        approverUserId: req.user.id,
      })
      .where({ ID: step.ID });
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "SKIPPED", decision: "SKIPPED" }) // SKIPPED, not PENDING: approve counts PENDING decisions across runs
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    await srv._releaseBudget(request);

    await UPDATE(PurchaseRequest).set({ status: "REJECTED", completedAt: new Date() }).where({ ID });
    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: "REJECT",
      oldValue: request.status,
      newValue: "REJECTED",
      performedBy: req.user.id,
    });
    await sendAlert({
      eventType: "purchase-request.rejected",
      severity: "WARNING",
      subject: `Purchase Request Rejected: ${request.requestNumber || ID}`,
      body: `Request rejected by ${req.user.id} for ${request.costCenterName} — Reason: ${req.data.comment || "No reason provided"}`
    });
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });
};
