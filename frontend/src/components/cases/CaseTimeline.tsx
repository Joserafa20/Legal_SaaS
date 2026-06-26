import { useState, useEffect } from 'react'
import { TimelineEvent } from '../../types'
import { caseService } from '../../services/caseService'
import Loading from '../common/Loading'
import { FiFileText, FiClock, FiEdit, FiPlus, FiMessageSquare } from 'react-icons/fi'

interface CaseTimelineProps {
  caseId: string
}

const eventConfig: Record<string, { icon: JSX.Element; color: string }> = {
  created: { icon: <FiPlus className="w-4 h-4" />, color: 'bg-primary' },
  updated: { icon: <FiEdit className="w-4 h-4" />, color: 'bg-primary-container' },
  deadline_added: { icon: <FiClock className="w-4 h-4" />, color: 'bg-tertiary-500' },
  document_added: { icon: <FiFileText className="w-4 h-4" />, color: 'bg-legal-500' },
  note_added: { icon: <FiMessageSquare className="w-4 h-4" />, color: 'bg-legal-400' },
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

  const getEventConfig = (type: string) => {
    return eventConfig[type] || eventConfig.updated
  }

  if (isLoading) return <Loading text="Cargando línea de tiempo..." />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold font-display text-primary">Línea de Tiempo</h3>

      {events.length === 0 ? (
        <p className="text-legal-500">No hay eventos en la línea de tiempo.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-container-highest" />

          <div className="space-y-6">
            {events.map((event) => {
              const cfg = getEventConfig(event.type)
              return (
                <div key={event.id} className="relative flex items-start">
                  <div className={`absolute left-0 w-8 h-8 ${cfg.color} rounded-full flex items-center justify-center text-white`}>
                    {cfg.icon}
                  </div>

                  <div className="ml-12">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-legal-900">{event.title}</span>
                      <span className="text-sm text-legal-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-legal-600 mt-1">
                      {event.description}
                    </p>
                    <p className="text-xs text-legal-400 mt-1">por {event.userName || 'Usuario'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
