import { fmt, STATUS_BADGE, PRIORITY_BADGE } from '../utils/formatters'
import { SkeletonTable } from './Skeleton'

function Badge({ label, styles }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${styles}`}>
      {label?.replace(/_/g, ' ')}
    </span>
  )
}

export default function RecentRequests({ requests, loading }) {
  if (loading) return <SkeletonTable />

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Requests</h2>
      {!requests?.length ? (
        <div className="flex items-center justify-center h-24 text-sm text-gray-400">No requests yet</div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Request #', 'Title', 'Department', 'Amount', 'Priority', 'Status', 'Submitted'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.ID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {r.requestNumber ?? '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-800 max-w-[200px]">
                    <span className="block truncate" title={r.title}>{r.title ?? '—'}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">
                    {r.department ?? '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap font-medium">
                    {r.totalAmount != null ? fmt.currency(r.totalAmount) : '—'}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge label={r.priority} styles={PRIORITY_BADGE[r.priority] ?? 'bg-gray-100 text-gray-500'} />
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge label={r.status} styles={STATUS_BADGE[r.status] ?? 'bg-gray-100 text-gray-500'} />
                  </td>
                  <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">
                    {fmt.date(r.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
