import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center lg:hidden">
              <span className="text-white font-bold text-xs">LS</span>
            </div>
            <span className="text-base font-semibold text-neutral-900 dark:text-white lg:hidden">
              Legal SaaS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700/50">
            <FiUser className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{user?.name}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
