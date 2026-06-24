export interface User {
  id: string
  email: string
  name: string
  full_name: string
  role: string | { name: string; id: number }
  phone?: string
  avatar_url?: string
  is_active?: boolean
  createdAt: string
}

export interface Case {
  id: string
  title: string
  description: string
  caseNumber: string
  case_number?: string
  case_type?: string
  jurisdiction?: string
  status: string
  priority: string
  clientName: string
  client_name?: string
  clientEmail: string
  client_email?: string
  client_phone?: string
  courtName?: string
  court_name?: string
  judgeName?: string
  judge_name?: string
  opposing_party?: string
  nextDeadline?: string
  createdAt: string
  created_at?: string
  updatedAt: string
  updated_at?: string
  assignedTo: string[]
  assigned_lawyer_id?: number
  tags: string[]
}

export interface Deadline {
  id: string
  caseId: string
  case_id?: string | number
  caseTitle: string
  title: string
  description: string
  dueDate: string
  due_date?: string
  start_date?: string
  status: string
  priority: string
  urgency?: string
  days_remaining?: number
  assigned_to_id?: number
}

export interface TimelineEvent {
  id: string
  caseId: string
  title: string
  description: string
  date: string
  type: string
  userId: string
  userName: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
