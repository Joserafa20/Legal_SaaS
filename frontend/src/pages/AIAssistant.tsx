import { useSearchParams } from 'react-router-dom'
import AIChat from '../components/ai/AIChat'

export default function AIAssistant() {
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('caseId') || undefined

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-legal-900 dark:text-white">Asistente IA Legal</h1>
      <AIChat caseId={caseId} />
    </div>
  )
}
