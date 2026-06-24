import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Complete todos los campos')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard')
    } catch {
      toast.error('Correo o contraseña inválidos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">
          Correo Electrónico
        </label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-legal-300 dark:border-legal-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">
          Contraseña
        </label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-legal-300 dark:border-legal-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <FiLoader className="animate-spin mr-2" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </button>
    </form>
  )
}
