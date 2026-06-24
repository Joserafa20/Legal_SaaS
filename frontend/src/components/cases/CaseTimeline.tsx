import { useState, useEffect } from 'react'
import { TimelineEvent } from '../../types'
import { caseService } from '../../services/caseService'
import Loading from '../common/Loading'
import { FiFileText, FiClock, FiEdit, FiPlus, FiMessageSquare } from 'react-icons/fi'

interface CaseTimelineProps {
  caseId: string
}

export default function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [caseId])

  const loadTimeline = async () => {
    try {
      setIsLoading(true)
      const data = await caseService.getTimeline(caseId)
      setEvents(data)
    } catch {
      console.error('Failed to load timeline')
    } finally {
      setIsLoading(false)
    }
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    const icons: Record<string, React.ReactNode> = {
      created: <FiPlus className="w-4 h-4" />,
      updated: <FiEdit className="w-4 h-4" />,
      deadline_added: <FiClock className="w-4 h-4" />,
      document_added: <FiFileText className="w-4 h-4" />,
      note_added: <FiMessageSquare className="w-4 h-4" />,
    }
    return icons[type] || <FiClock className="w-4 h-4" />
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors: Record<string, string> = {
      created: 'bg-emerald-500',
      updated: 'bg-blue-500',
      deadline_added: 'bg-amber-500',
      document_added: 'bg-violet-500',
      note_added: 'bg-neutral-500',
    }
    return colors[type] || 'bg-neutral-500'
  }

  if (isLoading) return <Loading text="Cargando línea de tiempo..." />

  return (
    <div className="space-y-4">
      <h3 className="section-title">Línea de Tiempo</h3>

      {events.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">No hay eventos en la línea de tiempo.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />

          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start group">
                <div className={`absolute left-0 w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white dark:ring-neutral-800`}>
                  {getEventIcon(event.type)}
                </div>

                <div className="ml-12 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{event.title}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {event.description}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    por {event.userName || 'Usuario'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
