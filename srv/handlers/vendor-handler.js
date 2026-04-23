const cds = require('@sap/cds');

module.exports = (srv) => {
  const { PurchaseRequest, RequestItem } = cds.entities('com.enterprise.approval');

  srv.on('validateVendor', 'Requests', async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, 'Request not found');
    if (!request.vendorId) return req.error(400, 'Please enter a Vendor ID first');

    const bpService = await cds.connect.to('S4HANA_SANDBOX');
    const { A_BusinessPartner } = bpService.entities;

    const vendor = await bpService.run(
      SELECT.one.from(A_BusinessPartner)
        .where({ BusinessPartner: request.vendorId })
        .columns('BusinessPartner', 'BusinessPartnerName', 'Industry')
    );

    if (!vendor) return req.error(404, `Vendor '${request.vendorId}' not found in SAP system`);

    await UPDATE(PurchaseRequest).set({
      vendorName    : vendor.BusinessPartnerName || 'N/A',
      vendorIndustry: vendor.Industry || 'N/A'
    }).where({ ID });

    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  srv.on('validateCostCenter', 'Requests', async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(PurchaseRequest).where({ ID });
    if (!request) return req.error(404, 'Request not found');
    if (!request.costCenter) return req.error(400, 'Please enter a Cost Center first');

    const ccService = await cds.connect.to('API_COSTCENTER_SRV');
    const { A_CostCenter_2 } = ccService.entities;

    const results = await ccService.run(
      SELECT.from(A_CostCenter_2)
        .where({ CostCenter: request.costCenter, ControllingArea: 'A000' })
        .columns('CostCenter', 'ControllingArea', 'CostCenterName', 'CompanyCode')
        .limit(1)
    );

    const cc = results?.[0];
    if (!cc) return req.error(404, `Cost Center '${request.costCenter}' not found in SAP system`);

    await UPDATE(PurchaseRequest).set({
      costCenter: cc.CostCenter
    }).where({ ID });

    return await SELECT.one.from(PurchaseRequest).where({ ID });
  });

  srv.on('validateProduct', 'RequestItems', async (req) => {
    const { ID } = req.params[0];

    const item = await SELECT.one.from(RequestItem).where({ ID });
    if (!item) return req.error(404, 'Item not found');
    if (!item.productId) return req.error(400, 'Please enter a Product ID first');

    const productService = await cds.connect.to('API_PRODUCT_SRV');
    const { A_Product } = productService.entities;

    const product = await productService.run(
      SELECT.one.from(A_Product)
        .where({ Product: item.productId })
        .columns('Product', 'ProductType')
    );

    if (!product) return req.error(404, `Product '${item.productId}' not found in SAP system`);

    return await SELECT.one.from(RequestItem).where({ ID });
  });
};
