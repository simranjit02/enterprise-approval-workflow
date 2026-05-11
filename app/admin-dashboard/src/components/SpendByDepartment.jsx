import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { fmt } from '../utils/formatters'
import { SkeletonChart } from './Skeleton'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded shadow px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-500">{fmt.currency(payload[0].value)}</p>
    </div>
  )
}

export default function SpendByDepartment({ data, loading }) {
  if (loading) return <SkeletonChart height={Math.max(200, (data?.length ?? 4) * 44)} />

  const isEmpty = !data?.length
  // dynamic height: 44px per bar, min 220
  const chartHeight = Math.max(220, data.length * 44)

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Spend by Department</h2>
      {isEmpty ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={v => fmt.currency(v)}
              tick={{ fontSize: 10, fill: '#6a6d70' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6a6d70' }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f6f7' }} />
            <Bar dataKey="value" fill="#5899da" radius={[0, 3, 3, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
