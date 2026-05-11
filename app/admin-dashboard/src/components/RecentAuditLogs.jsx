import { fmt } from '../utils/formatters'
import { SkeletonTable } from './Skeleton'

const ACTION_BADGE = {
  SUBMITTED:   'bg-blue-100 text-blue-700',
  RESUBMITTED: 'bg-blue-50 text-blue-500',
  APPROVED:    'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
  CANCELLED:   'bg-gray-100 text-gray-500',
}

export default function RecentAuditLogs({ logs, loading }) {
  if (loading) return <SkeletonTable />

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Audit Logs</h2>
      {!logs?.length ? (
        <div className="flex items-center justify-center h-24 text-sm text-gray-400">No audit logs yet</div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Action', 'Entity', 'Performed By', 'Timestamp'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 last:pr-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.ID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${ACTION_BADGE[log.action] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500 text-xs whitespace-nowrap">
                    {log.entityName ?? '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-700">
                    {log.performedBy ?? '—'}
                  </td>
                  <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">
                    {fmt.datetime(log.createdAt)}
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
