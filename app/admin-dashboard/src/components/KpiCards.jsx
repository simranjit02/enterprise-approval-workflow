import { fmt } from '../utils/formatters'
import { SkeletonCard } from './Skeleton'

function Card({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 flex items-start gap-4 border-t-4" style={{ borderTopColor: accent }}>
      <div
        className="rounded-lg p-3 shrink-0"
        style={{ backgroundColor: accent + '18' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

const TotalIcon = () => (
  <svg className="w-5 h-5" style={{ color: '#0070f2' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
  </svg>
)

const PendingIcon = () => (
  <svg className="w-5 h-5" style={{ color: '#f0ab00' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SpendIcon = () => (
  <svg className="w-5 h-5" style={{ color: '#107e3e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const BudgetIcon = () => (
  <svg className="w-5 h-5" style={{ color: '#e9730c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

export default function KpiCards({ kpis, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const budgetColor =
    kpis.avgBudgetUtilization > 90 ? '#bb0000'
    : kpis.avgBudgetUtilization > 70 ? '#e9730c'
    : '#107e3e'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card
        label="Total Requests"
        value={fmt.number(kpis.totalRequests)}
        sub="All time"
        icon={<TotalIcon />}
        accent="#0070f2"
      />
      <Card
        label="Pending Approval"
        value={fmt.number(kpis.pendingApproval)}
        sub="In approval workflow"
        icon={<PendingIcon />}
        accent="#f0ab00"
      />
      <Card
        label="Total Approved Spend"
        value={fmt.currency(kpis.totalApprovedSpend)}
        sub="Approved requests"
        icon={<SpendIcon />}
        accent="#107e3e"
      />
      <Card
        label="Avg Budget Utilized"
        value={fmt.percent(kpis.avgBudgetUtilization)}
        sub="Current month, all cost centers"
        icon={<BudgetIcon />}
        accent={budgetColor}
      />
    </div>
  )
}
