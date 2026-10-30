const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }

const REQUEST_ID_WITHIN   = 'b5000000-0000-0000-0000-000000000005'
const REQUEST_ID_EXCEEDED = 'b6000000-0000-0000-0000-000000000006'

describe('budget check on submit', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)

    await INSERT.into(PurchaseRequest).entries([
      {
        ID: REQUEST_ID_WITHIN,
        title: 'Within Budget Request',
        status: 'DRAFT',
        priority: 'HIGH',
        category: 'IT',
        costCenter: '10101101',
        costCenterName: 'Engineering',
        totalAmount: 1000,
        budgetCheckStatus: 'UNCHECKED',
        currency: 'EUR',
        createdBy: 'requester@company.com'
      },
      {
        ID: REQUEST_ID_EXCEEDED,
        title: 'Exceeded Budget Request',
        status: 'DRAFT',
        priority: 'HIGH',
        category: 'IT',
        costCenter: '10101601',
        costCenterName: 'Operations',
        totalAmount: 9999,
        budgetCheckStatus: 'UNCHECKED',
        currency: 'EUR',
        createdBy: 'requester@company.com'
      }
    ])
  })

  it('happy path: request within budget gets budgetCheckStatus WITHIN', async () => {
    const { data: result } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID_WITHIN},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      REQUESTER
    )
    expect(result.status).to.equal('IN_APPROVAL')
    expect(result.budgetCheckStatus).to.equal('WITHIN')
  })

  it('reserve stores its month and cannot overspend', async () => {
    const { PurchaseRequest, DepartmentBudget } = cds.entities('com.enterprise.approval')
    const now = new Date()
    const period = { costCenter: 'TEST-CC', fiscalYear: now.getFullYear(), fiscalMonth: now.getMonth() + 1 }
    await DELETE.from(DepartmentBudget).where({ costCenter: 'TEST-CC' })
    await INSERT.into(DepartmentBudget).entries({ ...period, monthlyAllocation: 5000, consumedAmount: 0, reservedAmount: 0, remainingAmount: 5000 })
    const ids = ['b8000000-0000-0000-0000-000000000001', 'b8000000-0000-0000-0000-000000000002']
    await INSERT.into(PurchaseRequest).entries(ids.map(ID => ({
      ID, title: 'x', status: 'DRAFT', costCenter: 'TEST-CC', totalAmount: 3000, createdBy: 'requester@company.com'
    })))

    const submit = ID => POST(
      `/odata/v4/approval/Requests(ID=${ID},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    const results = await Promise.all(ids.map(submit))
    expect(results.map(r => r.status).sort()).to.deep.equal([200, 400])

    const budget = await SELECT.one.from(DepartmentBudget).where(period)
    expect(Number(budget.remainingAmount)).to.equal(2000)
    expect(Number(budget.reservedAmount)).to.equal(3000)

    const ok = results.find(r => r.status === 200).data
    expect(ok.budgetFiscalYear).to.equal(period.fiscalYear)
    expect(ok.budgetFiscalMonth).to.equal(period.fiscalMonth)
  })

  it('approve consumes from the month the budget was reserved in', async () => {
    const { PurchaseRequest, ApprovalStep, DepartmentBudget } = cds.entities('com.enterprise.approval')
    const june = { costCenter: '10101101', fiscalYear: 2026, fiscalMonth: 6 }
    const before = await SELECT.one.from(DepartmentBudget).where(june)

    await UPDATE(PurchaseRequest)
      .set({ status: 'IN_APPROVAL', budgetCheckStatus: 'WITHIN', budgetFiscalYear: 2026, budgetFiscalMonth: 6 })
      .where({ ID: REQUEST_ID_WITHIN })
    await INSERT.into(ApprovalStep).entries({
      request_ID: REQUEST_ID_WITHIN, stepNumber: 1, approverRole: 'Manager', approverUserId: 'Manager', stepStatus: 'ACTIVE', decision: 'PENDING'
    })

    await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID_WITHIN},IsActiveEntity=true)/ApprovalService.approve`,
      {},
      { auth: { username: 'manager@company.com', password: 'manager' } }
    )

    const after = await SELECT.one.from(DepartmentBudget).where(june)
    expect(Number(after.consumedAmount) - Number(before.consumedAmount)).to.equal(1000)
    expect(Number(before.reservedAmount) - Number(after.reservedAmount)).to.equal(1000)
  })

  it('sad path: request exceeding budget is blocked with 400', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID_EXCEEDED},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

})