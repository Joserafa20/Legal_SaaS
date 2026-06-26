import DeadlineCalendar from '../components/deadlines/DeadlineCalendar'

export default function Calendar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-primary">Calendario</h1>
      <DeadlineCalendar />
    </div>
  )
}
