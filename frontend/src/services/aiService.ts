import api from './api'
import { AIMessage, ApiResponse } from '../types'

export const aiService = {
  async sendMessage(message: string, messages: AIMessage[], context?: { caseId?: string }) {
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const response = await api.post<ApiResponse<AIMessage>>('/ai/chat', { message, messages: history, context })
    return response.data.data
  },

  async getChatHistory(caseId?: string) {
    const params = caseId ? { caseId } : undefined
    const response = await api.get<ApiResponse<AIMessage[]>>('/ai/history', { params })
    return response.data.data
  },

  async analyzeDocument(documentId: string) {
    const response = await api.post<ApiResponse<{ summary: string; keyPoints: string[] }>>(`/ai/analyze/${documentId}`)
    return response.data.data
  },

  async getLegalResearch(query: string) {
    const response = await api.post<ApiResponse<{ results: string[]; sources: string[] }>>('/ai/research', { query })
    return response.data.data
  },

  async draftDocument(params: { type: string; caseId: string; instructions: string }) {
    const response = await api.post<ApiResponse<{ content: string }>>('/ai/draft', params)
    return response.data.data
  },

  async clearHistory(caseId?: string) {
    const params = caseId ? { caseId } : undefined
    const response = await api.delete<ApiResponse<void>>('/ai/history', { params })
    return response.data
  },
}
