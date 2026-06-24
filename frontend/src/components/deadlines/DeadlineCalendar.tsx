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
      <h2 className="text-xl font-semibold text-legal-900 dark:text-white">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-legal-100 dark:hover:bg-legal-700 rounded-lg"
        >
          <FiChevronLeft className="w-5 h-5 text-legal-600 dark:text-legal-300" />
        </button>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-legal-100 dark:hover:bg-legal-700 rounded-lg"
        >
          <FiChevronRight className="w-5 h-5 text-legal-600 dark:text-legal-300" />
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

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[80px] p-2 border border-legal-200 dark:border-legal-700 ${
              isSameMonth(day, monthStart) ? 'bg-white dark:bg-legal-800' : 'bg-legal-50 dark:bg-legal-900'
            } ${isSameDay(day, new Date()) ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className={`text-sm ${isSameMonth(day, monthStart) ? 'text-legal-900 dark:text-white' : 'text-legal-400'}`}>
              {format(day, 'd')}
            </div>
            {dayDeadlines.slice(0, 2).map((deadline) => (
              <div
                key={deadline.id}
                className={`text-xs p-1 mt-1 rounded ${
                  deadline.priority === 'urgent'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : deadline.priority === 'high'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
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

    return <div className="border border-legal-200 dark:border-legal-700 rounded-lg overflow-hidden">{rows}</div>
  }

  if (isLoading) return <Loading text="Cargando calendario..." />

  return (
    <div className="bg-white dark:bg-legal-800 rounded-xl p-4 border border-legal-200 dark:border-legal-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-legal-900 dark:text-white">Calendario de Vencimientos</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
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
