import api from './api'
import { User } from '../types'

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users')
    return response.data || []
  },

  async create(data: { email: string; password: string; full_name: string; role_id: number; phone?: string }): Promise<User> {
    const response = await api.post('/users', data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
