import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { FiSun, FiMoon, FiLogOut, FiUser, FiBell } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-primary dark:bg-[#000a1a]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="text-white font-headline font-black text-xs">LS</span>
          </div>
          <span className="text-base font-headline font-black text-white tracking-tight">Legal SaaS</span>
        </Link>

        <div className="flex items-center gap-2 ml-auto">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-on-primary-container/70 hover:text-white hover:bg-primary-container/50 transition-colors">
            <FiBell className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-primary-container/70 hover:text-white hover:bg-primary-container/50 transition-colors"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-primary-container/50">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <FiUser className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-on-primary-container font-label uppercase tracking-wider">
                {typeof user?.role === 'object' ? user.role.name : ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 w-9 h-9 rounded-full flex items-center justify-center text-on-primary-container/70 hover:text-error hover:bg-error-container/20 transition-colors"
              title="Cerrar sesión"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
