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
    <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">LS</span>
          </div>
          <span className="text-base font-semibold text-neutral-900 dark:text-white">
            Legal SaaS
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-xs text-neutral-400 dark:text-neutral-500 px-3">
          Legal SaaS Colombia v1.0
        </div>
      </div>
    </aside>
  )
}
