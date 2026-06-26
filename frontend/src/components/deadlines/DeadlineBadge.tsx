import { Deadline } from '../../types'
import { FiClock, FiAlertTriangle, FiCheck } from 'react-icons/fi'

interface DeadlineBadgeProps {
  deadline: Deadline
}

export default function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const getBadgeStyle = () => {
    if (deadline.status === 'completed') {
      return 'bg-primary-container/10 text-primary-container'
    }

    const dueDate = new Date(deadline.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return 'bg-error-50 text-error'
    }
    if (daysUntilDue <= 3) {
      return 'bg-tertiary-50 text-tertiary-800'
    }
    if (deadline.priority === 'high' || deadline.priority === 'urgent') {
      return 'bg-tertiary-100 text-tertiary-700'
    }
    return 'bg-primary/5 text-primary-container'
  }

  const getIcon = () => {
    if (deadline.status === 'completed') {
      return <FiCheck className="w-4 h-4" />
    }

    const dueDate = new Date(deadline.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0 || daysUntilDue <= 3) {
      return <FiAlertTriangle className="w-4 h-4" />
    }
    return <FiClock className="w-4 h-4" />
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${getBadgeStyle()}`}>
      {getIcon()}
      <span>{deadline.title}</span>
      <span className="opacity-75">
        {new Date(deadline.dueDate).toLocaleDateString()}
      </span>
    </div>
  )
}
