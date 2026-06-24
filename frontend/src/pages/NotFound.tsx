import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-legal-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-legal-600 dark:text-legal-300 mb-8">
        Página no encontrada
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <FiHome className="w-5 h-5" />
        Ir al Panel
      </Link>
    </div>
  )
}
