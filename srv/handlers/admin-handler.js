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

        if (existing) {
            await UPDATE(DepartmentBudgets)
                .set({
                    monthlyAllocation: budgetAmount,
                    consumedAmount: 0,
                    reservedAmount: 0,
                    remainingAmount: budgetAmount,
                    lastResetAt: new Date().toISOString()
                })
                .where({ costCenter, fiscalYear, fiscalMonth })
        } else {
            await INSERT.into(DepartmentBudgets).entries({
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

        return `Budget reset for ${costCenter} — ${fiscalYear}/${fiscalMonth}: ${budgetAmount}`
    })
}