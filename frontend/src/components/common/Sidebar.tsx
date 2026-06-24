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
    <aside className="w-64 bg-surface-low dark:bg-primary border-r border-outline-variant/30 dark:border-primary-container/30 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-outline-variant/20 dark:border-primary-container/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shadow-sm">
            <span className="text-white font-headline font-black text-sm tracking-tight">LS</span>
          </div>
          <div>
            <span className="text-base font-headline font-black text-primary dark:text-white leading-tight tracking-tight">
              Legal SaaS
            </span>
            <p className="text-[10px] text-on-surface-variant dark:text-on-primary-container font-label font-medium uppercase tracking-widest">
              Gestión Jurídica
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 pr-2 space-y-0.5">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-surface-lowest dark:bg-primary-container text-primary dark:text-surface font-bold rounded-l-lg shadow-sm'
                  : 'text-on-surface-variant dark:text-on-primary-container/70 hover:bg-surface-container dark:hover:bg-primary-container/50 hover:text-on-surface dark:hover:text-surface'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-outline-variant/20 dark:border-primary-container/30">
        <p className="text-[10px] text-on-surface-variant dark:text-on-primary-container/50 font-label font-medium uppercase tracking-widest">
          Legal SaaS Colombia v1.0
        </p>
      </div>
    </aside>
  )
}
