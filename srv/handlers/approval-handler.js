const cds = require("@sap/cds");
const { SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = async (srv) => {
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
    if (!req.user.is(step.approverRole)) {
      return req.error(403, `Only a ${step.approverRole} can approve this step`);
    }

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
      await UPDATE(PurchaseRequest).set({ status: "APPROVED" }).where({ ID });
      await srv._consumeBudget(request?.costCenter, request?.totalAmount);
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
    if (!req.user.is(step.approverRole)) {
      return req.error(403, `Only a ${step.approverRole} can reject this step`);
    }

    // And record who acted:
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "REJECTED",
        comment: req.data.comment || "No reason provided",
        decidedAt: new Date(),
        approverUserId: req.user.id,  // capture real identity at action time
      })
      .where({ ID: step.ID });
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "SKIPPED", decision: "SKIPPED" })
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    await srv._releaseBudget(request?.costCenter, request?.totalAmount);

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
