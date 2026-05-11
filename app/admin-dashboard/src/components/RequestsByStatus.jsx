import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUS_COLORS } from '../utils/formatters'
import { SkeletonChart } from './Skeleton'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded shadow px-3 py-2 text-sm">
      <p className="font-medium text-gray-700">{name?.replace(/_/g, ' ')}</p>
      <p className="text-gray-500">{value} request{value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
      {payload.map(entry => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value.replace(/_/g, ' ')}
        </li>
      ))}
    </ul>
  )
}

export default function RequestsByStatus({ data, loading }) {
  if (loading) return <SkeletonChart height={280} />

  const isEmpty = !data?.length

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests by Status</h2>
      {isEmpty ? (
        <div className="flex items-center justify-center h-64 text-sm text-gray-400">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map(entry => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] ?? '#8c9ba5'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
