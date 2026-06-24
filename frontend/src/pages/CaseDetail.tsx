import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Case } from '../types'
import { caseService } from '../services/caseService'
import { caseDocumentService, CaseDocument } from '../services/caseDocumentService'
import CaseTimeline from '../components/cases/CaseTimeline'
import Loading from '../components/common/Loading'
import { FiArrowLeft, FiEdit2, FiTrash2, FiCalendar, FiUser, FiMapPin, FiTag, FiUpload, FiDownload, FiFile } from 'react-icons/fi'
import toast from 'react-hot-toast'

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  open: { label: 'Abierto', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  in_progress: { label: 'En Progreso', dot: 'bg-blue-500', text: 'text-blue-700' },
  pending: { label: 'Pendiente', dot: 'bg-amber-500', text: 'text-amber-700' },
  closed: { label: 'Cerrado', dot: 'bg-outline', text: 'text-on-surface-variant' },
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<CaseDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { if (id) { loadCase(id); loadDocuments(id) } }, [id])

  const loadCase = async (caseId: string) => {
    try { setIsLoading(true); const data = await caseService.getById(caseId); setCaseData(data) }
    catch { toast.error('Error al cargar el caso') }
    finally { setIsLoading(false) }
  }

  const loadDocuments = async (caseId: string) => {
    try { const data = await caseDocumentService.list(caseId); setDocuments(data) }
    catch { console.error('Error al cargar documentos') }
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    try { await caseDocumentService.upload(id, file); toast.success('Documento subido correctamente'); await loadDocuments(id) }
    catch { toast.error('Error al subir documento') }
    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!id || !confirm('¿Está seguro de eliminar este caso?')) return
    try { await caseService.delete(id); toast.success('Caso eliminado correctamente'); window.history.back() }
    catch { toast.error('Error al eliminar el caso') }
  }

  if (isLoading) return <Loading text="Cargando caso..." />

  if (!caseData) return (
    <div className="card p-12 text-center animate-fade-in">
      <p className="text-on-surface-variant">Caso no encontrado.</p>
      <Link to="/cases" className="btn btn-primary mt-4 inline-flex">Volver a casos</Link>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/cases" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <FiArrowLeft className="w-4 h-4" />Volver a casos
        </Link>
        <div className="flex items-center gap-1">
          <button className="btn btn-ghost p-2"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={handleDelete} className="btn btn-ghost p-2 hover:text-error"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="card">
        <div className="p-8">
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[caseData.status]?.dot || 'bg-outline'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig[caseData.status]?.text || 'text-on-surface-variant'}`}>
                {{'open':'Abierto','in_progress':'En Progreso','pending':'Pendiente','closed':'Cerrado'}[caseData.status] || caseData.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">{caseData.title}</h1>
            <p className="text-sm text-outline font-medium">Caso #{caseData.caseNumber}</p>
          </div>

          <p className="text-on-surface-variant leading-relaxed mb-8">{caseData.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { icon: FiUser, label: 'Cliente', value: caseData.clientName },
              ...(caseData.courtName ? [{ icon: FiMapPin, label: 'Juzgado', value: caseData.courtName }] : []),
              ...(caseData.judgeName ? [{ icon: FiUser, label: 'Juez', value: caseData.judgeName }] : []),
              ...(caseData.nextDeadline ? [{ icon: FiCalendar, label: 'Próximo Vencimiento', value: new Date(caseData.nextDeadline).toLocaleDateString() }] : []),
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-low">
                <item.icon className="w-5 h-5 text-outline shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {caseData.tags && caseData.tags.length > 0 && (
            <div className="flex items-start gap-2 mb-6">
              <FiTag className="w-5 h-5 text-outline mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {caseData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-surface-low text-on-surface-variant uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 border-t border-outline-variant/20 pt-6">
          <CaseTimeline caseId={caseData.id} />
        </div>

        <div className="px-8 pb-8 border-t border-outline-variant/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-headline font-bold text-primary">Documentos</h3>
            <label className="btn btn-primary text-sm cursor-pointer"><FiUpload className="w-4 h-4" />Subir Documento<input type="file" onChange={handleUploadDocument} className="hidden" /></label>
          </div>
          {documents.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-6">No hay documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-low hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-surface-lowest shadow-sm"><FiFile className="w-4 h-4 text-primary-container" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{doc.file_name}</p>
                      <p className="text-xs text-outline">{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}{doc.created_at ? ` - ${new Date(doc.created_at).toLocaleDateString()}` : ''}</p>
                    </div>
                  </div>
                  <a href={caseDocumentService.getDownloadUrl(doc.file_url)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-outline hover:text-primary-container hover:bg-surface-lowest transition-colors" title="Descargar"><FiDownload className="w-4 h-4" /></a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
