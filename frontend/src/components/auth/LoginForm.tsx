import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="label">Correo Institucional</label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11" placeholder="ej. usuario@gov.co" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="label">Contraseña</label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-11 pr-11" placeholder="••••••••••••" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container" />
          <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">Recuérdame</span>
        </label>
        <a href="#" className="text-xs font-bold text-primary-container hover:text-primary transition-colors">¿Olvidó su contraseña?</a>
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary w-full font-headline font-bold uppercase tracking-wide">
        {isLoading ? <><FiLoader className="animate-spin" /> Ingresando...</> : 'Ingresar al Portal'}
      </button>
    </form>
  )
}
