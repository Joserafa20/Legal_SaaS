import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Case, Deadline, User } from '../types'
import { caseService } from '../services/caseService'
import { deadlineService } from '../services/deadlineService'
import { userService } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import CaseCard from '../components/cases/CaseCard'
import DeadlineBadge from '../components/deadlines/DeadlineBadge'
import Loading from '../components/common/Loading'
import { FiBriefcase, FiClock, FiAlertTriangle, FiUserPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user: currentUser } = useAuth()
  const isAdmin = typeof currentUser?.role === 'object'
    && currentUser?.role !== null
    && 'name' in currentUser.role
    && currentUser.role.name === 'admin'
  const isAbogado = typeof currentUser?.role === 'object'
    && currentUser?.role !== null
    && 'name' in currentUser.role
    && currentUser.role.name === 'abogado'
  const [cases, setCases] = useState<Case[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([])
  const [overdueDeadlines, setOverdueDeadlines] = useState<Deadline[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [assigningCaseId, setAssigningCaseId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'cases' | 'upcoming' | 'overdue' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    if (isAdmin) {
      loadLawyers()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [casesData, upcomingData, overdueData] = await Promise.all([
        caseService.getAll({ status: 'active' }),
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

  const loadLawyers = async () => {
    try {
      const users = await userService.getAll()
      setLawyers(users.filter(u => {
        const role = typeof u.role === 'object' ? u.role.name : u.role
        return role === 'abogado'
      }))
    } catch {
      console.error('Failed to load lawyers')
    }
  }

  const handleAssign = async (caseId: string, lawyerId: number) => {
    try {
      await caseService.assign(caseId, lawyerId)
      toast.success('Caso asignado correctamente')
      setAssigningCaseId(null)
      loadDashboardData()
    } catch {
      toast.error('Error al asignar el caso')
    }
  }

  if (isLoading) return <Loading text="Cargando panel..." />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-primary">Panel Principal</h1>
        {isAdmin && (
          <Link to="/cases/new" className="btn-primary flex items-center gap-2">
            <FiBriefcase className="w-5 h-5" />
            Crear Caso
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveFilter(activeFilter === 'cases' ? null : 'cases')}
          className={`card-surface text-left transition-all ${
            activeFilter === 'cases' ? 'ring-2 ring-primary' : 'hover:shadow-ambient'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FiBriefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-legal-500 font-medium">Casos Activos</p>
              <p className="text-3xl font-bold font-display text-primary">{cases.length}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'upcoming' ? null : 'upcoming')}
          className={`card-surface text-left transition-all ${
            activeFilter === 'upcoming' ? 'ring-2 ring-primary' : 'hover:shadow-ambient'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-tertiary-100">
              <FiClock className="w-6 h-6 text-tertiary-700" />
            </div>
            <div>
              <p className="text-sm text-legal-500 font-medium">Vencimientos Próximos</p>
              <p className="text-3xl font-bold font-display text-primary">{upcomingDeadlines.length}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'overdue' ? null : 'overdue')}
          className={`card-surface text-left transition-all ${
            activeFilter === 'overdue' ? 'ring-2 ring-primary' : 'hover:shadow-ambient'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-error-50">
              <FiAlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-legal-500 font-medium">Vencidos</p>
              <p className="text-3xl font-bold font-display text-primary">{overdueDeadlines.length}</p>
            </div>
          </div>
        </button>
      </div>

      {(!activeFilter || activeFilter === 'overdue') && overdueDeadlines.length > 0 && (
        <div className="bg-error-50 rounded-xl p-4 border-l-4 border-error">
          <h3 className="text-lg font-semibold text-error-800 mb-3 flex items-center gap-2">
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

      {(!activeFilter || activeFilter === 'cases') && (!isAbogado || cases.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display text-primary">Casos Activos</h2>
          </div>
          {cases.length === 0 ? (
            <p className="text-legal-500">No hay casos activos.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => (
                <div key={caseItem.id} className="relative">
                  <CaseCard caseData={caseItem} />
                  {isAdmin && !caseItem.assigned_lawyer_id && (
                    <div className="mt-2">
                      {assigningCaseId === caseItem.id ? (
                        <select
                          className="input text-sm"
                          onChange={(e) => {
                            const val = e.target.value
                            if (val) handleAssign(caseItem.id, Number(val))
                          }}
                          onBlur={() => setAssigningCaseId(null)}
                          autoFocus
                        >
                          <option value="">Seleccionar abogado...</option>
                          {lawyers.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.full_name || l.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setAssigningCaseId(caseItem.id)}
                          className="btn-ghost text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          Asignar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(!activeFilter || activeFilter === 'upcoming') && <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-display text-primary">Vencimientos Próximos</h2>
          <Link to="/calendar" className="text-primary-container hover:text-primary text-sm font-medium transition-colors">
            Ver calendario
          </Link>
        </div>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-legal-500">No hay vencimientos próximos.</p>
        ) : (
          <div className="bg-surface-container-low rounded-xl divide-y divide-legal-100/50">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-legal-900">{deadline.title}</p>
                    <p className="text-sm text-legal-500">{deadline.caseTitle}</p>
                  </div>
                  <DeadlineBadge deadline={deadline} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  )
}
