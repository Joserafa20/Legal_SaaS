import { Deadline } from '../../types'

interface DeadlineBadgeProps { deadline: Deadline }

export default function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const getConfig = () => {
    if (deadline.status === 'completed') return { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' }
    const daysUntilDue = Math.ceil((new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue < 0) return { dot: 'bg-error', bg: 'bg-error-container', text: 'text-on-error-container' }
    if (daysUntilDue <= 3) return { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' }
    if (deadline.priority === 'high' || deadline.priority === 'urgent') return { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' }
    return { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' }
  }

  const c = getConfig()

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{deadline.title}</span>
      <span className="opacity-70">{new Date(deadline.dueDate).toLocaleDateString()}</span>
    </div>
  )
}
