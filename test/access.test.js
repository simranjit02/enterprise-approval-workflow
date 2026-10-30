const cds = require('@sap/cds')
const { GET, POST, PATCH, DELETE: DEL, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const OTHER     = { auth: { username: 'test@company.com',      password: 'test'      } }
const VIEWER    = { auth: { username: 'noaccess@company.com',  password: 'noaccess'  } }

const REQUEST_ID = 'b7000000-0000-0000-0000-000000000007'
const BUDGET_ID  = 'b1a2c3d4-0001-0001-0001-000000000001'

describe('access control', () => {

  beforeEach(async () => {
    const { PurchaseRequest, AuditLog } = cds.entities('com.enterprise.approval')

    await DELETE.from(AuditLog)
    await DELETE.from(PurchaseRequest)
    await DELETE.from(cds.services.ApprovalService.entities.Requests.drafts)

    await INSERT.into(PurchaseRequest).entries({
      ID: REQUEST_ID,
      title: 'Owned by requester',
      status: 'DRAFT',
      costCenter: '10101101',
      totalAmount: 1000,
      currency: 'EUR',
      createdBy: 'requester@company.com'
    })
  })

  it('another requester cannot cancel someone else\'s request', async () => {
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.cancel`,
      {},
      { ...OTHER, validateStatus: () => true }
    )
    expect(status).to.be.oneOf([403, 404])
  })

  it('a requester only sees their own requests', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await INSERT.into(PurchaseRequest).entries({
      ID: 'b7000000-0000-0000-0000-000000000008',
      title: 'Someone else',
      status: 'DRAFT',
      createdBy: 'other@company.com'
    })
    const { data } = await GET(`/odata/v4/approval/Requests?$filter=IsActiveEntity eq true`, REQUESTER)
    expect(data.value.map(r => r.ID)).to.deep.equal([REQUEST_ID])
  })

  it('status cannot be set through a draft PATCH', async () => {
    const { data: draft } = await POST(`/odata/v4/approval/Requests`, { title: 'x' }, REQUESTER)
    await PATCH(
      `/odata/v4/approval/Requests(ID=${draft.ID},IsActiveEntity=false)`,
      { status: 'APPROVED', totalAmount: 1 },
      { ...REQUESTER, validateStatus: () => true }
    )
    const { data } = await GET(`/odata/v4/approval/Requests(ID=${draft.ID},IsActiveEntity=false)`, REQUESTER)
    expect(data.status).to.equal('DRAFT')
    expect(Number(data.totalAmount ?? 0)).to.not.equal(1)
  })

  it('a submitted request cannot be edited', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    const url = `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.draftEdit`
    await UPDATE(PurchaseRequest).set({ status: 'IN_APPROVAL' }).where({ ID: REQUEST_ID })
    const { status } = await POST(url, { PreserveChanges: true }, { ...REQUESTER, validateStatus: () => true })
    expect(status).to.equal(400)
  })

  it('a draft opened before submit cannot be saved after it', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await POST(`/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.draftEdit`, { PreserveChanges: true }, REQUESTER)
    await UPDATE(PurchaseRequest).set({ status: 'IN_APPROVAL' }).where({ ID: REQUEST_ID })
    const { status } = await POST(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=false)/ApprovalService.draftActivate`,
      {},
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

  it('a requester only sees audit logs of their own requests', async () => {
    const { PurchaseRequest, AuditLog } = cds.entities('com.enterprise.approval')
    const OTHER_ID = 'b7000000-0000-0000-0000-000000000009'
    await INSERT.into(PurchaseRequest).entries({ ID: OTHER_ID, title: 'Someone else', status: 'DRAFT', createdBy: 'other@company.com' })
    await INSERT.into(AuditLog).entries([
      { request_ID: REQUEST_ID, action: 'SUBMITTED' },
      { request_ID: OTHER_ID, action: 'SUBMITTED' }
    ])
    const { data } = await GET(`/odata/v4/approval/AuditLogs`, REQUESTER)
    expect(data.value.map(l => l.request_ID)).to.deep.equal([REQUEST_ID])
  })

  it('a submitted request cannot be deleted', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ status: 'IN_APPROVAL' }).where({ ID: REQUEST_ID })
    const { status } = await DEL(
      `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)`,
      { ...REQUESTER, validateStatus: () => true }
    )
    expect(status).to.equal(400)
  })

  it('a requester sees the approval steps of their own request', async () => {
    const { ApprovalStep } = cds.entities('com.enterprise.approval')
    await INSERT.into(ApprovalStep).entries({
      request_ID: REQUEST_ID, stepNumber: 1, approverRole: 'Manager', approverUserId: 'm',
      stepStatus: 'COMPLETED', decision: 'REJECTED', comment: 'too expensive'
    })
    const { data } = await GET(`/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/steps`, REQUESTER)
    expect(data.value.map(s => s.comment)).to.deep.equal(['too expensive'])
  })

  it('item changes in a draft update line and request totals', async () => {
    const { data: draft } = await POST(`/odata/v4/approval/Requests`, { title: 'x' }, REQUESTER)
    const base = `/odata/v4/approval/Requests(ID=${draft.ID},IsActiveEntity=false)`
    const { data: item } = await POST(`${base}/items`, { productName: 'Mouse', unit: 'EA', quantity: 1, unitPrice: 0 }, REQUESTER)
    await PATCH(`/odata/v4/approval/RequestItems(ID=${item.ID},IsActiveEntity=false)`, { quantity: 3, unitPrice: 25 }, REQUESTER)
    const { data } = await GET(base, REQUESTER)
    expect(Number(data.totalAmount)).to.equal(75)
  })

  it('Create is hidden for users who are not Requesters', async () => {
    const MANAGER = { auth: { username: 'manager@company.com', password: 'manager' } }
    expect((await GET(`/odata/v4/approval/UserInfo`, MANAGER)).data.hideCreate).to.equal(true)
    expect((await GET(`/odata/v4/approval/UserInfo`, REQUESTER)).data.hideCreate).to.equal(false)
  })

  it('non-admins cannot write DepartmentBudget', async () => {
    for (const user of [REQUESTER, VIEWER]) {
      const { status } = await PATCH(
        `/odata/v4/approval/DepartmentBudget(${BUDGET_ID})`,
        { remainingAmount: 999999 },
        { ...user, validateStatus: () => true }
      )
      expect(status).to.be.oneOf([403, 405])
    }
  })
})
