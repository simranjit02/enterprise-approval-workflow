const cds = require('@sap/cds')
const { GET, POST, PATCH, DELETE: DEL, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }
const FINANCE   = { auth: { username: 'finance@company.com',   password: 'finance'   } }
const ALL_ROLES = { auth: { username: 'test@company.com',      password: 'test'      } }
const fail = (user) => ({ ...user, validateStatus: () => true })

const ID = 'f0000000-0000-0000-0000-000000000001'
const action = (name) => `/odata/v4/approval/Requests(ID=${ID},IsActiveEntity=true)/ApprovalService.${name}`

describe('submit, approve and reject flow', () => {
  const now = new Date()
  const period = { costCenter: 'FLOW', fiscalYear: now.getFullYear(), fiscalMonth: now.getMonth() + 1 }

  const newRequest = async (fields) => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await INSERT.into(PurchaseRequest).entries({
      ID, title: 'Flow', status: 'DRAFT', costCenter: 'FLOW', costCenterName: 'Flow',
      currency: 'EUR', totalAmount: 1000, createdBy: 'requester@company.com', ...fields
    })
  }
  const stepsOf = async () => {
    const { ApprovalStep } = cds.entities('com.enterprise.approval')
    return (await SELECT.from(ApprovalStep).columns('approverRole').where({ request_ID: ID }).orderBy('stepNumber')).map(s => s.approverRole)
  }
  const budget = async () => SELECT.one.from(cds.entities('com.enterprise.approval').DepartmentBudget).where(period)

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, WorkflowInstance, AuditLog, DepartmentBudget } = cds.entities('com.enterprise.approval')
    for (const e of [ApprovalStep, WorkflowInstance, AuditLog, PurchaseRequest]) await DELETE.from(e)
    await DELETE.from(DepartmentBudget).where({ costCenter: 'FLOW' })
    await INSERT.into(DepartmentBudget).entries({ ...period, monthlyAllocation: 100000, consumedAmount: 0, reservedAmount: 0, remainingAmount: 100000 })
  })

  it('Finance must approve above the currency limit', async () => {
    await newRequest({ totalAmount: 9000 })
    await POST(action('submit'), {}, REQUESTER)
    expect(await stepsOf()).to.deep.equal(['Manager', 'Finance'])
  })

  it('Manager alone approves below the currency limit', async () => {
    await newRequest({ totalAmount: 4000 })
    await POST(action('submit'), {}, REQUESTER)
    expect(await stepsOf()).to.deep.equal(['Manager'])
  })

  it('the limit is per currency: 4900 GBP is above the GBP limit', async () => {
    await newRequest({ totalAmount: 4900, currency: 'GBP' })
    await POST(action('submit'), {}, REQUESTER)
    expect(await stepsOf()).to.deep.equal(['Manager', 'Finance'])
  })

  it('a currency without a limit always needs Finance', async () => {
    await newRequest({ totalAmount: 100, currency: 'NOK' })
    await POST(action('submit'), {}, REQUESTER)
    expect(await stepsOf()).to.deep.equal(['Manager', 'Finance'])
  })

  it('refuses a request in another currency than the cost center budget', async () => {
    await newRequest({ currency: 'EUR', costCenterCurrency: 'GBP' })
    const res = await POST(action('submit'), {}, fail(REQUESTER))
    expect(res.status).to.equal(400)
    expect(res.data.error.message).to.match(/budgets in GBP/)
    expect(Number((await budget()).reservedAmount)).to.equal(0)
  })

  it('one person cannot approve both steps', async () => {
    await newRequest({ totalAmount: 9000 })
    await POST(action('submit'), {}, REQUESTER)
    expect((await POST(action('approve'), {}, ALL_ROLES)).data.status).to.equal('IN_APPROVAL')

    const twice = await POST(action('approve'), {}, fail(ALL_ROLES))
    expect(twice.status).to.equal(403)
    expect(twice.data.error.message).to.match(/needs a different person/)

    expect((await POST(action('approve'), {}, FINANCE)).data.status).to.equal('APPROVED')
    const { WorkflowInstance } = cds.entities('com.enterprise.approval')
    expect((await SELECT.one.from(WorkflowInstance).where({ request_ID: ID })).status).to.equal('COMPLETED')
  })

  it('approving again after a resubmit is allowed', async () => {
    await newRequest({ totalAmount: 9000 })
    await POST(action('submit'), {}, REQUESTER)
    await POST(action('approve'), {}, MANAGER)
    await POST(action('reject'), { comment: 'Too much' }, FINANCE)
    await POST(action('submit'), {}, REQUESTER)
    expect((await POST(action('approve'), {}, MANAGER)).status).to.equal(200)
  })

  it('reject gives the reserved budget back', async () => {
    await newRequest({ totalAmount: 1000 })
    await POST(action('submit'), {}, REQUESTER)
    expect(Number((await budget()).reservedAmount)).to.equal(1000)

    await POST(action('reject'), { comment: 'No' }, MANAGER)
    const after = await budget()
    expect(Number(after.reservedAmount)).to.equal(0)
    expect(Number(after.remainingAmount)).to.equal(100000)
  })

  it('item numbers continue after a delete and the total follows', async () => {
    const { data: draft } = await POST('/odata/v4/approval/Requests', { title: 'x' }, REQUESTER)
    const base = `/odata/v4/approval/Requests(ID=${draft.ID},IsActiveEntity=false)`
    const item = (ID) => `/odata/v4/approval/RequestItems(ID=${ID},IsActiveEntity=false)`
    const ids = []
    for (let i = 0; i < 3; i++) {
      const { data } = await POST(`${base}/items`, { productName: 'P', unit: 'PC' }, REQUESTER)
      await PATCH(item(data.ID), { quantity: 1, unitPrice: 10 }, REQUESTER)
      ids.push(data.ID)
    }
    expect(Number((await GET(base, REQUESTER)).data.totalAmount)).to.equal(30)

    await DEL(item(ids[1]), REQUESTER)
    expect(Number((await GET(base, REQUESTER)).data.totalAmount)).to.equal(20)

    await POST(`${base}/items`, { productName: 'P', unit: 'PC' }, REQUESTER)
    const numbers = (await GET(`${base}/items`, REQUESTER)).data.value.map(i => i.itemNumber)
    expect(numbers).to.deep.equal([1, 3, 4])
  })
})
