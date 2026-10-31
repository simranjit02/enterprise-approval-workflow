const cds = require('@sap/cds')
const { POST, PATCH, GET, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const fail = { ...REQUESTER, validateStatus: () => true }

// Stub S/4 answers by entity name, so these tests run offline.
const S4_DATA = {
  'S4HANA_SANDBOX.A_Supplier': (w) => ({
    '10300001': { Supplier: '10300001', SupplierName: 'Inlandslieferant DE 1', PurchasingIsBlocked: false, DeletionIndicator: false },
    'BLOCKED':  { Supplier: 'BLOCKED',  SupplierName: 'Blocked Ltd',           PurchasingIsBlocked: true,  DeletionIndicator: false },
    '1000032':  { Supplier: '1000032',  SupplierName: 'Avante Limited',        PurchasingIsBlocked: false, DeletionIndicator: false },
  })[w.Supplier],
  'S4HANA_SANDBOX.A_BusinessPartnerAddress': () => ({ Country: 'DE' }),
  // 1000032 like the sandbox: no purchasing currency, USD in company 1710, GBP in 1110
  'S4HANA_SANDBOX.A_SupplierPurchasingOrg': (w) => w.Supplier === '1000032' ? [{ PurchaseOrderCurrency: '' }] : [{ PurchaseOrderCurrency: 'EUR' }],
  'S4HANA_SANDBOX.A_SupplierCompany': (w) => w.Supplier === '1000032'
    ? [{ CompanyCode: '1710', Currency: 'USD' }, { CompanyCode: '1110', Currency: 'GBP' }]
    : [{ CompanyCode: '1010', Currency: 'EUR' }],
  'API_COSTCENTER_SRV.A_CostCenter_2': (w) => ({
    '11101901': { CostCenter: '11101901', CostCenterName: 'Back Office (GB)', CompanyCode: '1110', IsBlockedForCommitmentPosting: false },
  })[w.CostCenter],
  'API_PRODUCT_SRV.A_Product': (w) => w.Product === 'TG10' ? { Product: 'TG10', BaseUnit: 'PC', ProductGroup: 'L001' } : undefined,
  'API_PRODUCT_SRV.A_ProductDescription': () => ({ ProductDescription: 'Trad.Good 10' }),
}
const whereOf = (q) => {
  const w = {}, x = q.SELECT.where ?? []
  for (let i = 0; i < x.length; i++) if (x[i].ref && x[i + 1] === '=') w[x[i].ref[0]] = x[i + 2].val
  return w
}

describe('S/4HANA lookups', () => {
  let price
  before(async () => {
    for (const name of ['S4HANA_SANDBOX', 'API_PRODUCT_SRV', 'API_COSTCENTER_SRV']) {
      const srv = await cds.connect.to(name)
      srv.run = async (q) => S4_DATA[q.SELECT.from.ref[0]]?.(whereOf(q))
    }
    const info = await cds.connect.to('API_INFORECORD_PROCESS_SRV')
    info.send = async () => price
  })

  const newDraft = async (currency = 'EUR') => {
    const { data } = await POST('/odata/v4/approval/Requests', { title: 'S4', currency }, REQUESTER)
    return `/odata/v4/approval/Requests(ID=${data.ID},IsActiveEntity=false)`
  }

  it('value help search becomes a filter, because S/4 rejects $search', async () => {
    const s4 = await cds.connect.to('S4HANA_SANDBOX')
    const run = s4.run
    let sent
    s4.run = async (q) => { sent = q; return [] }
    try {
      await GET(`/odata/v4/approval/VendorHelp?$search=bechtle`, REQUESTER)
    } finally { s4.run = run }
    expect(sent.SELECT.search).to.equal(undefined)
    expect(JSON.stringify(sent.SELECT.where)).to.match(/"func":"contains".*"val":"bechtle"/)
  })

  it('fills vendor name, country and currency, refuses blocked vendors', async () => {
    const draft = await newDraft('USD')
    const { data } = await PATCH(draft, { vendorId: '10300001' }, REQUESTER)
    expect(data).to.include({ vendorName: 'Inlandslieferant DE 1', vendorCountry: 'DE', currency: 'EUR' })

    const res = await PATCH(draft, { vendorId: 'BLOCKED' }, fail)
    expect(res.status).to.equal(400)
    expect(res.data.error.message).to.match(/blocked for purchasing/)
  })

  it('vendor without purchasing currency takes the cost center company currency', async () => {
    const draft = await newDraft(null)
    const res = await PATCH(draft, { vendorId: '1000032' }, REQUESTER)
    expect(res.data.currency).to.equal(null)
    expect(res.headers['sap-messages']).to.match(/no default currency/)

    const { data } = await PATCH(draft, { costCenter: '11101901' }, REQUESTER)
    expect(data).to.include({ costCenterName: 'Back Office (GB)', currency: 'GBP' })
  })

  it('fills product data and the agreed price per unit', async () => {
    price = [{ to_PurgInfoRecdOrgPlantData: { results: [{ NetPriceAmount: '24.70', MaterialPriceUnitQty: '2', Currency: 'EUR' }] } }]
    const draft = await newDraft()
    await PATCH(draft, { vendorId: '10300001' }, REQUESTER)
    const { data: item } = await POST(`${draft}/items`, {}, REQUESTER)
    const { data } = await PATCH(`/odata/v4/approval/RequestItems(ID=${item.ID},IsActiveEntity=false)`,
      { productId: 'TG10', quantity: 3 }, REQUESTER)
    expect(data).to.include({ productName: 'Trad.Good 10', unit: 'PC', productCategory: 'L001', unitPrice: 12.35 })
    expect((await GET(draft, REQUESTER)).data.totalAmount).to.equal(37.05)
  })

  it('picking the vendor after the product prices existing items', async () => {
    price = [{ to_PurgInfoRecdOrgPlantData: { results: [{ NetPriceAmount: '12.35', MaterialPriceUnitQty: '1', Currency: 'EUR' }] } }]
    const draft = await newDraft()
    const { data: item } = await POST(`${draft}/items`, {}, REQUESTER)
    const itemUrl = `/odata/v4/approval/RequestItems(ID=${item.ID},IsActiveEntity=false)`
    await PATCH(itemUrl, { productId: 'TG10', quantity: 2 }, REQUESTER)
    expect((await GET(itemUrl, REQUESTER)).data.unitPrice).to.equal(null)

    await PATCH(draft, { vendorId: '10300001' }, REQUESTER)
    expect((await GET(itemUrl, REQUESTER)).data).to.include({ unitPrice: 12.35, lineTotal: 24.7 })
    expect((await GET(draft, REQUESTER)).data.totalAmount).to.equal(24.7)
  })

  it('does not fill a price in another currency', async () => {
    price = [{ to_PurgInfoRecdOrgPlantData: { results: [{ NetPriceAmount: '15', MaterialPriceUnitQty: '1', Currency: 'USD' }] } }]
    const draft = await newDraft('EUR')
    await PATCH(draft, { vendorId: '10300001' }, REQUESTER)
    const { data: item } = await POST(`${draft}/items`, {}, REQUESTER)
    const res = await PATCH(`/odata/v4/approval/RequestItems(ID=${item.ID},IsActiveEntity=false)`, { productId: 'TG10' }, REQUESTER)
    expect(res.data.unitPrice).to.equal(null)
    expect(res.headers['sap-messages']).to.match(/15 USD, but the request is in EUR/)
  })
})
