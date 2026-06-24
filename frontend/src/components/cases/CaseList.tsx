import { useState, useEffect, type FormEvent } from 'react'
import CaseCard from './CaseCard'
import { Case } from '../../types'
import { caseService } from '../../services/caseService'
import Loading from '../common/Loading'
import { FiSearch, FiFilter, FiPlus, FiBriefcase } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function CaseList() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => { loadCases() }, [statusFilter])

  const loadCases = async () => {
    try {
      setIsLoading(true)
      const data = await caseService.getAll({ status: statusFilter, search: searchQuery })
      setCases(data)
    } catch { console.error('Failed to load cases') }
    finally { setIsLoading(false) }
  }

  const handleSearch = (e: FormEvent) => { e.preventDefault(); loadCases() }

  if (isLoading) return <Loading text="Cargando casos..." />

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar casos por título, número o cliente..." className="input pl-11" />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input pl-11 pr-8 appearance-none cursor-pointer">
              <option value="">Todos los Estados</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="pending">Pendiente</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <Link to="/cases/new" className="btn btn-primary whitespace-nowrap"><FiPlus className="w-4 h-4" />Nuevo Caso</Link>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-7 h-7 text-outline" />
          </div>
          <p className="text-on-surface-variant font-medium">No se encontraron casos.</p>
          <p className="text-outline text-xs mt-1">Intente ajustar los filtros o cree un nuevo caso.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem) => <CaseCard key={caseItem.id} caseData={caseItem} />)}
        </div>
      )}
    </div>
  )
}
