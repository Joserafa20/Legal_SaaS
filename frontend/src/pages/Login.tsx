import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { FiBookOpen } from 'react-icons/fi'

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-legal-50 dark:bg-legal-900">
        <div className="animate-spin w-8 h-8 border-4 border-legal-200 border-t-primary-600 rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-legal-900 dark:to-legal-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <FiBookOpen className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-legal-900 dark:text-white">
            Legal SaaS
          </h2>
          <p className="mt-2 text-sm text-legal-600 dark:text-legal-300">
            Gestión Jurídica con Inteligencia Artificial
          </p>
        </div>

        <div className="bg-white dark:bg-legal-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-legal-500 dark:text-legal-400">
          Acceso seguro solo para personal autorizado
        </p>
      </div>
    </div>
  )
}
