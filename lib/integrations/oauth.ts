export interface TokenRefreshPayload {
  accessToken: string
  refreshToken: string
  expiresAt: number
  refreshAccessToken: (refreshToken: string) => Promise<{
    access_token: string
    refresh_token: string
    expires_at: number
  }>
}

export interface RefreshedTokenState {
  accessToken: string
  refreshToken: string
  expiresAt: number
  refreshed: boolean
}

export async function refreshAccessTokenIfNeeded(payload: TokenRefreshPayload): Promise<RefreshedTokenState> {
  const isExpired = payload.expiresAt <= Date.now()

  if (!isExpired) {
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresAt: payload.expiresAt,
      refreshed: false,
    }
  }

  const refreshedToken = await payload.refreshAccessToken(payload.refreshToken)

  return {
    accessToken: refreshedToken.access_token,
    refreshToken: refreshedToken.refresh_token,
    expiresAt: refreshedToken.expires_at,
    refreshed: true,
  }
}
