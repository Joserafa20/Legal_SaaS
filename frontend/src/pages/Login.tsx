import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { FiShield } from 'react-icons/fi'

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 rounded-full" />
          <div className="w-10 h-10 border-2 border-transparent border-t-primary-600 rounded-full absolute inset-0 animate-spin" />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/20 mb-5">
            <FiShield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Legal SaaS
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            Gestión Jurídica con Inteligencia Artificial
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Acceso seguro solo para personal autorizado
        </p>
      </div>
    </div>
  )
}
