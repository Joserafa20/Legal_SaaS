import { useState, useEffect } from 'react'
import { Deadline, Holiday } from '../../types'
import { deadlineService } from '../../services/deadlineService'
import { holidayService } from '../../services/holidayService'
import Loading from '../common/Loading'
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from 'date-fns'

export default function DeadlineCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeadlines()
    loadHolidays()
  }, [currentDate])

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const loadDeadlines = async () => {
    try {
      setIsLoading(true)
      const startDate = startOfMonth(currentDate).toISOString()
      const endDate = endOfMonth(currentDate).toISOString()
      const data = await deadlineService.getAll({ startDate, endDate })
      setDeadlines(data)
    } catch {
      console.error('Failed to load deadlines')
    }
  }

  const loadHolidays = async () => {
    try {
      const startDate = formatDateStr(startOfMonth(currentDate))
      const endDate = formatDateStr(endOfMonth(currentDate))
      const data = await holidayService.getByRange(startDate, endDate)
      setHolidays(data)
    } catch {
      console.error('Failed to load holidays')
    } finally {
      setIsLoading(false)
    }
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold font-display text-primary">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-surface-container-low rounded-md text-legal-500"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-surface-container-low rounded-md text-legal-500"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-legal-500 py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const dayDeadlines = deadlines.filter((d) =>
          isSameDay(new Date(d.dueDate), cloneDay)
        )

        const dayStr = formatDateStr(cloneDay)
        const holiday = holidays.find((h) => h.date === dayStr)
        const isHoliday = !!holiday

        days.push(
          <div
            key={day.toString()}
              className={`min-h-[80px] p-2 transition-colors border border-legal-200/50 ${
               isSameMonth(day, monthStart) ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
             } ${isSameDay(day, new Date()) ? 'ring-2 ring-primary ring-inset' : ''} ${isHoliday ? 'bg-tertiary-50' : ''}`}
          >
            <div className="text-sm" title={isHoliday ? holiday!.name : undefined}>
              <span className={isHoliday ? 'text-error font-semibold' : (isSameMonth(day, monthStart) ? 'text-legal-900' : 'text-legal-400')}>
                {format(day, 'd')}
              </span>
            </div>
            {dayDeadlines.slice(0, 2).map((deadline) => (
              <div
                key={deadline.id}
                className={`text-xs p-1 mt-1 rounded ${
                  deadline.priority === 'urgent'
                    ? 'bg-error-50 text-error'
                    : deadline.priority === 'high'
                    ? 'bg-tertiary-50 text-tertiary-800'
                    : 'bg-primary/5 text-primary-container'
                }`}
              >
                {deadline.title}
              </div>
            ))}
            {dayDeadlines.length > 2 && (
              <div className="text-xs text-legal-500 mt-1">+{dayDeadlines.length - 2} más</div>
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }

    return <div className="rounded-xl overflow-hidden">{rows}</div>
  }

  if (isLoading) return <Loading text="Cargando calendario..." />

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display text-primary">Calendario de Vencimientos</h3>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus className="w-4 h-4" />
          Agregar Vencimiento
        </button>
      </div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}
