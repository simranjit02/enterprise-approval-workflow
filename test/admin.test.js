const cds = require('@sap/cds')
const { POST, PATCH, expect } = cds.test(__dirname + '/..')

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

  it('saving a budget in the UI recalculates remaining from live amounts', async () => {
    const { DepartmentBudget } = cds.entities('com.enterprise.approval')
    const ID = 'b1a2c3d4-0002-0002-0002-000000000002' // seed: consumed 1000, reserved 0
    const base = '/odata/v4/admin/DepartmentBudgets'
    await POST(`${base}(ID=${ID},IsActiveEntity=true)/AdminService.draftEdit`, { PreserveChanges: true }, ADMIN)
    await PATCH(`${base}(ID=${ID},IsActiveEntity=false)`, { monthlyAllocation: 9000 }, ADMIN)
    // a request reserves 300 while the admin's draft is open
    await UPDATE(DepartmentBudget).set({ reservedAmount: 300 }).where({ ID })
    await POST(`${base}(ID=${ID},IsActiveEntity=false)/AdminService.draftActivate`, {}, ADMIN)

    const row = await SELECT.one.from(DepartmentBudget).where({ ID })
    expect(Number(row.reservedAmount)).to.equal(300)
    expect(Number(row.remainingAmount)).to.equal(9000 - 1000 - 300)
  })
})
