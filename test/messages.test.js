const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }
const ALL_ROLES = { auth: { username: 'test@company.com',      password: 'test'      } }
const ADMIN     = ALL_ROLES
const fail = (user) => ({ ...user, validateStatus: () => true })

const ID = 'e1000000-0000-0000-0000-000000000001'
const action = (name) => `/odata/v4/approval/Requests(ID=${ID},IsActiveEntity=true)/ApprovalService.${name}`
const errorOf = (res) => res.data.error.message

describe('user messages', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, WorkflowInstance, DepartmentBudget } = cds.entities('com.enterprise.approval')
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)
    await DELETE.from(DepartmentBudget).where({ costCenter: 'MSG-CC' })
    const now = new Date()
    await INSERT.into(DepartmentBudget).entries({
      costCenter: 'MSG-CC', fiscalYear: now.getFullYear(), fiscalMonth: now.getMonth() + 1,
      monthlyAllocation: 1000, consumedAmount: 0, reservedAmount: 0, remainingAmount: 1000
    })
    await INSERT.into(PurchaseRequest).entries({
      ID, title: 'Msg test', status: 'DRAFT', costCenter: 'MSG-CC', costCenterName: 'Msg',
      totalAmount: 100, currency: 'EUR', createdBy: 'requester@company.com'
    })
  })

  it('submit without items is refused', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ totalAmount: 0 }).where({ ID })
    const res = await POST(action('submit'), {}, fail(REQUESTER))
    expect(res.status).to.equal(400)
    expect(errorOf(res)).to.match(/at least one item/)
  })

  it('submit shows a success message', async () => {
    const res = await POST(action('submit'), {}, REQUESTER)
    const messages = JSON.parse(res.headers['sap-messages'])
    expect(messages[0].message).to.match(/^Request PR-\d{4}-\d{3} submitted for approval$/)
  })

  it('submit that leaves under 10% of the budget warns', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ totalAmount: 950 }).where({ ID })
    const res = await POST(action('submit'), {}, REQUESTER)
    expect(res.data.budgetCheckStatus).to.equal('WARNING')
    expect(res.headers['sap-messages']).to.match(/almost used up/)
  })

  it('reject needs a reason', async () => {
    await POST(action('submit'), {}, REQUESTER)
    const res = await POST(action('reject'), { comment: '  ' }, fail(MANAGER))
    expect(res.status).to.equal(400)
  })

  it('nobody can approve their own request', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ createdBy: 'test@company.com' }).where({ ID })
    await POST(action('submit'), {}, ALL_ROLES)
    const res = await POST(action('approve'), {}, fail(ALL_ROLES))
    expect(res.status).to.equal(403)
    expect(errorOf(res)).to.match(/your own request/)
  })

  it('saving a draft checks items and delivery date', async () => {
    const { data: draft } = await POST(`/odata/v4/approval/Requests`, {
      title: 'x', category: 'IT', priority: 'LOW', justification: 'y', currency: 'EUR',
      requestedDeliveryDate: '2000-01-01'
    }, REQUESTER)
    // set directly: going through the service would look the cost center up in S/4HANA
    await UPDATE(cds.services.ApprovalService.entities.Requests.drafts).set({ costCenter: 'MSG-CC' }).where({ ID: draft.ID })
    const base = `/odata/v4/approval/Requests(ID=${draft.ID},IsActiveEntity=false)`
    await POST(`${base}/items`, { productName: 'Mouse', unit: 'EA', quantity: 1, unitPrice: -5 }, REQUESTER)
    const res = await POST(`${base}/ApprovalService.draftActivate`, {}, fail(REQUESTER))
    expect(res.status).to.equal(400)
    const all = JSON.stringify(res.data.error)
    expect(all).to.match(/Delivery date cannot be in the past/)
    expect(all).to.match(/Item 1: unit price cannot be negative/)
  })

  it('budget reset refuses an invalid month', async () => {
    const res = await POST('/odata/v4/admin/resetMonthlyBudget',
      { costCenter: 'MSG-CC', fiscalYear: 2026, fiscalMonth: 13, budgetAmount: 10 }, fail(ADMIN))
    expect(res.status).to.equal(400)
    expect(errorOf(res)).to.match(/between 1 and 12/)
  })
})
