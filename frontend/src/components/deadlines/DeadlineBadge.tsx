import { Deadline } from '../../types'
import { FiClock, FiAlertTriangle, FiCheck } from 'react-icons/fi'

interface DeadlineBadgeProps {
  deadline: Deadline
}

export default function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  const getBadgeStyle = () => {
    if (deadline.status === 'completed') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    }

    const dueDate = new Date(deadline.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) {
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
    }
    if (daysUntilDue <= 3) {
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    }
    if (deadline.priority === 'high' || deadline.priority === 'urgent') {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    }
    return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  }

  const getIcon = () => {
    if (deadline.status === 'completed') {
      return <FiCheck className="w-3.5 h-3.5" />
    }

    const dueDate = new Date(deadline.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0 || daysUntilDue <= 3) {
      return <FiAlertTriangle className="w-3.5 h-3.5" />
    }
    return <FiClock className="w-3.5 h-3.5" />
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      {getIcon()}
      <span>{deadline.title}</span>
      <span className="opacity-70">
        {new Date(deadline.dueDate).toLocaleDateString()}
      </span>
    </div>
  )
}
