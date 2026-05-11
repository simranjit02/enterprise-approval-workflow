import { useState, useCallback } from 'react'
import { useDashboard } from './hooks/useDashboard'
import { odataPost } from './utils/odata'
import KpiCards from './components/KpiCards'
import RequestsByStatus from './components/RequestsByStatus'
import SpendByCategory from './components/SpendByCategory'
import SpendByDepartment from './components/SpendByDepartment'
import BudgetUtilization from './components/BudgetUtilization'
import RecentRequests from './components/RecentRequests'
import RecentAuditLogs from './components/RecentAuditLogs'
import Toast from './components/Toast'

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between mb-6">
      <p className="text-sm text-red-700">
        <span className="font-semibold">Failed to load data:</span> {message}
      </p>
      <button
        onClick={onRetry}
        className="ml-4 text-sm text-red-700 underline hover:no-underline shrink-0"
      >
        Retry
      </button>
    </div>
  )
}

export default function App() {
  const {
    loading, error, refresh,
    kpis, currentBudgets,
    auditLogs, requestsByStatus,
    spendByCategory, spendByDepartment,
    recentRequests,
  } = useDashboard()

  const [toast, setToast] = useState(null)
  const [resetting, setResetting] = useState(false)

  const dismissToast = useCallback(() => setToast(null), [])

  const handleResetBudget = async () => {
    setResetting(true)
    try {
      await odataPost('resetMonthlyBudget')
      setToast({ message: 'Monthly budgets reset successfully.', type: 'success' })
      refresh()
    } catch (e) {
      setToast({ message: e.message || 'Reset failed — check server logs.', type: 'error' })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6f7' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: '#0070f2' }}
            >
              EA
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-sm">Enterprise Approval</span>
              <span className="ml-2 text-xs text-gray-400 hidden sm:inline">Admin Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
              title="Refresh data"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Reset Monthly Budget — admin only action */}
            <button
              onClick={handleResetBudget}
              disabled={resetting || loading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors disabled:opacity-50"
              style={{ borderColor: '#0070f2', color: '#0070f2' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#0070f2'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#0070f2'
              }}
            >
              {resetting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Reset Monthly Budget
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {error && <ErrorBanner message={error} onRetry={refresh} />}

        {/* KPI Row */}
        <KpiCards kpis={kpis} loading={loading} />

        {/* Charts Row 1: Status pie + Category bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestsByStatus data={requestsByStatus} loading={loading} />
          <SpendByCategory data={spendByCategory} loading={loading} />
        </div>

        {/* Charts Row 2: Department bar + Budget progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendByDepartment data={spendByDepartment} loading={loading} />
          <BudgetUtilization budgets={currentBudgets} loading={loading} />
        </div>

        {/* Recent Requests table */}
        <RecentRequests requests={recentRequests} loading={loading} />

        {/* Recent Audit Logs table */}
        <RecentAuditLogs logs={auditLogs} loading={loading} />

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 text-xs text-gray-400 text-center">
        Enterprise Approval Workflow — Admin Dashboard &nbsp;·&nbsp; Data from{' '}
        <code className="font-mono">/odata/v4/approval</code>
      </footer>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
    </div>
  )
}
