const cds = require('@sap/cds')

module.exports = (srv) => {
    const { DepartmentBudgets } = srv.entities

    // Draft copies consumed/reserved when opened; take them from the live row so
    // reservations made meanwhile aren't overwritten, and derive remaining from them.
    srv.before('SAVE', 'DepartmentBudgets', async (req) => {
        if (Number(req.data.monthlyAllocation) < 0) {
            return req.error({ status: 400, message: 'Monthly budget cannot be negative', target: 'in/monthlyAllocation' })
        }
        const live = await SELECT.one.from(DepartmentBudgets)
            .columns('consumedAmount', 'reservedAmount')
            .where({ ID: req.data.ID })
        const consumedAmount = Number(live?.consumedAmount) || 0
        const reservedAmount = Number(live?.reservedAmount) || 0
        const remainingAmount = (Number(req.data.monthlyAllocation) || 0) - consumedAmount - reservedAmount
        Object.assign(req.data, { consumedAmount, reservedAmount, remainingAmount })
        if (remainingAmount < 0) {
            req.warn(`Monthly budget is ${-remainingAmount} lower than what is already consumed and reserved. New requests will be blocked`)
        }
    })

    srv.on('resetMonthlyBudget', async (req) => {
        const { costCenter, fiscalYear, fiscalMonth, budgetAmount } = req.data

        if (!costCenter || !fiscalYear || !fiscalMonth || budgetAmount == null) {
            return req.error(400, 'Cost center, year, month and budget amount are required')
        }
        if (fiscalMonth < 1 || fiscalMonth > 12) return req.error(400, 'Month must be between 1 and 12')
        if (Number(budgetAmount) < 0) return req.error(400, 'Budget amount cannot be negative')

        const existing = await SELECT.one.from(DepartmentBudgets).where({
            costCenter, fiscalYear, fiscalMonth
        })

        const ID = existing?.ID ?? cds.utils.uuid()
        if (existing) {
            // Keep reservedAmount: requests still in approval release or consume it later.
            await UPDATE(DepartmentBudgets)
                .set({
                    monthlyAllocation: budgetAmount,
                    consumedAmount: 0,
                    remainingAmount: Number(budgetAmount) - (Number(existing.reservedAmount) || 0),
                    lastResetAt: new Date().toISOString()
                })
                .where({ costCenter, fiscalYear, fiscalMonth })
        } else {
            await INSERT.into(DepartmentBudgets).entries({
                ID,
                costCenter,
                fiscalYear,
                fiscalMonth,
                monthlyAllocation: budgetAmount,
                consumedAmount: 0,
                reservedAmount: 0,
                remainingAmount: budgetAmount,
                lastResetAt: new Date().toISOString()
            })
        }

        const { AuditLog } = cds.entities('com.enterprise.approval')
        await INSERT.into(AuditLog).entries({
            entityName: 'DepartmentBudget',
            entityId: ID,
            action: existing ? 'BUDGET_RESET' : 'BUDGET_SET',
            oldValue: existing ? String(existing.monthlyAllocation) : null,
            newValue: String(budgetAmount),
            performedBy: req.user.id
        })

        if (existing && Number(budgetAmount) < Number(existing.reservedAmount)) {
            req.warn(`New budget is lower than the ${existing.reservedAmount} already reserved by requests in approval`)
        }
        req.notify(`Budget for ${costCenter} — ${fiscalYear}/${fiscalMonth} set to ${budgetAmount}`)
        return `Budget reset for ${costCenter} — ${fiscalYear}/${fiscalMonth}: ${budgetAmount}`
    })
}