export const fmt = {
  currency(val, curr = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val ?? 0)
  },

  number(val) {
    return new Intl.NumberFormat('en-US').format(val ?? 0)
  },

  percent(val) {
    return `${(val ?? 0).toFixed(1)}%`
  },

  date(val) {
    if (!val) return '—'
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(val))
  },

  datetime(val) {
    if (!val) return '—'
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(val))
  },
}

export const STATUS_COLORS = {
  DRAFT:             '#8c9ba5',
  SUBMITTED:         '#5899da',
  IN_APPROVAL:       '#f0ab00',
  APPROVED:          '#107e3e',
  REJECTED:          '#bb0000',
  CANCELLED:         '#6a6d70',
  BUDGET_ESCALATION: '#e78c07',
  BUDGET_REJECTED:   '#c35500',
  FAILED:            '#8b0000',
}

export const STATUS_BADGE = {
  DRAFT:             'bg-gray-100 text-gray-600',
  SUBMITTED:         'bg-blue-100 text-blue-700',
  IN_APPROVAL:       'bg-yellow-100 text-yellow-800',
  APPROVED:          'bg-green-100 text-green-800',
  REJECTED:          'bg-red-100 text-red-700',
  CANCELLED:         'bg-gray-200 text-gray-500',
  BUDGET_ESCALATION: 'bg-orange-100 text-orange-700',
  BUDGET_REJECTED:   'bg-orange-200 text-orange-900',
  FAILED:            'bg-red-200 text-red-900',
}

export const PRIORITY_BADGE = {
  LOW:      'bg-gray-100 text-gray-500',
  MEDIUM:   'bg-blue-50 text-blue-600',
  HIGH:     'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}
