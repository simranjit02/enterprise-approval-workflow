const cds = require("@sap/cds");

module.exports = async (srv) => {
    const { DepartmentBudget } = cds.entities("com.enterprise.approval");
    const { Requests, RequestItems } = srv.entities;
    // ─── External Service Connections ─────────────────────────────────────────
    const S4 = await cds.connect.to("S4HANA_SANDBOX");
    const PRODUCT = await cds.connect.to("API_PRODUCT_SRV");
    const COSTCENTER = await cds.connect.to("API_COSTCENTER_SRV");
    const INFORECORD = await cds.connect.to("API_INFORECORD_PROCESS_SRV");

    // shortcut: one controlling area; make it configurable if the company has more.
    const CONTROLLING_AREA = "A000";
    const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD; TZ set in mta.yaml

    // An unreachable S/4 system gets a clear message instead of a raw 502.
    const fromS4 = async (req, what, query) => {
        try {
            return await query();
        } catch (e) {
            console.error(`[S4] ${what} lookup failed:`, e.message);
            req.reject(502, `Could not reach S/4HANA to check the ${what}. Try again later.`);
        }
    };

    // ─── Value helps ───────────────────────────────────────────────────────────
    // S/4 rejects $search ("search scope is empty"), so search becomes a contains-filter on
    // ID and name; S/4 matches it case-insensitively. Returns a plain copy without search,
    // because the query's parts are partly inherited and search can't be removed in place.
    const withoutSearch = (req, ...columns) => {
        const SELECT = {};
        for (const key in req.query.SELECT) if (key !== "search") SELECT[key] = req.query.SELECT[key];
        const term = req.query.SELECT.search?.filter((s) => s.val).map((s) => s.val).join(" ");
        if (term) {
            const xpr = columns.flatMap((column, i) => [
                ...(i ? ["or"] : []),
                { func: "contains", args: [{ ref: [column] }, { val: term }] },
            ]);
            SELECT.where = SELECT.where?.length ? [...SELECT.where, "and", { xpr }] : [{ xpr }];
        }
        return { SELECT };
    };

    // The projections' where clauses aren't sent to S/4, so filter here.
    srv.on("READ", "VendorHelp", (req) => {
        req.query.where({ PurchasingIsBlocked: false, DeletionIndicator: false });
        return S4.run(withoutSearch(req, "vendorId", "vendorName"));
    });
    srv.on("READ", "ProductHelp", (req) => {
        req.query.where({ Language: "EN" });
        return PRODUCT.run(withoutSearch(req, "productId", "productName"));
    });
    srv.on("READ", "CostCenterHelp", (req) => {
        req.query.where({
            IsBlockedForCommitmentPosting: false,
            ControllingArea: CONTROLLING_AREA,
            ValidityStartDate: { "<=": today() },
            ValidityEndDate: { ">=": today() },
        });
        return COSTCENTER.run(withoutSearch(req, "costCenterId", "costCenterName"));
    });

    // ─── Vendor and cost center: check in S/4 and fill names ──────────────────
    // reject, not error: in a draft PATCH, req.error only adds a draft message and the bad value is still stored.
    srv.before(["NEW", "UPDATE"], "Requests.drafts", async (req) => {
        const { vendorId, costCenter } = req.data;
        let companyCode;

        if (vendorId) {
            const supplier = await fromS4(req, "vendor", () => S4.run(
                SELECT.one.from("S4HANA_SANDBOX.A_Supplier")
                    .columns("Supplier", "SupplierName", "PurchasingIsBlocked", "DeletionIndicator")
                    .where({ Supplier: vendorId })
            ));
            if (!supplier) {
                req.reject({ status: 400, message: `Vendor ${vendorId} does not exist in S/4HANA`, target: "vendorId" });
            } else if (supplier.PurchasingIsBlocked || supplier.DeletionIndicator) {
                req.reject({ status: 400, message: `Vendor ${vendorId} is blocked for purchasing`, target: "vendorId" });
            }
            const address = await fromS4(req, "vendor", () => S4.run(
                SELECT.one.from("S4HANA_SANDBOX.A_BusinessPartnerAddress")
                    .columns("Country").where({ BusinessPartner: vendorId })
            ));
            req.data.vendorName = supplier.SupplierName;
            req.data.vendorCountry = address?.Country ?? null;
        }

        if (costCenter) {
            const cc = await costCenterInS4(req, costCenter);
            if (!cc) {
                req.reject({ status: 400, message: `Cost center ${costCenter} does not exist or is not valid today`, target: "costCenter" });
            } else if (cc.IsBlockedForCommitmentPosting) {
                req.reject({ status: 400, message: `Cost center ${costCenter} is blocked for purchasing`, target: "costCenter" });
            }
            req.data.costCenterName = cc.CostCenterName;
            req.data.costCenterCurrency = cc.CostCenterCurrency;
            companyCode = cc.CompanyCode;
        }

        // Currency follows the vendor; the cost center's company code decides when the vendor has several.
        if (vendorId || costCenter) {
            const draft = req.params.length
                ? await SELECT.one.from(Requests.drafts).columns("vendorId", "costCenter").where({ ID: req.params.at(-1).ID })
                : {};
            const vendor = vendorId ?? draft?.vendorId;
            if (vendor) {
                const currency = await vendorCurrency(req, vendor, companyCode, costCenter ?? draft?.costCenter);
                if (currency) req.data.currency = currency;
                else if (vendorId) req.info(`Vendor ${vendorId} has no default currency in S/4HANA. Select the cost center or choose the currency`);
            }
        }
    });

    const costCenterInS4 = (req, costCenter) => fromS4(req, "cost center", () => COSTCENTER.run(
        SELECT.one.from("API_COSTCENTER_SRV.A_CostCenter_2")
            .columns("CostCenter", "CostCenterName", "CompanyCode", "CostCenterCurrency", "IsBlockedForCommitmentPosting")
            .where({
                CostCenter: costCenter,
                ControllingArea: CONTROLLING_AREA,
                ValidityStartDate: { "<=": today() },
                ValidityEndDate: { ">=": today() },
            })
    ));

    // Order: the vendor's one purchasing currency; else its currency in the paying company code
    // (the cost center's); else any purchasing currency; else its only company currency.
    const vendorCurrency = async (req, vendorId, companyCode, costCenter) => {
        const [orgs, companies] = await fromS4(req, "vendor", () => Promise.all([
            S4.run(SELECT.from("S4HANA_SANDBOX.A_SupplierPurchasingOrg").columns("PurchaseOrderCurrency").where({ Supplier: vendorId })),
            S4.run(SELECT.from("S4HANA_SANDBOX.A_SupplierCompany").columns("CompanyCode", "Currency").where({ Supplier: vendorId })),
        ]));
        const distinct = (list) => [...new Set(list.filter(Boolean))];
        const purchasing = distinct(orgs.map((o) => o.PurchaseOrderCurrency));
        if (purchasing.length === 1) return purchasing[0];

        if (!companyCode && costCenter) companyCode = (await costCenterInS4(req, costCenter))?.CompanyCode;
        const paying = companies.find((c) => c.CompanyCode === companyCode)?.Currency;
        if (paying) return paying;

        const company = distinct(companies.map((c) => c.Currency));
        return purchasing[0] ?? (company.length === 1 ? company[0] : null);
    };

    // ─── Product: fill name, unit, group and the price agreed with the vendor ─
    // shortcut: takes the first org/plant price; pick by purchasing org once the app has one.
    const agreedPrice = async (supplier, material) => {
        const quote = (v) => `'${String(v).replace(/'/g, "''")}'`;
        const filter = encodeURIComponent(`Supplier eq ${quote(supplier)} and Material eq ${quote(material)}`);
        const records = await INFORECORD.send({
            method: "GET",
            path: `/A_PurchasingInfoRecord?$filter=${filter}&$expand=to_PurgInfoRecdOrgPlantData`,
        });
        const prices = (records ?? []).flatMap((r) => r.to_PurgInfoRecdOrgPlantData?.results ?? r.to_PurgInfoRecdOrgPlantData ?? []);
        // OData v2 sends dates as /Date(ms)/; a price is valid through its end date.
        const endsAt = (v) => Number(/Date\((\d+)/.exec(v)?.[1] ?? Date.parse(v));
        const startOfToday = Date.parse(today());
        const price = prices.find((p) => Number(p.NetPriceAmount) > 0 && !(endsAt(p.PriceValidityEndDate) < startOfToday));
        if (!price) return null;
        const perUnit = Number(price.NetPriceAmount) / (Number(price.MaterialPriceUnitQty) || 1);
        return { amount: Math.round(perUnit * 100) / 100, currency: price.Currency };
    };

    // Agreed price in the request's currency, or null with a message saying why.
    const priceFor = async (req, request, productId) => {
        const price = await fromS4(req, "purchase price", () => agreedPrice(request.vendorId, productId));
        if (!price) {
            req.info(`No purchase price is agreed with vendor ${request.vendorId} for ${productId}. Enter the price manually`);
            return null;
        }
        if (request.currency && price.currency !== request.currency) {
            req.warn(`The agreed price for ${productId} is ${price.amount} ${price.currency}, but the request is in ${request.currency}. Enter the price manually`);
            return null;
        }
        return price.amount;
    };

    srv.before(["NEW", "UPDATE"], "RequestItems.drafts", async (req) => {
        const { productId } = req.data;
        if (!productId) return;

        const [product, description] = await fromS4(req, "product", () => Promise.all([
            PRODUCT.run(SELECT.one.from("API_PRODUCT_SRV.A_Product")
                .columns("Product", "BaseUnit", "ProductGroup").where({ Product: productId })),
            PRODUCT.run(SELECT.one.from("API_PRODUCT_SRV.A_ProductDescription")
                .columns("ProductDescription").where({ Product: productId, Language: "EN" })),
        ]));
        if (!product) {
            req.reject({ status: 400, message: `Product ${productId} does not exist in S/4HANA`, target: "productId" });
        }
        req.data.unit = product.BaseUnit;
        req.data.productCategory = product.ProductGroup;
        if (description) req.data.productName = description.ProductDescription;

        const requestId = req.data.request_ID ??
            (await SELECT.one.from(RequestItems.drafts).columns("request_ID").where({ ID: req.params.at(-1).ID }))?.request_ID;
        const request = await SELECT.one.from(Requests.drafts).columns("vendorId", "currency").where({ ID: requestId });
        if (!request?.vendorId) {
            return req.info("Select a vendor on the request to get the agreed purchase price");
        }
        const unitPrice = await priceFor(req, request, productId);
        if (unitPrice != null) req.data.unitPrice = unitPrice;
    });

    // Picking the vendor, or anything that changes the currency, re-prices the items already on the request.
    srv.after("UPDATE", "Requests.drafts", async (_, req) => {
        if (!req.data.vendorId && !req.data.costCenter && !req.data.currency) return;
        const ID = req.params.at(-1).ID;
        const request = await SELECT.one.from(Requests.drafts).columns("vendorId", "currency").where({ ID });
        if (!request?.vendorId) return;
        const items = await SELECT.from(RequestItems.drafts).columns("ID", "productId").where({ request_ID: ID, productId: { "!=": null } });
        await Promise.all(items.map(async (item) => {
            const unitPrice = await priceFor(req, request, item.productId);
            if (unitPrice != null) await UPDATE(RequestItems.drafts).set({ unitPrice }).where({ ID: item.ID });
        }));
        if (items.length) await srv._recalcDraftTotals(ID);
    });


    srv.on('checkBudget', ['Requests', 'Requests.drafts'], async (req) => {
    const { ID } = req.params[0];
    const { Requests } = srv.entities;
    const isDraft = req.entity.endsWith('.drafts');
    const entity = isDraft ? Requests.drafts : Requests;
    const request = await SELECT.one.from(entity).where({ ID });

    if (!request) return req.error(404, `Request ${ID} not found`);
    if (!request.costCenter) return req.error(400, 'Cost center is required before checking budget');

    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();
    const fiscalMonth = currentDate.getMonth() + 1;

    const budget = await SELECT.one.from(DepartmentBudget).where({
      costCenter: request.costCenter,
      fiscalYear,
      fiscalMonth,
    });

    if (!budget) return req.error(404, `No budget configured for cost center: ${request.costCenter}`);

    return req.info(`Budget for ${request.costCenterName || request.costCenter} | Monthly: ${budget.monthlyAllocation} | Consumed: ${budget.consumedAmount} | Reserved: ${budget.reservedAmount} | Remaining: ${budget.remainingAmount}`);
  });
}


