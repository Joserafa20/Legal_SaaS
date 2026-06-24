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

  useEffect(() => {
    loadDashboardData()
  }, [])

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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Panel Principal</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Resumen general de su actividad jurídica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <FiBriefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Casos Activos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{cases.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <FiClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Vencimientos Próximos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{upcomingDeadlines.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Vencidos</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{overdueDeadlines.length}</p>
            </div>
          </div>
        </div>
      </div>

      {overdueDeadlines.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/15 rounded-xl border border-red-200 dark:border-red-800/50 p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 flex items-center gap-2 mb-3">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Casos Activos</h2>
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Ver todos
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {cases.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No hay casos activos.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        )}
      </section>

      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Vencimientos Próximos</h2>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Ver calendario
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No hay vencimientos próximos.</p>
          </div>
        ) : (
          <div className="card divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{deadline.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{deadline.caseTitle}</p>
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
