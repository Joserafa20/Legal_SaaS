import api from './api'

export interface CaseDocument {
  id: number
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  uploaded_by_id?: number
  created_at: string
}

export const caseDocumentService = {
  async list(caseId: string): Promise<CaseDocument[]> {
    const response = await api.get(`/cases/${caseId}/documents`)
    return response.data || []
  },

  async upload(caseId: string, file: File): Promise<CaseDocument> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/cases/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getDownloadUrl(fileUrl: string): string {
    return fileUrl
  },
}
