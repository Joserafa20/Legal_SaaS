import DeadlineCalendar from '../components/deadlines/DeadlineCalendar'

export default function Calendar() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Calendario</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Gestión de vencimientos y fechas clave</p>
      </div>
      <DeadlineCalendar />
    </div>
  )
}
