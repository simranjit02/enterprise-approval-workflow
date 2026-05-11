const cds = require("@sap/cds");

module.exports = async (srv) => {
    console.log("FILE LOADED: validation-handler.js");

    const {
        PurchaseRequest,
        RequestItem,
    } = cds.entities("com.enterprise.approval");
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
        console.log("result",result);
        
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
                .where({ CostCenter: request.costCenter, ControllingArea: "A000" })
                .columns("CostCenter", "CostCenterName", "CompanyCode")
        );
        if (!result)
            return req.error(404, `Cost Center '${request.costCenter}' not found`);
        await UPDATE(PurchaseRequest)
            .set({ costCenterName: result.CostCenterName })
            .where({ ID });
        return await SELECT.one.from(PurchaseRequest).where({ ID });
    });


    // ─── validateProduct ───────────────────────────────────────────────────────
    srv.on("validateProduct", "RequestItems", async (req) => {
        const { ID } = req.params[0];

        const item = await SELECT.one.from(RequestItem).where({ ID });
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
        await UPDATE(RequestItem).set({ unit: result.BaseUnit }).where({ ID });
        return await SELECT.one.from(RequestItem).where({ ID });
    });
}