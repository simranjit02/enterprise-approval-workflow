import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'border-green-500 bg-green-50 text-green-900',
    error: 'border-red-500 bg-red-50 text-red-900',
  }

  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 border-l-4 rounded shadow-lg px-4 py-3 max-w-sm w-full ${styles[type]}`}
    >
      {icons[type]}
      <p className="flex-1 text-sm leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-50 hover:opacity-100 text-xl leading-none ml-1"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}
