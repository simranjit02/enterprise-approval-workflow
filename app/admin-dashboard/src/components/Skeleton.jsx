export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-28 mb-4" />
      <div className="h-8 bg-gray-200 rounded w-36 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-20" />
    </div>
  )
}

export function SkeletonChart({ height = 280 }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40 mb-5" />
      <div className="bg-gray-100 rounded" style={{ height }} />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-40 mb-5" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded flex-1" />
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonProgressList() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-52 mb-5" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-10" />
          </div>
          <div className="h-2 bg-gray-100 rounded-full w-full" />
        </div>
      ))}
    </div>
  )
}
