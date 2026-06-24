import { useSearchParams } from 'react-router-dom'
import AIChat from '../components/ai/AIChat'

export default function AIAssistant() {
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId') || undefined

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Asistente IA Legal</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Consulte, investigue y analice con inteligencia artificial</p>
      </div>
      <AIChat caseId={caseId} />
    </div>
  )
}
