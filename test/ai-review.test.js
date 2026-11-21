const cds = require('@sap/cds')
const { GET, POST, expect } = cds.test(__dirname + '/..')

const REQUESTER = { auth: { username: 'requester@company.com', password: 'requester' } }
const MANAGER   = { auth: { username: 'manager@company.com',   password: 'manager'   } }

const REQUEST_ID = 'b3000000-0000-0000-0000-000000000003'
const URL = `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.aiReview`

// A fake model that replays the given replies in order and records what it was sent.
const scripted = (...replies) => {
  const calls = []
  cds.services.ApprovalService._llm = async (params) => {
    calls.push(structuredClone(params.contents))
    const reply = replies[Math.min(calls.length, replies.length) - 1]
    if (reply instanceof Error) throw reply
    return reply
  }
  return calls
}
const callTool = (name, args) => ({
  functionCalls: [{ id: 'c1', name, args }],
  candidates: [{ content: { role: 'model', parts: [{ functionCall: { id: 'c1', name, args } }] } }],
})
const answer = (text) => ({ functionCalls: undefined, text })

describe('aiReview action', () => {
  let llm
  beforeAll(() => { llm = cds.services.ApprovalService._llm })
  afterAll(() => { cds.services.ApprovalService._llm = llm })

  beforeEach(async () => {
    const { PurchaseRequest, AuditLog } = cds.entities('com.enterprise.approval')
    await DELETE.from(AuditLog)
    await DELETE.from(PurchaseRequest).where({ ID: REQUEST_ID })
    await INSERT.into(PurchaseRequest).entries({
      ID: REQUEST_ID, title: 'Laptops', status: 'IN_APPROVAL', category: 'IT', priority: 'HIGH',
      costCenter: '10101101', totalAmount: 1000, currency: 'EUR', createdBy: 'requester@company.com'
    })
  })

  it('runs the tools the model asks for and returns its verdict to a Manager', async () => {
    const calls = scripted(callTool('get_request', { requestId: REQUEST_ID }), answer('Looks fine.\nRecommendation: APPROVE'))
    const { data } = await POST(URL, {}, MANAGER)
    expect(data.aiReview).to.equal('Looks fine.\nRecommendation: APPROVE')

    // Turn 2 must carry the tool's real result back to the model.
    const toolResult = calls[1].at(-1).parts[0].functionResponse
    expect(toolResult.name).to.equal('get_request')
    expect(toolResult.response.result.request.title).to.equal('Laptops')

    const { AuditLog } = cds.entities('com.enterprise.approval')
    const log = await SELECT.one.from(AuditLog).where({ request_ID: REQUEST_ID, action: 'AI_REVIEW' })
    expect(log.performedBy).to.equal('manager@company.com')
    expect(JSON.parse(log.newValue).tools).to.deep.equal(['get_request'])
  })

  it('saves the review, splits off the suggested comment, and hides both from the requester', async () => {
    scripted(answer('Justification is vague.\nRecommendation: NEEDS INFO\nComment to requester: Please explain why the laptops are needed.'))
    const { data } = await POST(URL, {}, MANAGER)
    expect(data.aiReview).to.equal('Justification is vague.\nRecommendation: NEEDS INFO')
    expect(data.aiSuggestedComment).to.equal('Please explain why the laptops are needed.')

    const READ = `/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)`
    const { data: forManager } = await GET(READ, MANAGER)
    expect(forManager.aiReview).to.equal('Justification is vague.\nRecommendation: NEEDS INFO')
    expect(forManager.aiSuggestedComment).to.equal('Please explain why the laptops are needed.')
    expect(forManager.aiReviewedAt).to.exist

    const { data: forRequester } = await GET(READ, REQUESTER)
    expect(forRequester.aiReview).to.equal(null)
    expect(forRequester.aiSuggestedComment).to.equal(null)
  })

  it('rejecting clears the saved review, so the requester\'s edit draft never copies it', async () => {
    const { ApprovalStep, PurchaseRequest } = cds.entities('com.enterprise.approval')
    await DELETE.from(ApprovalStep).where({ request_ID: REQUEST_ID })
    await INSERT.into(ApprovalStep).entries({
      request_ID: REQUEST_ID, stepNumber: 1, approverRole: 'Manager', approverUserId: 'Manager', stepStatus: 'ACTIVE', decision: 'PENDING'
    })
    scripted(answer('Recommendation: REJECT\nComment to requester: Too expensive.'))
    await POST(URL, {}, MANAGER)
    await POST(`/odata/v4/approval/Requests(ID=${REQUEST_ID},IsActiveEntity=true)/ApprovalService.reject`, { comment: 'Too expensive.' }, MANAGER)
    const row = await SELECT.one.from(PurchaseRequest).where({ ID: REQUEST_ID })
    expect(row.status).to.equal('REJECTED')
    expect(row.aiReview).to.equal(null)
    expect(row.aiSuggestedComment).to.equal(null)
  })

  it('only runs on requests waiting for approval', async () => {
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    await UPDATE(PurchaseRequest).set({ status: 'DRAFT' }).where({ ID: REQUEST_ID })
    const calls = scripted(answer('x'))
    const { status } = await POST(URL, {}, { ...MANAGER, validateStatus: () => true })
    expect(status).to.equal(400)
    expect(calls).to.have.length(0)
  })

  it('a failing tool goes back to the model as an error instead of failing the review', async () => {
    const calls = scripted(callTool('no_such_tool', {}), answer('Recommendation: NEEDS INFO'))
    const { data } = await POST(URL, {}, MANAGER)
    expect(data.aiReview).to.equal('Recommendation: NEEDS INFO')
    expect(calls[1].at(-1).parts[0].functionResponse.response.result.error).to.match(/Unknown tool/)
  })

  it('Requester cannot run it', async () => {
    scripted(answer('x'))
    const { status } = await POST(URL, {}, { ...REQUESTER, validateStatus: () => true })
    expect(status).to.equal(403)
  })

  it('stops after 8 turns and returns 503', async () => {
    const calls = scripted(callTool('get_request', { requestId: REQUEST_ID }))
    const { status } = await POST(URL, {}, { ...MANAGER, validateStatus: () => true })
    expect(status).to.equal(503)
    expect(calls).to.have.length(8)
  })

  it('a model error returns 503 and leaves the request unchanged', async () => {
    scripted(new Error('quota exceeded'))
    const { status } = await POST(URL, {}, { ...MANAGER, validateStatus: () => true })
    expect(status).to.equal(503)
    const { PurchaseRequest } = cds.entities('com.enterprise.approval')
    expect((await SELECT.one.from(PurchaseRequest).where({ ID: REQUEST_ID })).status).to.equal('IN_APPROVAL')
  })
})
