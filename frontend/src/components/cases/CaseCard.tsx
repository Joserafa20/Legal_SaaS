import { Link } from 'react-router-dom'
import { Case } from '../../types'
import { FiCalendar, FiUser, FiFlag, FiArrowRight } from 'react-icons/fi'

interface CaseCardProps {
  caseData: Case
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  open: { label: 'Abierto', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  in_progress: { label: 'En Progreso', dot: 'bg-blue-500', text: 'text-blue-700' },
  pending: { label: 'Pendiente', dot: 'bg-amber-500', text: 'text-amber-700' },
  closed: { label: 'Cerrado', dot: 'bg-outline', text: 'text-on-surface-variant' },
}

const priorityColors: Record<string, string> = {
  low: 'text-outline',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  urgent: 'text-error',
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const status = statusConfig[caseData.status] || statusConfig.pending

  return (
    <Link to={`/cases/${caseData.id}`} className="card-hover p-5 group block animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${status.text}`}>{status.label}</span>
        </div>
        <FiFlag className={`w-4 h-4 ${priorityColors[caseData.priority]} mt-0.5`} />
      </div>

      <h3 className="text-base font-headline font-bold text-primary mb-1 group-hover:text-primary-container transition-colors">
        {caseData.title}
      </h3>

      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">{caseData.description}</p>

      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5"><FiUser className="w-3.5 h-3.5" />{caseData.clientName}</span>
        {caseData.nextDeadline && (
          <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5" />{new Date(caseData.nextDeadline).toLocaleDateString()}</span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <span className="text-[10px] font-bold text-outline uppercase tracking-wider">#{caseData.caseNumber}</span>
        <FiArrowRight className="w-4 h-4 text-outline group-hover:text-primary-container group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}
