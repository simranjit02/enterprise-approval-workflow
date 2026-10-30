const cds = require('@sap/cds')
const { POST, expect } = cds.test(__dirname + '/..')

const ADMIN = { auth: { username: 'test@company.com', password: 'test' } }

describe('resetMonthlyBudget', () => {

  it('keeps reservations of requests still in approval', async () => {
    const { DepartmentBudget, AuditLog } = cds.entities('com.enterprise.approval')
    // seed row: 10101101, 2026/6, reserved 500
    await POST('/odata/v4/admin/resetMonthlyBudget',
      { costCenter: '10101101', fiscalYear: 2026, fiscalMonth: 6, budgetAmount: 10000 }, ADMIN)

    const row = await SELECT.one.from(DepartmentBudget).where({ costCenter: '10101101', fiscalYear: 2026, fiscalMonth: 6 })
    expect(Number(row.monthlyAllocation)).to.equal(10000)
    expect(Number(row.consumedAmount)).to.equal(0)
    expect(Number(row.reservedAmount)).to.equal(500)
    expect(Number(row.remainingAmount)).to.equal(9500)

    const log = await SELECT.one.from(AuditLog).where({ entityId: row.ID })
    expect(log.action).to.equal('BUDGET_RESET')
  })
})
