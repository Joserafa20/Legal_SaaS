import DeadlineCalendar from '../components/deadlines/DeadlineCalendar'

export default function Calendar() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Calendario</h1>
        <p className="mt-1.5 text-on-surface-variant">Gestión de vencimientos y fechas clave</p>
      </div>
      <DeadlineCalendar />
    </div>
  )
}
