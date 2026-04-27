console.log("FILE LOADED");
const cds = require("@sap/cds");
const { SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = async (srv) => {
  const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance, RequestItem } =
    cds.entities("com.enterprise.approval");

  // ─── External Service Connections ─────────────────────────────────────────
  const S4 = await cds.connect.to("S4HANA_SANDBOX");
  const PRODUCT = await cds.connect.to("API_PRODUCT_SRV");
  const COSTCENTER = await cds.connect.to("API_COSTCENTER_SRV");

  // ─── VendorHelp READ ───────────────────────────────────────────────────────
  srv.on("READ", "VendorHelp", async (req) => {
    return await S4.run(req.query);
  });

  // ─── ProductHelp READ ──────────────────────────────────────────────────────
  srv.on("READ", "ProductHelp", async (req) => {
    return await PRODUCT.run(req.query);
  });

  // ─── CostCenterHelp READ ───────────────────────────────────────────────────
  srv.on("READ", "CostCenterHelp", async (req) => {
    return await COSTCENTER.run(req.query);
  });

  // ─── validateVendor ────────────────────────────────────────────────────────
  srv.on("validateVendor", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (!request.vendorId)
      return req.error(400, "Vendor ID is required before validating");

    const result = await S4.run(
      SELECT.one
        .from("S4HANA_SANDBOX.A_BusinessPartner")
        .where({ BusinessPartner: request.vendorId })
        .columns("BusinessPartner", "BusinessPartnerFullName")
    );

    if (!result)
      return req.error(404, `Vendor '${request.vendorId}' not found`);

    await UPDATE(PurchaseRequest)
      .set({ vendorName: result.BusinessPartnerFullName })
      .where({ ID });

    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  // ─── validateCostCenter ────────────────────────────────────────────────────
  srv.on("validateCostCenter", "Requests", async (req) => {
    const { ID } = req.params[0];
    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (!request.costCenter)
      return req.error(400, "Cost Center is required before validating");

    const result = await COSTCENTER.run(
      SELECT.one
        .from("API_COSTCENTER_SRV.A_CostCenter_2")
        .where({ CostCenter: request.costCenter, ControllingArea: 'A000' })
        .columns("CostCenter", "CostCenterName", "CompanyCode")
    );

    if (!result)
      return req.error(
        404,
        `Cost Center '${request.costCenter}' not found`
      );

    // Cost center confirmed — no extra fields to write back, just validates
    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

srv.before("NEW", "RequestItems.drafts", async (req) => {
  const { request_ID } = req.data;
  if (!request_ID) return;

  const { RequestItems } = srv.entities;
  
  const existing = await SELECT.from(RequestItems.drafts)
    .where({ request_ID });

  console.log("existing draft items:", existing);

  req.data.itemNumber = existing.length + 1;

  console.log("assigned itemNumber:", req.data.itemNumber);
});
  // ─── validateProduct ───────────────────────────────────────────────────────
  srv.on("validateProduct", "RequestItems", async (req) => {
    const { ID } = req.params[0];
    const item = await SELECT.one
      .from(RequestItem)
      .where({ ID });
    if (!item) return req.error(404, `Item ${ID} not found`);
    if (!item.productId)
      return req.error(400, "Product ID is required before validating");

    const result = await PRODUCT.run(
      SELECT.one
        .from("API_PRODUCT_SRV.A_Product")
        .where({ Product: item.productId })
        .columns("Product", "BaseUnit")
    );

    if (!result)
      return req.error(404, `Product '${item.productId}' not found`);

    await UPDATE(RequestItem)
      .set({ unit: result.BaseUnit })
      .where({ ID });

    return await SELECT.one
      .from(RequestItem)
      .where({ ID });
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

    const runs = await SELECT.from(WorkflowInstance).where({ request_ID: ID });
    const runNumber = runs.length + 1;
    if (runNumber > 3) {
      return req.error(
        400,
        "Maximum resubmissions reached. Request is permanently closed."
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
    await UPDATE(ApprovalStep)
      .set({ stepStatus: "COMPLETED" })
      .where({ request_ID: ID, stepStatus: "ACTIVE" });
    await INSERT.into(ApprovalStep).entries(steps);

    await INSERT.into(WorkflowInstance).entries({
      request_ID: ID,
      runNumber: runNumber,
      workflowInstanceId: `manual-run-${runNumber}`,
      status: "RUNNING",
      startedAt: new Date(),
    });

    // Generate request number: PR-YYYY-NNN format
    const year = new Date().getFullYear();
    const count = await SELECT.from(PurchaseRequest)
      .where({ requestNumber: { '!=': null } });
    const seq = String(count.length + 1).padStart(3, '0');
    const requestNumber = `PR-${year}-${seq}`;

    await UPDATE(PurchaseRequest).set({
      status: "IN_APPROVAL",
      requestNumber: requestNumber,
      submittedAt: new Date()
    }).where({ ID });
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
  srv.on('cancel','Requests', async(req)=>{
    const { ID } = req.params[0];
        const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (request.status !== "DRAFT" && request.status !== "SUBMITTED") {
      return req.error(
        400,
        `Cannot submit — current status is '${request.status}'`
      );
    }
    await UPDATE(PurchaseRequest).set({ status: "CANCELLED" }).where({ ID });
 await INSERT.into(AuditLog).entries({
      request_ID: ID,
      entityName: "PurchaseRequest",
      entityId: ID,
      oldValue: request.status,
      newValue: "CANCELLED",
      performedBy: req.user?.id || "anonymous",
    });

    return await SELECT.one.from(PurchaseRequest).where({ ID });
  })
// ─── lineTotal + totalAmount on draft activation ────────────────────────────
srv.after(["CREATE", "UPDATE"], "Requests", async (data, req) => {
  const requestId = data?.ID;
  if (!requestId) return;

  const items = data.items;
  if (!items || !items.length) return;

  let totalAmount = 0;

  for (const item of items) {
    const qty      = parseFloat(item.quantity)  || 0;
    const price    = parseFloat(item.unitPrice) || 0;
    const lineTotal = qty * price;
    totalAmount += lineTotal;

    await UPDATE(RequestItem)
      .set({ lineTotal })
      .where({ ID: item.ID });
  }

  await UPDATE(PurchaseRequest)
    .set({ totalAmount })
    .where({ ID: requestId });
});
};