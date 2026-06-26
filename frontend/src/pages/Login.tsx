import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { FiShield } from 'react-icons/fi'

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary rounded-2xl">
              <FiShield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-display text-primary tracking-tight">
            Legal SaaS
          </h2>
          <p className="mt-2 text-sm text-legal-500">
            Gestión Jurídica con Inteligencia Artificial
          </p>
        </div>

        <div className="card-surface">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-legal-400">
          Acceso seguro solo para personal autorizado
        </p>
      </div>
    </div>
  )
}
