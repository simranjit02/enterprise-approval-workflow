import { useState, useEffect, useCallback } from 'react'
import { odataGet } from '../utils/odata'

const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH = now.getMonth() + 1

function groupSum(arr, keyFn, valFn) {
  const map = arr.reduce((acc, item) => {
    const k = keyFn(item)
    if (!k) return acc
    acc[k] = (acc[k] ?? 0) + (valFn(item) ?? 0)
    return acc
  }, {})
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function useDashboard() {
  const [requests, setRequests] = useState([])
  const [budgets, setBudgets] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reqs, buds, logs] = await Promise.all([
        odataGet(
          'Requests',
          '$select=ID,requestNumber,title,status,totalAmount,category,department,priority,submittedAt&$top=500'
        ),
        odataGet(
          'DepartmentBudget',
          '$select=costCenter,monthlyAllocation,consumedAmount,reservedAmount,remainingAmount,fiscalYear,fiscalMonth'
        ),
        odataGet(
          'AuditLogs',
          '$select=ID,action,performedBy,entityName,createdAt&$orderby=createdAt desc&$top=10'
        ),
      ])
      setRequests(reqs)
      setBudgets(buds)
      setAuditLogs(logs)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const currentBudgets = budgets.filter(
    b => b.fiscalYear === CURRENT_YEAR && b.fiscalMonth === CURRENT_MONTH
  )

  const totalApprovedSpend = requests
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, r) => sum + (r.totalAmount ?? 0), 0)

  const avgBudgetUtilization = currentBudgets.length
    ? currentBudgets.reduce(
        (sum, b) => sum + ((b.consumedAmount ?? 0) / (b.monthlyAllocation || 1)) * 100,
        0
      ) / currentBudgets.length
    : 0

  const kpis = {
    totalRequests: requests.length,
    pendingApproval: requests.filter(r => r.status === 'IN_APPROVAL').length,
    totalApprovedSpend,
    avgBudgetUtilization,
  }

  // ── Chart data ───────────────────────────────────────────────────────────────
  const requestsByStatus = Object.entries(
    requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const spendByCategory = groupSum(requests, r => r.category, r => r.totalAmount)
  const spendByDepartment = groupSum(requests, r => r.department, r => r.totalAmount)

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.submittedAt ?? 0) - new Date(a.submittedAt ?? 0))
    .slice(0, 10)

  return {
    loading,
    error,
    refresh,
    kpis,
    budgets,
    currentBudgets,
    auditLogs,
    requestsByStatus,
    spendByCategory,
    spendByDepartment,
    recentRequests,
  }
}
