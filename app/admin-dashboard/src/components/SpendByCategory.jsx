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

export default function SpendByCategory({ data, loading }) {
  if (loading) return <SkeletonChart height={280} />

  const isEmpty = !data?.length

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Spend by Category</h2>
      {isEmpty ? (
        <div className="flex items-center justify-center h-64 text-sm text-gray-400">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6a6d70' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => fmt.currency(v)}
              tick={{ fontSize: 10, fill: '#6a6d70' }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f6f7' }} />
            <Bar dataKey="value" fill="#0070f2" radius={[3, 3, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
