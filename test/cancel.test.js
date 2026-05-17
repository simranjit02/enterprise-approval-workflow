const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }

const REQUEST_ID = 'b4000000-0000-0000-0000-000000000004'

describe('cancel action', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)

    await INSERT.into(PurchaseRequest).entries({
      ID: REQUEST_ID,
      title: 'Test Cancel Request',
      status: 'DRAFT',
      priority: 'HIGH',
      category: 'IT',
      costCenter: '10101101',
      costCenterName: 'Engineering',
      totalAmount: 1000,
      budgetCheckStatus: 'UNCHECKED',
      currency: 'EUR',
      createdBy: 'requester@company.com'
    })
  })

  it('happy path: Requester cancels a DRAFT request', async () => {
    const { data: result } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.cancel`,
      {},
      REQUESTER
    )
    expect(result.status).to.equal('CANCELLED')
  })

  it('sad path: Manager cannot cancel (wrong role)', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.cancel`,
      {},
      { ...MANAGER, validateStatus: () => true }
    )
    expect(status).to.equal(403)
  })

  it('sad path: cannot cancel an IN_APPROVAL request', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ status: 'IN_APPROVAL' }).where({ ID: REQUEST_ID })

    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.cancel`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

})