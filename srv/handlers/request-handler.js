console.log("FILE LOADED");
const cds = require("@sap/cds");

module.exports = (srv) => {
  const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } =
    cds.entities("com.enterprise.approval");

  // srv.before("CREATE", "Requests", async (req) => {
  //   console.log("CREATE event:", req.data);
  // });

  srv.on("submit", "Requests", async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (request.status !== "DRAFT" && request.status !== "REJECTED") {
      return req.error(
        400,
        `Cannot submit — current status is '${request.status}'`,
      );
    }

    // Each submission creates one WorkflowInstance — count gives attempt number
    const runs = await SELECT.from(WorkflowInstance).where({ request_ID: ID });
    const runNumber = runs.length + 1;
    if (runNumber > 3) {
      return req.error(
        400,
        "Maximum resubmissions reached. Request is permanently closed.",
      );
    }

    await UPDATE(PurchaseRequest).set({ status: "SUBMITTED" }).where({ ID });

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
      steps.push({
        request_ID: ID,
        stepNumber: 1,
        approverRole: "Manager",
        approverUserId: "manager@company.com",
        stepStatus: "ACTIVE",
        decision: "PENDING",
      });
      steps.push({
        request_ID: ID,
        stepNumber: 2,
        approverRole: "Finance",
        approverUserId: "finance@company.com",
        stepStatus: "ACTIVE",
        decision: "PENDING",
      });
    }

    // Clean up leftover ACTIVE steps from previous rejected run
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "COMPLETED" })
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    await INSERT.into(ApprovalStep).entries(steps);

    // workflowInstanceId is a placeholder — replaced with real BPA ID later
    await INSERT.into(WorkflowInstance).entries({
      request_ID: ID,
      runNumber: runNumber,
      workflowInstanceId: `manual-run-${runNumber}`,
      status: "RUNNING",
      startedAt: new Date(),
    });
    await UPDATE(PurchaseRequest).set({ status: "IN_APPROVAL" }).where({ ID });

    await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      action: runNumber === 1 ? "SUBMITTED" : "RESUBMITTED",
      oldValue: request.status,
      newValue: "IN_APPROVAL",
      performedBy: req.user?.id || "anonymous",
    });

    const updated = await SELECT.one.from(PurchaseRequest).where({ ID });

    return updated;
  });
};
