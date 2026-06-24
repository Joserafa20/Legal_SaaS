import { Link } from 'react-router-dom'
import { Case } from '../../types'
import { FiCalendar, FiUser, FiFlag } from 'react-icons/fi'

interface CaseCardProps {
  caseData: Case
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }

  const priorityColors = {
    low: 'text-legal-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  }

  return (
    <Link
      to={`/cases/${caseData.id}`}
      className="block p-4 bg-white dark:bg-legal-800 rounded-xl border border-legal-200 dark:border-legal-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[caseData.status]}`}>
          {{'open':'Abierto','in_progress':'En Progreso','pending':'Pendiente','closed':'Cerrado'}[caseData.status] || caseData.status.replace('_', ' ')}
        </span>
        <FiFlag className={`w-4 h-4 ${priorityColors[caseData.priority]}`} />
      </div>

      <h3 className="text-lg font-semibold text-legal-900 dark:text-white mb-1">
        {caseData.title}
      </h3>

      <p className="text-sm text-legal-600 dark:text-legal-300 mb-3 line-clamp-2">
        {caseData.description}
      </p>

      <div className="flex items-center text-sm text-legal-500 dark:text-legal-400 space-x-4">
        <span className="flex items-center">
          <FiUser className="w-4 h-4 mr-1" />
          {caseData.clientName}
        </span>
        {caseData.nextDeadline && (
          <span className="flex items-center">
            <FiCalendar className="w-4 h-4 mr-1" />
            {new Date(caseData.nextDeadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-3 text-xs text-legal-400">
        Caso #{caseData.caseNumber}
      </div>
    </Link>
  )
}
