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

  it('sad path: request exceeding budget is blocked with 400', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID_EXCEEDED},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

})