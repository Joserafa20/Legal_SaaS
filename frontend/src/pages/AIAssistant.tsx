import { useSearchParams } from 'react-router-dom'
import AIChat from '../components/ai/AIChat'

export default function AIAssistant() {
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId') || undefined

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Asistente IA Legal</h1>
        <p className="mt-1.5 text-on-surface-variant">Consulte, investigue y analice con inteligencia artificial</p>
      </div>
      <div className="flex-1">
        <AIChat caseId={caseId} />
      </div>
    </div>
  )
}
