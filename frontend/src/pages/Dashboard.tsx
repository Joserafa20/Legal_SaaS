import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Case, Deadline } from '../types'
import { caseService } from '../services/caseService'
import { deadlineService } from '../services/deadlineService'
import CaseCard from '../components/cases/CaseCard'
import DeadlineBadge from '../components/deadlines/DeadlineBadge'
import Loading from '../components/common/Loading'
import { FiBriefcase, FiClock, FiAlertTriangle } from 'react-icons/fi'

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-legal-900 dark:text-white">Panel Principal</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-legal-800 rounded-xl p-4 border border-legal-200 dark:border-legal-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <FiBriefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
                    <p className="text-sm text-legal-500">Casos Activos</p>
              <p className="text-2xl font-bold text-legal-900 dark:text-white">{cases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-legal-800 rounded-xl p-4 border border-legal-200 dark:border-legal-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
                    <p className="text-sm text-legal-500">Vencimientos Próximos</p>
              <p className="text-2xl font-bold text-legal-900 dark:text-white">{upcomingDeadlines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-legal-800 rounded-xl p-4 border border-legal-200 dark:border-legal-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
                    <p className="text-sm text-legal-500">Vencidos</p>
              <p className="text-2xl font-bold text-legal-900 dark:text-white">{overdueDeadlines.length}</p>
            </div>
          </div>
        </div>
      </div>

      {overdueDeadlines.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5" />
            Vencimientos Vencidos
          </h3>
          <div className="flex flex-wrap gap-2">
            {overdueDeadlines.map((deadline) => (
              <DeadlineBadge key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-legal-900 dark:text-white">Casos Activos</h2>
          <Link to="/cases" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver todos
          </Link>
        </div>
        {cases.length === 0 ? (
          <p className="text-legal-500">No hay casos activos.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-legal-900 dark:text-white">Vencimientos Próximos</h2>
          <Link to="/calendar" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver calendario
          </Link>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-legal-500">No hay vencimientos próximos.</p>
        ) : (
          <div className="bg-white dark:bg-legal-800 rounded-xl border border-legal-200 dark:border-legal-700 divide-y divide-legal-200 dark:divide-legal-700">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-legal-900 dark:text-white">{deadline.title}</p>
                    <p className="text-sm text-legal-500">{deadline.caseTitle}</p>
                  </div>
                  <DeadlineBadge deadline={deadline} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
