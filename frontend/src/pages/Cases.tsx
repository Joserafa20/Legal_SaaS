import CaseList from '../components/cases/CaseList'

export default function Cases() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Casos</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Gestión y seguimiento de casos jurídicos</p>
      </div>
      <CaseList />
    </div>
  )
}
