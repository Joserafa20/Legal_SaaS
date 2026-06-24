import { NavLink } from 'react-router-dom'
import { FiHome, FiBriefcase, FiCalendar, FiMessageSquare, FiUsers } from 'react-icons/fi'

const navigation = [
  { name: 'Panel', to: '/dashboard', icon: FiHome },
  { name: 'Casos', to: '/cases', icon: FiBriefcase },
  { name: 'Calendario', to: '/calendar', icon: FiCalendar },
  { name: 'Asistente IA', to: '/ai-assistant', icon: FiMessageSquare },
  { name: 'Usuarios', to: '/users', icon: FiUsers },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white dark:bg-legal-800 border-r border-legal-200 dark:border-legal-700 min-h-screen">
      <div className="p-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-legal-600 dark:text-legal-300 hover:bg-legal-50 dark:hover:bg-legal-700'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
