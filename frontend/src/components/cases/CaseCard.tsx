import { Link } from 'react-router-dom'
import { Case } from '../../types'
import { FiCalendar, FiUser, FiFlag, FiArrowRight } from 'react-icons/fi'

interface CaseCardProps {
  caseData: Case
}

const statusConfig = {
  open: { label: 'Abierto', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  in_progress: { label: 'En Progreso', classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  pending: { label: 'Pendiente', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  closed: { label: 'Cerrado', classes: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' },
}

const priorityColors = {
  low: 'text-neutral-400 dark:text-neutral-500',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const status = statusConfig[caseData.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <Link
      to={`/cases/${caseData.id}`}
      className="card-hover p-5 group animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.classes}`}>
          {status.label}
        </span>
        <FiFlag className={`w-4 h-4 ${priorityColors[caseData.priority as keyof typeof priorityColors]} mt-0.5`} />
      </div>

      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {caseData.title}
      </h3>

      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
        {caseData.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
        <span className="flex items-center gap-1.5">
          <FiUser className="w-3.5 h-3.5" />
          {caseData.clientName}
        </span>
        {caseData.nextDeadline && (
          <span className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5" />
            {new Date(caseData.nextDeadline).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          #{caseData.caseNumber}
        </span>
        <FiArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}
