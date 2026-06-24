import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseService } from '../services/caseService'
import { caseDocumentService } from '../services/caseDocumentService'
import { FiArrowLeft, FiSave, FiPaperclip, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CreateCase() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [caseType, setCaseType] = useState('')
  const [jurisdiction, setJurisdiction] = useState('CGP')
  const [courtName, setCourtName] = useState('')
  const [judgeName, setJudgeName] = useState('')
  const [opposingParty, setOpposingParty] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast.error('El título es obligatorio')
      return
    }
    setSubmitting(true)
    try {
      const newCase = await caseService.create({
        title,
        description,
        case_type: caseType || undefined,
        jurisdiction,
        court_name: courtName || undefined,
        judge_name: judgeName || undefined,
        opposing_party: opposingParty || undefined,
        client_name: clientName || undefined,
        client_email: clientEmail || undefined,
        client_phone: clientPhone || undefined,
      })
      for (const file of selectedFiles) {
        try {
          await caseDocumentService.upload(newCase.id, file)
        } catch {
          console.error('Error al subir archivo:', file.name)
        }
      }
      toast.success('Caso creado correctamente')
      navigate('/cases/' + newCase.id)
    } catch {
      toast.error('Error al crear el caso')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const inputClass = "w-full px-4 py-2 border border-legal-300 dark:border-legal-600 rounded-lg bg-white dark:bg-legal-700 text-legal-900 dark:text-white"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/cases" className="text-legal-600 dark:text-legal-300 hover:text-primary-600">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-legal-900 dark:text-white">Nuevo Caso</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-legal-800 rounded-xl p-6 border border-legal-200 dark:border-legal-700 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Título *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Título del caso" />
        </div>

        <div>
          <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Descripción del caso" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Tipo de Caso</label>
            <select value={caseType} onChange={(e) => setCaseType(e.target.value)} className={inputClass}>
              <option value="">Seleccione...</option>
              <option value="civil">Civil</option>
              <option value="laboral">Laboral</option>
              <option value="penal">Penal</option>
              <option value="administrativo">Administrativo</option>
              <option value="familia">Familia</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Jurisdicción</label>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className={inputClass}>
              <option value="CGP">CGP</option>
              <option value="CPACA">CPACA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Juzgado</label>
            <input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className={inputClass} placeholder="Nombre del juzgado" />
          </div>
          <div>
            <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Juez</label>
            <input type="text" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} className={inputClass} placeholder="Nombre del juez" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Parte Contraria</label>
          <input type="text" value={opposingParty} onChange={(e) => setOpposingParty(e.target.value)} className={inputClass} placeholder="Nombre de la parte contraria" />
        </div>

        <div className="border-t border-legal-200 dark:border-legal-700 pt-4">
          <h3 className="text-sm font-semibold text-legal-900 dark:text-white mb-3">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Nombre</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Correo</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputClass} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Teléfono</label>
              <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputClass} placeholder="Teléfono del cliente" />
            </div>
          </div>
        </div>

          <div className="border-t border-legal-200 dark:border-legal-700 pt-4">
            <h3 className="text-sm font-semibold text-legal-900 dark:text-white mb-3">Documentos Adjuntos</h3>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-legal-300 dark:border-legal-600 rounded-lg text-legal-600 dark:text-legal-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <FiPaperclip className="w-5 h-5" />
              Seleccionar Archivos
            </button>
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-legal-50 dark:bg-legal-700/50 rounded-lg text-sm">
                    <span className="text-legal-700 dark:text-legal-300 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-legal-400 hover:text-red-500 ml-2">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-legal-400 mt-2">Los archivos se subirán después de crear el caso.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            {submitting ? 'Creando...' : 'Crear Caso'}
          </button>
      </form>
    </div>
  )
}
