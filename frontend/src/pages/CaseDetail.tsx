import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Case } from '../types'
import { caseService } from '../services/caseService'
import { caseDocumentService, CaseDocument } from '../services/caseDocumentService'
import CaseTimeline from '../components/cases/CaseTimeline'
import Loading from '../components/common/Loading'
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiMapPin,
  FiTag,
  FiUpload,
  FiDownload,
  FiFile,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<CaseDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadCase(id)
      loadDocuments(id)
    }
  }, [id])

  const loadCase = async (caseId: string) => {
    try {
      setIsLoading(true)
      const data = await caseService.getById(caseId)
      setCaseData(data)
    } catch {
      toast.error('Error al cargar el caso')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDocuments = async (caseId: string) => {
    try {
      const data = await caseDocumentService.list(caseId)
      setDocuments(data)
    } catch {
      console.error('Error al cargar documentos')
    }
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    try {
      await caseDocumentService.upload(id, file)
      toast.success('Documento subido correctamente')
      await loadDocuments(id)
    } catch {
      toast.error('Error al subir documento')
    }
    e.target.value = ''
  }

  const handleDelete = async () => {
    if (!id || !confirm('¿Está seguro de eliminar este caso?')) return

    try {
      await caseService.delete(id)
      toast.success('Caso eliminado correctamente')
      window.history.back()
    } catch {
      toast.error('Error al eliminar el caso')
    }
  }

  if (isLoading) return <Loading text="Cargando caso..." />

  if (!caseData) {
    return (
      <div className="card p-12 text-center animate-fade-in">
        <p className="text-neutral-500 dark:text-neutral-400">Caso no encontrado.</p>
        <Link to="/cases" className="btn btn-primary mt-4 inline-flex">
          Volver a casos
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    closed: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Volver a casos
        </Link>

        <div className="flex items-center gap-1">
          <button className="btn btn-ghost p-2">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-ghost p-2 hover:text-red-600 dark:hover:text-red-400"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[caseData.status]}`}>
              {{'open':'Abierto','in_progress':'En Progreso','pending':'Pendiente','closed':'Cerrado'}[caseData.status] || caseData.status.replace('_', ' ')}
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {caseData.title}
            </h1>
            <p className="text-sm text-neutral-500">Caso #{caseData.caseNumber}</p>
          </div>
        </div>

        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">{caseData.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
            <FiUser className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Cliente</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{caseData.clientName}</p>
            </div>
          </div>

          {caseData.courtName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
              <FiMapPin className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Juzgado</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{caseData.courtName}</p>
              </div>
            </div>
          )}

          {caseData.judgeName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
              <FiUser className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Juez</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{caseData.judgeName}</p>
              </div>
            </div>
          )}

          {caseData.nextDeadline && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
              <FiCalendar className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Próximo Vencimiento</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {new Date(caseData.nextDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {caseData.tags && caseData.tags.length > 0 && (
          <div className="flex items-start gap-2 mb-6">
            <FiTag className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {caseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <CaseTimeline caseId={caseData.id} />
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Documentos</h3>
            <label className="btn btn-primary text-sm cursor-pointer">
              <FiUpload className="w-4 h-4" />
              Subir Documento
              <input type="file" onChange={handleUploadDocument} className="hidden" />
            </label>
          </div>
          {documents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">No hay documentos adjuntos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-700 shadow-sm">
                      <FiFile className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{doc.file_name}</p>
                      <p className="text-xs text-neutral-500">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                        {doc.created_at ? ` - ${new Date(doc.created_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <a
                    href={caseDocumentService.getDownloadUrl(doc.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                    title="Descargar"
                  >
                    <FiDownload className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
