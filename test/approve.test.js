const cds = require('@sap/cds')
const { GET, POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }
const FINANCE   = { auth: { username: 'finance@company.com',   password: 'finance'   } }

const REQUEST_ID = 'b2000000-0000-0000-0000-000000000002'
const STEP_ID    = 'c1000000-0000-0000-0000-000000000001'

describe('approve action', () => {

  beforeEach(async () => {
    const { PurchaseRequest, ApprovalStep, AuditLog, WorkflowInstance } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(ApprovalStep)
    await DELETE.from(WorkflowInstance)
    await DELETE.from(PurchaseRequest)

    await INSERT.into(PurchaseRequest).entries({
      ID: REQUEST_ID,
      title: 'Test Approval Request',
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

  it('happy path: Manager approves and status becomes APPROVED', async () => {
    const { data: result } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.approve`,
      {},
      MANAGER
    )
    expect(result.status).to.equal('APPROVED')
    expect(result.completedAt).to.exist
  })

  it('sad path: Requester cannot approve (wrong role)', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.approve`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(403)
  })

  it('Finance can approve first when both steps are active', async () => {
    const { ApprovalStep } = cds.entities('com.enterprise.approval')
    await INSERT.into(ApprovalStep).entries({
      request_ID: REQUEST_ID,
      stepNumber: 2,
      approverRole: 'Finance',
      approverUserId: 'Finance',
      stepStatus: 'ACTIVE',
      decision: 'PENDING'
    })
    const url = `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.approve`
    const { data: afterFinance } = await POST(url, {}, FINANCE)
    expect(afterFinance.status).to.equal('IN_APPROVAL')
    const { data: forFinance } = await GET(`/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)`, FINANCE)
    expect(forFinance.isApprover).to.equal(false)
    const { data: afterManager } = await POST(url, {}, MANAGER)
    expect(afterManager.status).to.equal('APPROVED')
  })

  it('sad path: Finance cannot approve a Manager step', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.approve`,
      {},
      { ...FINANCE, validateStatus: () => true }
    )
    expect(status).to.equal(403)
  })

})