const cds = require('@sap/cds')

module.exports = (srv) => {
    const { DepartmentBudgets } = srv.entities

    srv.on('resetMonthlyBudget', async (req) => {
        const { costCenter, fiscalYear, fiscalMonth, budgetAmount } = req.data

        if (!costCenter || !fiscalYear || !fiscalMonth || budgetAmount == null) {
            return req.error(400, 'costCenter, fiscalYear, fiscalMonth and budgetAmount are required')
        }

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

        return `Budget reset for ${costCenter} — ${fiscalYear}/${fiscalMonth}: ${budgetAmount}`
    })
}