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

const statusStyles: Record<string, { dot: string; label: string }> = {
  open: { dot: 'bg-primary', label: 'Abierto' },
  in_progress: { dot: 'bg-primary-container', label: 'En Progreso' },
  pending: { dot: 'bg-tertiary-500', label: 'Pendiente' },
  closed: { dot: 'bg-legal-400', label: 'Cerrado' },
}

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
      <div className="text-center py-12">
        <p className="text-legal-500">Caso no encontrado.</p>
        <Link to="/cases" className="text-primary-container hover:text-primary mt-4 inline-block">
          Volver a casos
        </Link>
      </div>
    )
  }

  const status = statusStyles[caseData.status] || statusStyles.open

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          to="/cases"
          className="flex items-center gap-2 text-legal-500 hover:text-primary transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          Volver a casos
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 text-legal-500 hover:text-primary hover:bg-surface-container-low rounded-md transition-colors">
            <FiEdit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-legal-500 hover:text-error hover:bg-error-50 rounded-md transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span className="text-sm font-medium text-legal-600">{status.label}</span>
            </span>
            <h1 className="text-2xl font-bold font-display text-primary mt-2">
              {caseData.title}
            </h1>
            <p className="text-legal-400 text-sm">Caso #{caseData.caseNumber}</p>
          </div>
        </div>

        <p className="text-legal-700 mb-6 leading-relaxed">{caseData.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-md">
            <FiUser className="w-5 h-5 text-legal-400" />
            <div>
              <p className="text-xs text-legal-500 font-medium">Cliente</p>
              <p className="font-medium text-legal-900">{caseData.clientName}</p>
            </div>
          </div>

          {caseData.courtName && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-md">
              <FiMapPin className="w-5 h-5 text-legal-400" />
              <div>
                <p className="text-xs text-legal-500 font-medium">Juzgado</p>
                <p className="font-medium text-legal-900">{caseData.courtName}</p>
              </div>
            </div>
          )}

          {caseData.judgeName && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-md">
              <FiUser className="w-5 h-5 text-legal-400" />
              <div>
                <p className="text-xs text-legal-500 font-medium">Juez</p>
                <p className="font-medium text-legal-900">{caseData.judgeName}</p>
              </div>
            </div>
          )}

          {caseData.nextDeadline && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-md">
              <FiCalendar className="w-5 h-5 text-legal-400" />
              <div>
                <p className="text-xs text-legal-500 font-medium">Próximo Vencimiento</p>
                <p className="font-medium text-legal-900">
                  {new Date(caseData.nextDeadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {caseData.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <FiTag className="w-5 h-5 text-legal-400" />
            <div className="flex flex-wrap gap-2">
              {caseData.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-medium bg-surface-container-high text-legal-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <CaseTimeline caseId={caseData.id} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display text-primary">Documentos</h3>
            <label className="flex items-center gap-2 px-3 py-1.5 btn-primary cursor-pointer text-sm">
              <FiUpload className="w-4 h-4" />
              Subir Documento
              <input type="file" onChange={handleUploadDocument} className="hidden" />
            </label>
          </div>
          {documents.length === 0 ? (
            <p className="text-legal-500 text-sm">No hay documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: CaseDocument) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-md">
                  <div className="flex items-center gap-3">
                    <FiFile className="w-5 h-5 text-legal-400" />
                    <div>
                      <p className="text-sm font-medium text-legal-900">{doc.file_name}</p>
                      <p className="text-xs text-legal-500">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                        {doc.created_at ? ` - ${new Date(doc.created_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <a
                    href={caseDocumentService.getDownloadUrl(doc.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-legal-400 hover:text-primary transition-colors"
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
