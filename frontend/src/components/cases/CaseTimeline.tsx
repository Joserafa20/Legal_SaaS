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
    const icons = {
      created: <FiPlus className="w-4 h-4" />,
      updated: <FiEdit className="w-4 h-4" />,
      deadline_added: <FiClock className="w-4 h-4" />,
      document_added: <FiFileText className="w-4 h-4" />,
      note_added: <FiMessageSquare className="w-4 h-4" />,
    }
    return icons[type as keyof typeof icons] || <FiClock className="w-4 h-4" />
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    const colors = {
      created: 'bg-green-500',
      updated: 'bg-blue-500',
      deadline_added: 'bg-yellow-500',
      document_added: 'bg-purple-500',
      note_added: 'bg-gray-500',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
  }

  if (isLoading) return <Loading text="Cargando línea de tiempo..." />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-legal-900 dark:text-white">Línea de Tiempo</h3>

      {events.length === 0 ? (
        <p className="text-legal-500">No hay eventos en la línea de tiempo.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-legal-200 dark:bg-legal-700" />

          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start">
                <div className={`absolute left-0 w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-white`}>
                  {getEventIcon(event.type)}
                </div>

                <div className="ml-12">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-legal-900 dark:text-white">{event.title}</span>
                    <span className="text-sm text-legal-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-legal-600 dark:text-legal-300 mt-1">
                    {event.description}
                  </p>
                    <p className="text-xs text-legal-400 mt-1">por {event.userName || 'Usuario'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
