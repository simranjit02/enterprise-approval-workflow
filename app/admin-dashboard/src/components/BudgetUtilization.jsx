import { fmt } from '../utils/formatters'
import { SkeletonProgressList } from './Skeleton'

function utilColor(pct) {
  if (pct > 90) return { bar: '#bb0000', text: 'text-red-700', bg: 'bg-red-50' }
  if (pct > 70) return { bar: '#e9730c', text: 'text-orange-700', bg: 'bg-orange-50' }
  return { bar: '#107e3e', text: 'text-green-700', bg: 'bg-green-50' }
}

function BudgetRow({ budget }) {
  const consumed = budget.consumedAmount ?? 0
  const reserved = budget.reservedAmount ?? 0
  const allocation = budget.monthlyAllocation || 1
  const usedPct = Math.min(((consumed + reserved) / allocation) * 100, 100)
  const consumedPct = Math.min((consumed / allocation) * 100, 100)
  const { bar, text, bg } = utilColor(usedPct)

  return (
    <div className={`rounded-lg px-4 py-3 mb-2 last:mb-0 ${bg}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-700 truncate">{budget.costCenter}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            {fmt.currency(consumed + reserved)} / {fmt.currency(allocation)}
          </span>
        </div>
        <span className={`text-xs font-bold shrink-0 ml-2 ${text}`}>
          {fmt.percent(usedPct)}
        </span>
      </div>

      {/* stacked bar: consumed (solid) + reserved (lighter) */}
      <div className="h-2 w-full bg-white rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className="h-full rounded-l-full transition-all duration-500"
            style={{ width: `${consumedPct}%`, backgroundColor: bar }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${Math.max(0, usedPct - consumedPct)}%`, backgroundColor: bar + '55' }}
          />
        </div>
      </div>

      <div className="flex gap-4 mt-1.5">
        <span className="text-xs text-gray-500">
          <span className="font-medium" style={{ color: bar }}>●</span> Consumed {fmt.currency(consumed)}
        </span>
        <span className="text-xs text-gray-500">
          <span className="font-medium text-gray-400">●</span> Reserved {fmt.currency(reserved)}
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          Remaining {fmt.currency(budget.remainingAmount ?? 0)}
        </span>
      </div>
    </div>
  )
}

export default function BudgetUtilization({ budgets, loading }) {
  if (loading) return <SkeletonProgressList />

  const isEmpty = !budgets?.length

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Budget Utilization per Cost Center</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span><span className="font-bold text-red-600">■</span> &gt;90%</span>
          <span><span className="font-bold text-orange-500">■</span> 70–90%</span>
          <span><span className="font-bold text-green-600">■</span> &lt;70%</span>
        </div>
      </div>
      {isEmpty ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
          No budget records for current month
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-1">
          {budgets.map(b => (
            <BudgetRow key={`${b.costCenter}-${b.fiscalYear}-${b.fiscalMonth}`} budget={b} />
          ))}
        </div>
      )}
    </div>
  )
}
