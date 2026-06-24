import { useState, useEffect } from 'react'
import { TimelineEvent } from '../../types'
import { caseService } from '../../services/caseService'
import Loading from '../common/Loading'
import { FiFileText, FiClock, FiEdit, FiPlus, FiMessageSquare } from 'react-icons/fi'

interface CaseTimelineProps { caseId: string }

const icons: Record<string, React.ReactNode> = {
  created: <FiPlus className="w-3.5 h-3.5" />,
  updated: <FiEdit className="w-3.5 h-3.5" />,
  deadline_added: <FiClock className="w-3.5 h-3.5" />,
  document_added: <FiFileText className="w-3.5 h-3.5" />,
  note_added: <FiMessageSquare className="w-3.5 h-3.5" />,
}

const colors: Record<string, string> = {
  created: 'bg-primary-container',
  updated: 'bg-blue-500',
  deadline_added: 'bg-amber-500',
  document_added: 'bg-tertiary-container',
  note_added: 'bg-outline',
}

export default function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadTimeline() }, [caseId])

  const loadTimeline = async () => {
    try { setIsLoading(true); const data = await caseService.getTimeline(caseId); setEvents(data) }
    catch { console.error('Failed to load timeline') }
    finally { setIsLoading(false) }
  }

  if (isLoading) return <Loading text="Cargando línea de tiempo..." />

  return (
    <div className="space-y-4">
      <h3 className="text-base font-headline font-bold text-primary">Línea de Tiempo</h3>
      {events.length === 0 ? (
        <div className="card p-6 text-center"><p className="text-on-surface-variant text-sm">No hay eventos en la línea de tiempo.</p></div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/50" />
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex items-start group">
                <div className={`absolute left-0 w-8 h-8 ${colors[event.type] || 'bg-outline'} rounded-full flex items-center justify-center text-white ring-4 ring-surface`}>
                  {icons[event.type] || <FiClock className="w-3.5 h-3.5" />}
                </div>
                <div className="ml-12 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-primary">{event.title}</span>
                    <span className="text-xs text-outline">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">{event.description}</p>
                  <p className="text-xs text-outline mt-1">por {event.userName || 'Usuario'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
