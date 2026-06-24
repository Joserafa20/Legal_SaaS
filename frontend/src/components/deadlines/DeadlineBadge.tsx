import { Deadline } from '../../types'
import { FiClock, FiAlertTriangle, FiCheck } from 'react-icons/fi'

interface DeadlineBadgeProps {
  deadline: Deadline
}

export default function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const getBadgeStyle = () => {
    if (deadline.status === 'completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    }

    const dueDate = new Date(deadline.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    if (daysUntilDue <= 3) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }
    if (deadline.priority === 'high' || deadline.priority === 'urgent') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
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
