import { describe, expect, it, vi } from 'vitest'

import { refreshAccessTokenIfNeeded } from './oauth'

describe('refreshAccessTokenIfNeeded', () => {
  it('refreshes an expired token before use', async () => {
    const refreshAccessToken = vi.fn().mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_at: Date.now() + 60_000,
    })

    const result = await refreshAccessTokenIfNeeded({
      accessToken: 'old-access-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() - 1000,
      refreshAccessToken,
    })

    expect(result.accessToken).toBe('new-access-token')
    expect(result.refreshToken).toBe('new-refresh-token')
    expect(result.refreshed).toBe(true)
    expect(refreshAccessToken).toHaveBeenCalledWith('refresh-token')
  })
})
