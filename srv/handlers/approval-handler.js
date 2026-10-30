const cds = require("@sap/cds");
const { sendAlert } = require("./ans-helper");
module.exports = async (srv) => {
  const { PurchaseRequest, ApprovalStep, AuditLog } = cds.entities(
    "com.enterprise.approval",
  );

  // Manager and Finance steps are active together, so pick the one this user can act on.
  const activeStepFor = async (request, req) => {
    if (request.createdBy === req.user.id) req.reject(403, "You cannot approve or reject your own request");
    const steps = await SELECT.from(ApprovalStep)
      .where({ request_ID: request.ID, stepStatus: "ACTIVE" })
      .orderBy("stepNumber");
    if (!steps.length) req.reject(403, "No active step found for you");
    const step = steps.find((s) => req.user.is(s.approverRole));
    if (!step) req.reject(403, `Only a ${steps.map((s) => s.approverRole).join(" or ")} can act on this request`);
    return step;
  };

  srv.on("approve", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, `Request is not waiting for approval — current status is '${request.status}'`);
    }
    const step = await activeStepFor(request, req);

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
      body: `Request approved by ${req.user.id} for ${request.costCenterName} — Amount: ${request.totalAmount} ${request.currency || ""}`
    });
    req.notify(newStatus === "APPROVED"
      ? `Request ${request.requestNumber} approved`
      : `Your approval is recorded. Waiting for ${pendingSteps.map((s) => s.approverRole).join(" and ")}`);
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  srv.on("reject", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (request.status !== "IN_APPROVAL") {
      return req.error(400, `Request is not waiting for approval — current status is '${request.status}'`);
    }
    const step = await activeStepFor(request, req);
    const comment = req.data.comment?.trim();
    if (!comment) return req.error({ status: 400, message: "Enter a reason for the rejection", target: "comment" });

    // And record who acted:
    await UPDATE(ApprovalStep)
      .set({
        stepStatus: "COMPLETED",
        decision: "REJECTED",
        comment,
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
      body: `Request rejected by ${req.user.id} for ${request.costCenterName} — Reason: ${comment}`
    });
    req.notify(`Request ${request.requestNumber} rejected. The requester can change and resubmit it`);
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });
};
