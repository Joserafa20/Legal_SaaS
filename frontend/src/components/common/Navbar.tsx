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
    <nav className="bg-white dark:bg-legal-800 shadow-sm border-b border-legal-200 dark:border-legal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Legal SaaS Colombia
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-legal-600 dark:text-legal-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-legal-700 dark:text-legal-200">
                <FiUser className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center text-legal-600 dark:text-legal-300 hover:text-red-600 dark:hover:text-red-400"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
