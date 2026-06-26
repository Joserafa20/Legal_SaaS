import { Link } from 'react-router-dom'
import { Case } from '../../types'
import { FiCalendar, FiUser, FiFlag } from 'react-icons/fi'

interface CaseCardProps {
  caseData: Case
}

const statusStyles: Record<string, { dot: string; label: string }> = {
  open: { dot: 'bg-primary', label: 'Abierto' },
  in_progress: { dot: 'bg-primary-container', label: 'En Progreso' },
  pending: { dot: 'bg-tertiary-500', label: 'Pendiente' },
  closed: { dot: 'bg-legal-400', label: 'Cerrado' },
}

const priorityStyles: Record<string, string> = {
  low: 'text-legal-400',
  medium: 'text-tertiary-500',
  high: 'text-tertiary-700',
  urgent: 'text-error',
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const status = statusStyles[caseData.status] || statusStyles.open
  const priorityColor = priorityStyles[caseData.priority] || priorityStyles.low

  return (
    <Link
      to={`/cases/${caseData.id}`}
      className="block card hover:shadow-ambient transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="text-xs font-medium text-legal-600">{status.label}</span>
        </span>
        <FiFlag className={`w-4 h-4 ${priorityColor}`} />
      </div>

      <h3 className="text-lg font-semibold font-display text-primary mb-1">
        {caseData.title}
      </h3>

      <p className="text-sm text-legal-500 mb-4 line-clamp-2">
        {caseData.description}
      </p>

      <div className="flex items-center text-sm text-legal-500 gap-4">
        <span className="flex items-center">
          <FiUser className="w-4 h-4 mr-1.5" />
          {caseData.clientName}
        </span>
        {caseData.nextDeadline && (
          <span className="flex items-center">
            <FiCalendar className="w-4 h-4 mr-1.5" />
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
