import { useState, useEffect, type FormEvent } from 'react'
import CaseCard from './CaseCard'
import { Case } from '../../types'
import { caseService } from '../../services/caseService'
import Loading from '../common/Loading'
import { FiSearch, FiFilter } from 'react-icons/fi'

export default function CaseList() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    loadCases()
  }, [statusFilter, appliedSearch])

  const loadCases = async () => {
    try {
      setIsLoading(true)
      const data = await caseService.getAll({ status: statusFilter, search: appliedSearch })
      setCases(data)
    } catch {
      console.error('Failed to load cases')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchQuery)
  }

  if (isLoading) return <Loading text="Cargando casos..." />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar casos..."
              className="input pl-10"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <FiFilter className="text-legal-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos los Estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="archived">Archivado</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12 text-legal-500">
          No se encontraron casos.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      )}
    </div>
  )
}
