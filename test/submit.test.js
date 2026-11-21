const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }

const DRAFT_ID = 'b1000000-0000-0000-0000-000000000001'

describe('submit action', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)

    await INSERT.into(PurchaseRequest).entries({
      ID: DRAFT_ID,
      title: 'Test Laptop Purchase',
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

  it('happy path: DRAFT request moves to IN_APPROVAL', async () => {
    const { data: result } = await POST(
      `/odata/v4/approval/Requests(ID=${DRAFT_ID},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      REQUESTER
    )
    expect(result.status).to.equal('IN_APPROVAL')
    expect(result.requestNumber).to.match(/^PR-\d{4}-\d{3}$/)
    expect(result.submittedAt).to.exist
  })

  it('submit clears an AI review of the earlier version', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ aiReview: 'old', aiReviewedAt: new Date(), aiSuggestedComment: 'old' }).where({ ID: DRAFT_ID })
    await POST(`/odata/v4/approval/Requests(ID=${DRAFT_ID},IsActiveEntity=true)/ApprovalService.submit`, {}, REQUESTER)
    const row = await SELECT.one.from(PurchaseRequest).where({ ID: DRAFT_ID })
    expect([row.aiReview, row.aiReviewedAt, row.aiSuggestedComment]).to.deep.equal([null, null, null])
  })

  it('sad path: cannot submit a request that is already IN_APPROVAL', async () => {
    await POST(
      `/odata/v4/approval/Requests(ID=${DRAFT_ID},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      REQUESTER
    )
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${DRAFT_ID},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

  it('sad path: Manager cannot submit (wrong role)', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${DRAFT_ID},IsActiveEntity=true)/ApprovalService.submit`,
      {},
      { ...MANAGER, validateStatus: () => true }
    )
    expect(status).to.equal(403)
  })
})