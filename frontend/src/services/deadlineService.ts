import api from './api'
import { Deadline } from '../types'

export const deadlineService = {
  async getAll(params?: { startDate?: string; endDate?: string; caseId?: string }): Promise<Deadline[]> {
    if (params?.caseId) {
      const response = await api.get(`/deadlines/case/${params.caseId}`)
      return response.data.deadlines || []
    }
    return []
  },

  async getById(id: string): Promise<Deadline> {
    const response = await api.get(`/deadlines/${id}`)
    return response.data
  },

  async create(data: Partial<Deadline>): Promise<Deadline> {
    const response = await api.post('/deadlines', data)
    return response.data
  },

  async update(id: string, data: Partial<Deadline>): Promise<Deadline> {
    const response = await api.put(`/deadlines/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/deadlines/${id}`)
  },

  async markComplete(id: string): Promise<Deadline> {
    const response = await api.put(`/deadlines/${id}/complete`)
    return response.data
  },

  async getUpcoming(days: number = 7): Promise<Deadline[]> {
    const response = await api.get('/deadlines/upcoming', { params: { days_ahead: days } })
    const data = response.data
    return Array.isArray(data) ? data : []
  },

  async getOverdue(): Promise<Deadline[]> {
    return []
  },
}
