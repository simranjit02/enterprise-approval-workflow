import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendAlert } from '../srv/handlers/ans-helper'

const CREDENTIALS = { url: 'https://ans.example', oauth_url: 'https://oauth.example/token', client_id: 'id', client_secret: 'secret' }
const reply = (status, body = {}) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) })
const ALERT = { eventType: 'purchase-request.submitted', subject: 's', body: 'b' }

describe('sendAlert', () => {
  const env = process.env.VCAP_SERVICES
  let log, error

  beforeEach(() => {
    process.env.VCAP_SERVICES = JSON.stringify({ 'alert-notification': [{ credentials: CREDENTIALS }] })
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    error = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    process.env.VCAP_SERVICES = env
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('posts the event with the OAuth token', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(reply(200, { access_token: 'tok' })).mockResolvedValueOnce(reply(202))
    vi.stubGlobal('fetch', fetch)
    await sendAlert(ALERT)
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Basic ' + Buffer.from('id:secret').toString('base64'))
    expect(fetch.mock.calls[1][0]).toBe('https://ans.example/cf/producer/v1/resource-events')
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer tok')
    expect(log).toHaveBeenCalledWith('[ANS] Alert sent:', ALERT.eventType)
  })

  test('logs, and does not throw, when ANS rejects the event', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reply(200, { access_token: 'tok' })).mockResolvedValueOnce(reply(400, { error: 'bad' })))
    await sendAlert(ALERT)
    expect(log).not.toHaveBeenCalled()
    expect(error.mock.calls[0][1]).toMatch(/HTTP 400/)
  })

  test('logs, and does not throw, when the token request fails', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(reply(401))
    vi.stubGlobal('fetch', fetch)
    await sendAlert(ALERT)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0][1]).toMatch(/token request failed: HTTP 401/)
  })
})
