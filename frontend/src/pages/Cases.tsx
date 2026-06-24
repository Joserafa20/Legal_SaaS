import { Link } from 'react-router-dom'
import CaseList from '../components/cases/CaseList'
import { FiPlus } from 'react-icons/fi'

export default function Cases() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-legal-900 dark:text-white">Casos</h1>
        <Link
          to="/cases/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiPlus className="w-5 h-5" />
          Nuevo Caso
        </Link>
      </div>

      <CaseList />
    </div>
  )
}
