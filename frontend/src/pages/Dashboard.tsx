import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Case, Deadline } from '../types'
import { caseService } from '../services/caseService'
import { deadlineService } from '../services/deadlineService'
import CaseCard from '../components/cases/CaseCard'
import DeadlineBadge from '../components/deadlines/DeadlineBadge'
import Loading from '../components/common/Loading'
import { FiBriefcase, FiClock, FiAlertTriangle, FiArrowRight } from 'react-icons/fi'

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([])
  const [overdueDeadlines, setOverdueDeadlines] = useState<Deadline[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadDashboardData() }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [casesData, upcomingData, overdueData] = await Promise.all([
        caseService.getAll({ status: 'in_progress' }),
        deadlineService.getUpcoming(7),
        deadlineService.getOverdue(),
      ])
      setCases(casesData.slice(0, 6))
      setUpcomingDeadlines(upcomingData.slice(0, 5))
      setOverdueDeadlines(overdueData.slice(0, 5))
    } catch {
      console.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <Loading text="Cargando panel..." />

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Panel Principal</h1>
        <p className="mt-1.5 text-on-surface-variant">Resumen general de la actividad jurídica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: FiBriefcase, label: 'Casos Activos', value: cases.length, bg: 'bg-primary-fixed-dim/20', iconBg: 'bg-primary-container', iconColor: 'text-white' },
          { icon: FiClock, label: 'Vencimientos Próximos', value: upcomingDeadlines.length, bg: 'bg-tertiary-fixed/20', iconBg: 'bg-tertiary-container', iconColor: 'text-tertiary-fixed' },
          { icon: FiAlertTriangle, label: 'Vencidos', value: overdueDeadlines.length, bg: 'bg-error-container/40', iconBg: 'bg-error', iconColor: 'text-white' },
        ].map((stat, i) => (
          <div key={stat.label} className="card p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-headline font-black text-primary mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {overdueDeadlines.length > 0 && (
        <div className="bg-error-container/30 rounded-xl p-5 animate-slide-up">
          <h3 className="text-xs font-bold text-error uppercase tracking-wider flex items-center gap-2 mb-3">
            <FiAlertTriangle className="w-4 h-4" />
            Vencimientos Vencidos
          </h3>
          <div className="flex flex-wrap gap-2">
            {overdueDeadlines.map((deadline) => (
              <DeadlineBadge key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>
      )}

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Casos Activos</h2>
          <Link to="/cases" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-container hover:text-primary transition-colors">
            Ver todos <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {cases.length === 0 ? (
          <div className="card p-10 text-center"><p className="text-on-surface-variant text-sm">No hay casos activos.</p></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => <CaseCard key={caseItem.id} caseData={caseItem} />)}
          </div>
        )}
      </section>

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Vencimientos Próximos</h2>
          <Link to="/calendar" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-container hover:text-primary transition-colors">
            Ver calendario <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <div className="card p-10 text-center"><p className="text-on-surface-variant text-sm">No hay vencimientos próximos.</p></div>
        ) : (
          <div className="card divide-y divide-outline-variant/20 overflow-hidden">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 flex items-center justify-between hover:bg-surface-low transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{deadline.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{deadline.caseTitle}</p>
                </div>
                <DeadlineBadge deadline={deadline} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
