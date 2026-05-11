const BASE = '/odata/v4/approval'
// mocked-auth: test@company.com has Requester + Manager + Finance + Admin roles
const AUTH = 'Basic ' + btoa('test@company.com:test')

const baseHeaders = {
  Authorization: AUTH,
  Accept: 'application/json',
}

export async function odataGet(entity, params = '') {
  const url = `${BASE}/${entity}${params ? '?' + params : ''}`
  const res = await fetch(url, { headers: baseHeaders })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.value ?? json
}

export async function odataPost(path, body = {}) {
  const url = `${BASE}/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `${res.status} ${res.statusText}`)
  }
  return res.json().catch(() => null)
}
