import apiClient, { initSanctum } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { LoginCredentials, LoginResponse } from '@/types/auth'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await initSanctum()
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT)
  },

  async me(): Promise<LoginResponse['data']> {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME)
    return response.data.data
  },
}
