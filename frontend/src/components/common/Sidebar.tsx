import { NavLink } from 'react-router-dom'
import { FiHome, FiCalendar, FiMessageSquare, FiUsers } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

export default function Sidebar() {
  const { user: currentUser } = useAuth()
  const isAdmin = typeof currentUser?.role === 'object'
    && currentUser?.role !== null
    && 'name' in currentUser.role
    && currentUser.role.name === 'admin'
  return (
    <div className="w-64 bg-surface-container-low min-h-screen">
      <div className="p-4">
        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-legal-600 hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <FiHome className="mr-3 h-5 w-5" />
            Panel
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-legal-600 hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <FiCalendar className="mr-3 h-5 w-5" />
            Calendario
          </NavLink>
          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-legal-600 hover:bg-surface-container hover:text-primary'
              }`
            }
          >
            <FiMessageSquare className="mr-3 h-5 w-5" />
            Asistente IA
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-legal-600 hover:bg-surface-container hover:text-primary'
                }`
              }
            >
              <FiUsers className="mr-3 h-5 w-5" />
              Usuarios
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  )
}
