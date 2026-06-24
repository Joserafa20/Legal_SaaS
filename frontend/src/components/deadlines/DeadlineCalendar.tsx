import { useState, useEffect } from 'react'
import { Deadline } from '../../types'
import { deadlineService } from '../../services/deadlineService'
import Loading from '../common/Loading'
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DeadlineCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadDeadlines() }, [currentDate])

  const loadDeadlines = async () => {
    try {
      setIsLoading(true)
      const startDate = startOfMonth(currentDate).toISOString()
      const endDate = endOfMonth(currentDate).toISOString()
      const data = await deadlineService.getAll({ startDate, endDate })
      setDeadlines(data)
    } catch { console.error('Failed to load deadlines') }
    finally { setIsLoading(false) }
  }

  if (isLoading) return <Loading text="Cargando calendario..." />

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = new Date()

  return (
    <div className="card animate-fade-in">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-headline font-bold text-primary">Calendario de Vencimientos</h3>
          <button className="btn btn-primary text-sm"><FiPlus className="w-4 h-4" />Agregar Vencimiento</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-bold text-primary capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-surface-container transition-colors"><FiChevronLeft className="w-5 h-5 text-on-surface-variant" /></button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-lg hover:bg-surface-container transition-colors"><FiChevronRight className="w-5 h-5 text-on-surface-variant" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider py-2">{day}</div>
          ))}
        </div>

        <div className="border border-outline-variant/20 rounded-lg overflow-hidden">
          {(() => {
            const rows: React.ReactNode[] = []
            let cells: React.ReactNode[] = []
            let day = startDate

            while (day <= endDate) {
              for (let i = 0; i < 7; i++) {
                const dayDeadlines = deadlines.filter((d) => isSameDay(new Date(d.dueDate), day))
                const isToday = isSameDay(day, today)
                const isCurrentMonth = isSameMonth(day, monthStart)

                cells.push(
                  <div key={day.toString()} className={`min-h-[90px] p-2 border border-outline-variant/20 ${isCurrentMonth ? 'bg-surface-lowest' : 'bg-surface-low'} ${isToday ? 'ring-2 ring-inset ring-primary-container/50' : ''}`}>
                    <div className={`text-xs font-bold mb-1 ${isCurrentMonth ? (isToday ? 'text-primary-container' : 'text-primary') : 'text-outline'}`}>{format(day, 'd')}</div>
                    <div className="space-y-0.5">
                      {dayDeadlines.slice(0, 2).map((d) => (
                        <div key={d.id} className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate leading-relaxed ${d.priority === 'urgent' ? 'bg-error-container text-on-error-container' : d.priority === 'high' ? 'bg-orange-50 text-orange-700' : 'bg-primary-fixed-dim/30 text-primary'}`}>{d.title}</div>
                      ))}
                      {dayDeadlines.length > 2 && <div className="text-[10px] text-outline pl-1">+{dayDeadlines.length - 2} más</div>}
                    </div>
                  </div>
                )
                day = addDays(day, 1)
              }
              rows.push(<div key={day.toString()} className="grid grid-cols-7">{cells}</div>)
              cells = []
            }
            return rows
          })()}
        </div>
      </div>
    </div>
  )
}
