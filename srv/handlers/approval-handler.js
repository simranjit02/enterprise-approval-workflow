const cds = require("@sap/cds");
const { SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = (srv) => {
  const { PurchaseRequest, ApprovalStep, AuditLog } = cds.entities(
    "com.enterprise.approval",
  );

  srv.on("approve", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, "Request is not available for approval");
    }
    const step = await SELECT.one
      .from(ApprovalStep)
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    if (!step) {
      return req.error(403, "No active step found for you");
    }
    if (step.approverUserId !== req.user.id) {
      return req.error(403, "You are not the assigned approver for this step");
    }
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "APPROVED",
        decidedAt: new Date(),
      })
      .where({ ID: step.ID });
    const pendingSteps = await SELECT.from(ApprovalStep).where({
      request_ID: ID,
      decision: "PENDING",
    });
    if (!pendingSteps.length) {
      await UPDATE(PurchaseRequest).set({ status: "APPROVED" }).where({ ID });
    }
    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: "APPROVE",
      oldValue: request.status,
      newValue: "APPROVED",
      performedBy: req.user.id,
    });
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  srv.on("reject", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, "Request is not available for approval");
    }
    const step = await SELECT.one
      .from(ApprovalStep)
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    if (!step) {
      return req.error(403, "No active step found for you");
    }
    if (step.approverUserId !== req.user.id) {
      return req.error(403, "You are not the assigned approver for this step");
    }
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "REJECTED",
        comment: req.data.comment || "No reason provided",
        decidedAt: new Date(),
      })
      .where({ ID: step.ID });
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "SKIPPED", decision: "PENDING" })
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    await UPDATE(PurchaseRequest).set({ status: "REJECTED" }).where({ ID });
    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: "REJECT",
      oldValue: request.status,
      newValue: "REJECTED",
      performedBy: req.user.id,
    });
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });
};
