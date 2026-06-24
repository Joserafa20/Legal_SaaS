import { useState, useEffect } from 'react'
import { Deadline } from '../../types'
import { deadlineService } from '../../services/deadlineService'
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
import { es } from 'date-fns/locale'

export default function DeadlineCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeadlines()
  }, [currentDate])

  const loadDeadlines = async () => {
    try {
      setIsLoading(true)
      const startDate = startOfMonth(currentDate).toISOString()
      const endDate = endOfMonth(currentDate).toISOString()
      const data = await deadlineService.getAll({ startDate, endDate })
      setDeadlines(data)
    } catch {
      console.error('Failed to load deadlines')
    } finally {
      setIsLoading(false)
    }
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
        {format(currentDate, 'MMMM yyyy', { locale: es })}
      </h2>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <FiChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
      </div>
    </div>
  )

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
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

    const rows: React.ReactNode[] = []
    let days: React.ReactNode[] = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const dayDeadlines = deadlines.filter((d) =>
          isSameDay(new Date(d.dueDate), cloneDay)
        )

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[90px] p-2 border border-neutral-200 dark:border-neutral-700 ${
              isSameMonth(day, monthStart)
                ? 'bg-white dark:bg-neutral-800'
                : 'bg-neutral-50 dark:bg-neutral-900'
            } ${isSameDay(day, new Date()) ? 'ring-2 ring-inset ring-primary-500/50' : ''}`}
          >
            <div className={`text-xs font-medium mb-1 ${
              isSameMonth(day, monthStart)
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-400 dark:text-neutral-600'
            } ${isSameDay(day, new Date()) ? 'text-primary-600 dark:text-primary-400' : ''}`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-0.5">
              {dayDeadlines.slice(0, 2).map((deadline) => (
                <div
                  key={deadline.id}
                  className={`text-xs px-1.5 py-0.5 rounded font-medium truncate leading-relaxed ${
                    deadline.priority === 'urgent'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : deadline.priority === 'high'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {deadline.title}
                </div>
              ))}
              {dayDeadlines.length > 2 && (
                <div className="text-xs text-neutral-400 dark:text-neutral-500 pl-1">
                  +{dayDeadlines.length - 2} más
                </div>
              )}
            </div>
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

    return <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">{rows}</div>
  }

  if (isLoading) return <Loading text="Cargando calendario..." />

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Calendario de Vencimientos</h3>
        <button className="btn btn-primary text-sm">
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
