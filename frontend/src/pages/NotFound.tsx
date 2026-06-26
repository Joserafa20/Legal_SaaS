import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold font-display text-primary mb-4">404</h1>
      <p className="text-xl text-legal-500 mb-8">
        Página no encontrada
      </p>
      <Link
        to="/dashboard"
        className="btn-primary flex items-center gap-2"
      >
        <FiHome className="w-5 h-5" />
        Ir al Panel
      </Link>
    </div>
  )
}
