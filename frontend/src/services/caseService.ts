import api from './api'
import { Case, TimelineEvent } from '../types'

function mapCase(bc: any): Case {
  return {
    id: String(bc.id),
    title: bc.title || '',
    description: bc.description || '',
    caseNumber: bc.case_number || '',
    case_number: bc.case_number,
    case_type: bc.case_type,
    jurisdiction: bc.jurisdiction,
    status: bc.status || 'open',
    priority: 'medium',
    clientName: bc.client_name || '',
    client_name: bc.client_name,
    clientEmail: bc.client_email || '',
    client_email: bc.client_email,
    client_phone: bc.client_phone,
    courtName: bc.court_name,
    court_name: bc.court_name,
    judgeName: bc.judge_name,
    judge_name: bc.judge_name,
    opposing_party: bc.opposing_party,
    createdAt: bc.created_at || '',
    created_at: bc.created_at,
    updatedAt: bc.updated_at || '',
    updated_at: bc.updated_at,
    assignedTo: bc.assigned_lawyer_id ? [String(bc.assigned_lawyer_id)] : [],
    assigned_lawyer_id: bc.assigned_lawyer_id,
    tags: [],
  }
}

export const caseService = {
  async getAll(params?: { status?: string; priority?: string; search?: string }): Promise<Case[]> {
    const response = await api.get('/cases', { params })
    return (response.data.cases || []).map(mapCase)
  },

  async getById(id: string): Promise<Case> {
    const response = await api.get(`/cases/${id}`)
    return mapCase(response.data)
  },

  async create(data: Partial<Case>): Promise<Case> {
    const body: any = {
      title: data.title,
      description: data.description,
      case_type: data.case_type,
      jurisdiction: data.jurisdiction,
      court_name: data.courtName || data.court_name,
      judge_name: data.judgeName || data.judge_name,
      opposing_party: data.opposing_party,
      client_name: data.clientName || data.client_name,
      client_email: data.clientEmail || data.client_email,
      client_phone: data.client_phone,
    }
    const response = await api.post('/cases', body)
    return mapCase(response.data)
  },

  async update(id: string, data: Partial<Case>): Promise<Case> {
    const response = await api.put(`/cases/${id}`, data)
    return mapCase(response.data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cases/${id}`)
  },

  async getTimeline(caseId: string): Promise<TimelineEvent[]> {
    const response = await api.get(`/cases/${caseId}/timeline`)
    const actions = response.data.actions || []
    return actions.map((a: any) => ({
      id: String(a.id),
      caseId: String(a.case_id),
      title: a.title,
      description: a.description || '',
      date: a.created_at,
      type: 'updated',
      userId: String(a.created_by_id),
      userName: '',
    }))
  },

  async search(query: string): Promise<Case[]> {
    const response = await api.get('/cases', { params: { search: query } })
    return (response.data.cases || []).map(mapCase)
  },

  async assign(caseId: string, lawyerId: number): Promise<Case> {
    const response = await api.post(`/cases/${caseId}/assign`, { lawyer_id: lawyerId })
    return mapCase(response.data)
  },
}
