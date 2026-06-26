import api from './api'
import { Holiday } from '../types'

export const holidayService = {
  async getByRange(startDate: string, endDate: string): Promise<Holiday[]> {
    const response = await api.get('/holidays', { params: { start_date: startDate, end_date: endDate } })
    return response.data || []
  },
}
