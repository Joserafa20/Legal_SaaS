import api from './api'
import { User } from '../types'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  role_id?: number
}

interface BackendTokenResponse {
  access_token: string
  refresh_token: string
  user: BackendUser
}

interface BackendUser {
  id: number
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: { id: number; name: string; description?: string }
  is_active: boolean
  created_at: string
}

function mapBackendUser(u: BackendUser): User {
  return {
    id: String(u.id),
    email: u.email,
    name: u.full_name,
    full_name: u.full_name,
    role: u.role,
    phone: u.phone,
    avatar_url: u.avatar_url,
    createdAt: u.created_at,
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post<BackendTokenResponse>('/auth/login', credentials)
    const data = response.data
    return {
      user: mapBackendUser(data.user),
      token: data.access_token,
    }
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<BackendUser>('/auth/register', data)
    return mapBackendUser(response.data)
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await api.get<BackendUser>('/auth/me')
    return mapBackendUser(response.data)
  },
}
