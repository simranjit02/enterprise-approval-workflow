const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }

const REQUEST_ID = 'b3000000-0000-0000-0000-000000000003'
const STEP_ID    = 'd1000000-0000-0000-0000-000000000001'

describe('reject action', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)

    await INSERT.into(PurchaseRequest).entries({
      ID: REQUEST_ID,
      title: 'Test Reject Request',
      status: 'IN_APPROVAL',
      priority: 'HIGH',
      category: 'IT',
      costCenter: '10101101',
      costCenterName: 'Engineering',
      totalAmount: 1000,
      budgetCheckStatus: 'WITHIN',
      currency: 'EUR',
      createdBy: 'requester@company.com'
    })

    await INSERT.into(ApprovalStep).entries({
      ID: STEP_ID,
      request_ID: REQUEST_ID,
      stepNumber: 1,
      approverRole: 'Manager',
      approverUserId: 'Manager',
      stepStatus: 'ACTIVE',
      decision: 'PENDING'
    })
  })

  it('happy path: Manager rejects and status becomes REJECTED', async () => {
    const { data: result } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.reject`,
      { comment: 'Budget not justified' },
      MANAGER
    )
    expect(result.status).to.equal('REJECTED')
    expect(result.completedAt).to.exist
  })

  it('sad path: cannot reject a request that is not IN_APPROVAL', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ status: 'DRAFT' }).where({ ID: REQUEST_ID })

    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.reject`,
      { comment: 'trying to reject a draft' },
      { ...MANAGER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

  it('sad path: Requester cannot reject (wrong role)', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.reject`,
      { comment: 'trying to reject' },
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(403)
  })

})