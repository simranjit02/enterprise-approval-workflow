"use strict";
const cds = require("@sap/cds");

module.exports = async (srv) => {
  const { DepartmentBudget, AuditLog } = cds.entities("com.enterprise.approval");

  srv.on("setMonthlyBudget", async (req) => {
    const { costCenter, fiscalYear, fiscalMonth, budgetAmount } = req.data;

    // validate inputs
    if (!costCenter || !fiscalYear || !fiscalMonth || budgetAmount == null) {
      return req.error(400, "All parameters are required: costCenter, fiscalYear, fiscalMonth, budgetAmount");
    }

    if (parseFloat(budgetAmount) < 0) {
      return req.error(400, "Budget amount cannot be negative");
    }

    const existing = await SELECT.one.from(DepartmentBudget).where({
      costCenter,
      fiscalYear,
      fiscalMonth,
    });

    if (existing) {
      // UPDATE path — recalculate remaining
      const newRemaining =
        parseFloat(budgetAmount) -
        parseFloat(existing.consumedAmount) -
        parseFloat(existing.reservedAmount);

      await UPDATE(DepartmentBudget)
        .set({
          budgetAmount: parseFloat(budgetAmount),
          remainingAmount: Math.max(0, newRemaining),
        })
        .where({ costCenter, fiscalYear, fiscalMonth });

    } else {
      // INSERT path — fresh record
      await INSERT.into(DepartmentBudget).entries({
        costCenter,
        fiscalYear,
        fiscalMonth,
        budgetAmount: parseFloat(budgetAmount),
        consumedAmount: 0,
        reservedAmount: 0,
        remainingAmount: parseFloat(budgetAmount),
      });
    }

    await INSERT.into(AuditLog).entries({
      entityName: "DepartmentBudget",
      entityId: `${costCenter}-${fiscalYear}-${fiscalMonth}`,
      action: existing ? "BUDGET_UPDATED" : "BUDGET_SET",
      oldValue: existing ? String(existing.budgetAmount) : null,
      newValue: String(budgetAmount),
      performedBy: req.user?.id || "anonymous",
    });

    return existing
      ? `Budget updated for ${costCenter} — ${fiscalYear}/${fiscalMonth}: ${budgetAmount}`
      : `Budget set for ${costCenter} — ${fiscalYear}/${fiscalMonth}: ${budgetAmount}`;
  });
};