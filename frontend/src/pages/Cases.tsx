import { Link } from 'react-router-dom'
import CaseList from '../components/cases/CaseList'
import { FiPlus } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export default function Cases() {
  const { user: currentUser } = useAuth()
  const isAdmin = typeof currentUser?.role === 'object'
    && currentUser?.role !== null
    && 'name' in currentUser.role
    && currentUser.role.name === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-primary">Casos</h1>
        {isAdmin && (
          <Link
            to="/cases/new"
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Nuevo Caso
          </Link>
        )}
      </div>

      <CaseList />
    </div>
  )
}
