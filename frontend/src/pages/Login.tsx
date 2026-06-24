import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { FiShield, FiLock, FiServer } from 'react-icons/fi'

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="h-8 w-8 border-2 border-outline-variant border-t-primary-container rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="hidden lg:flex lg:w-5/12 bg-primary-container p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container flex items-center justify-center shadow-lg">
              <FiShield className="w-6 h-6 text-tertiary-fixed" />
            </div>
            <div>
              <h1 className="font-headline font-black text-2xl tracking-tighter text-white uppercase leading-none">
                Legal SaaS
              </h1>
              <p className="text-xs text-on-primary-container font-label font-medium uppercase tracking-widest mt-0.5">
                Colombia
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="font-headline font-black text-4xl text-white tracking-tight leading-tight mb-4">
              Sistema de Gestión Jurídica
            </h2>
            <div className="w-16 h-1 bg-tertiary-fixed mb-6 rounded-full" />
            <p className="text-on-primary-container font-body text-lg leading-relaxed max-w-sm">
              Acceso exclusivo para profesionales del derecho autorizados.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-on-primary-fixed-variant">
            <FiShield className="w-4 h-4 text-tertiary-fixed" />
            <span className="text-xs font-label font-bold uppercase tracking-widest">Protocolo de Seguridad</span>
          </div>
          <div className="flex items-center gap-3 text-on-primary-fixed-variant">
            <FiLock className="w-4 h-4 text-tertiary-fixed" />
            <span className="text-xs font-label font-bold uppercase tracking-widest">Sesión Encriptada</span>
          </div>
          <div className="flex items-center gap-3 text-on-primary-fixed-variant">
            <FiServer className="w-4 h-4 text-tertiary-fixed" />
            <span className="text-xs font-label font-bold uppercase tracking-widest">Nube Soberana</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <FiShield className="w-5 h-5 text-tertiary-fixed" />
            </div>
            <span className="font-headline font-black text-xl text-primary tracking-tighter uppercase">Legal SaaS</span>
          </div>

          <div className="mb-10">
            <h3 className="font-headline font-bold text-3xl text-primary mb-2">Portal de Autoridad</h3>
            <p className="text-on-surface-variant font-body">Ingrese sus credenciales institucionales para continuar.</p>
          </div>

          <LoginForm />

          <footer className="mt-12 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-outline font-body">© 2024 Legal SaaS Colombia</p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-outline hover:text-primary transition-colors">Privacidad</a>
              <a href="#" className="text-xs text-outline hover:text-primary transition-colors">Soporte</a>
            </div>
          </footer>
        </div>
      </div>

      <div className="fixed top-6 right-6 hidden lg:flex glass-panel px-4 py-2 rounded-full border border-white/20 items-center gap-3 z-20 shadow-ambient">
        <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
        <span className="text-[10px] font-label font-black text-primary uppercase tracking-[0.2em]">Servidor Seguro</span>
      </div>
    </div>
  )
}
