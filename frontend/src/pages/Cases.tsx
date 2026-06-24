import CaseList from '../components/cases/CaseList'

export default function Cases() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Casos</h1>
        <p className="mt-1.5 text-on-surface-variant">Gestión y seguimiento de procesos jurídicos</p>
      </div>
      <CaseList />
    </div>
  )
}
