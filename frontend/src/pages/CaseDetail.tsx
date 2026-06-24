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
      <div className="text-center py-12">
        <p className="text-legal-500">Caso no encontrado.</p>
        <Link to="/cases" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Volver a casos
        </Link>
      </div>
    )
  }

  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/cases"
          className="flex items-center gap-2 text-legal-600 dark:text-legal-300 hover:text-primary-600"
        >
          <FiArrowLeft className="w-5 h-5" />
          Volver a casos
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 text-legal-600 dark:text-legal-300 hover:text-primary-600 rounded-lg hover:bg-legal-100 dark:hover:bg-legal-700">
            <FiEdit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-legal-600 dark:text-legal-300 hover:text-red-600 rounded-lg hover:bg-legal-100 dark:hover:bg-legal-700"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-legal-800 rounded-xl p-6 border border-legal-200 dark:border-legal-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[caseData.status as keyof typeof statusColors]}`}>
              {{'open':'Abierto','in_progress':'En Progreso','pending':'Pendiente','closed':'Cerrado'}[caseData.status] || caseData.status.replace('_', ' ')}
            </span>
            <h1 className="text-2xl font-bold text-legal-900 dark:text-white mt-2">
              {caseData.title}
            </h1>
            <p className="text-legal-500">Caso #{caseData.caseNumber}</p>
          </div>
        </div>

        <p className="text-legal-700 dark:text-legal-200 mb-6">{caseData.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FiUser className="w-5 h-5 text-legal-400" />
            <div>
                    <p className="text-sm text-legal-500">Cliente</p>
              <p className="font-medium text-legal-900 dark:text-white">{caseData.clientName}</p>
            </div>
          </div>

          {caseData.courtName && (
            <div className="flex items-center gap-3">
              <FiMapPin className="w-5 h-5 text-legal-400" />
              <div>
                    <p className="text-sm text-legal-500">Juzgado</p>
                <p className="font-medium text-legal-900 dark:text-white">{caseData.courtName}</p>
              </div>
            </div>
          )}

          {caseData.judgeName && (
            <div className="flex items-center gap-3">
              <FiUser className="w-5 h-5 text-legal-400" />
              <div>
                    <p className="text-sm text-legal-500">Juez</p>
                <p className="font-medium text-legal-900 dark:text-white">{caseData.judgeName}</p>
              </div>
            </div>
          )}

          {caseData.nextDeadline && (
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-legal-400" />
              <div>
                    <p className="text-sm text-legal-500">Próximo Vencimiento</p>
                <p className="font-medium text-legal-900 dark:text-white">
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
              {caseData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-legal-100 dark:bg-legal-700 text-legal-600 dark:text-legal-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <CaseTimeline caseId={caseData.id} />

        <div className="bg-white dark:bg-legal-800 rounded-xl p-6 border border-legal-200 dark:border-legal-700 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-legal-900 dark:text-white">Documentos</h3>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer text-sm">
              <FiUpload className="w-4 h-4" />
              Subir Documento
              <input type="file" onChange={handleUploadDocument} className="hidden" />
            </label>
          </div>
          {documents.length === 0 ? (
            <p className="text-legal-500 text-sm">No hay documentos adjuntos.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-legal-50 dark:bg-legal-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiFile className="w-5 h-5 text-legal-400" />
                    <div>
                      <p className="text-sm font-medium text-legal-900 dark:text-white">{doc.file_name}</p>
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
                    className="p-2 text-legal-400 hover:text-primary-600 transition-colors"
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
