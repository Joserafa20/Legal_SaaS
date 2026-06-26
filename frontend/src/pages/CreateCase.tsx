import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../types'
import { caseService } from '../services/caseService'
import { caseDocumentService } from '../services/caseDocumentService'
import { userService } from '../services/userService'
import { FiArrowLeft, FiSave, FiPaperclip, FiX, FiCheckCircle } from 'react-icons/fi'
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
  const [lawyerId, setLawyerId] = useState('')
  const [lawyers, setLawyers] = useState<User[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [assignedLawyerName, setAssignedLawyerName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadLawyers()
  }, [])

  const loadLawyers = async () => {
    try {
      const users = await userService.getAll()
      setLawyers(users.filter(u => {
        const role = typeof u.role === 'object' ? u.role.name : u.role
        return role === 'abogado'
      }))
    } catch {
      console.error('Error al cargar abogados')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title) {
      toast.error('El título es obligatorio')
      return
    }
    if (!lawyerId) {
      toast.error('Debe seleccionar un abogado para asignar el caso')
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

      await caseService.assign(newCase.id, Number(lawyerId))

      for (const file of selectedFiles) {
        try {
          await caseDocumentService.upload(newCase.id, file)
        } catch {
          console.error('Error al subir archivo:', file.name)
        }
      }

      const lawyer = lawyers.find(l => String(l.id) === lawyerId)
      setAssignedLawyerName(lawyer?.full_name || lawyer?.name || '')
      setShowSuccess(true)
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-legal-500 hover:text-primary transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold font-display text-primary">Nuevo Caso</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Título *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Título del caso" />
        </div>

        <div>
          <label className="label">Abogado Asignado *</label>
          <select value={lawyerId} onChange={(e) => setLawyerId(e.target.value)} className="input">
            <option value="">Seleccionar abogado...</option>
            {lawyers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.full_name || l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" placeholder="Descripción del caso" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo de Caso</label>
            <select value={caseType} onChange={(e) => setCaseType(e.target.value)} className="input">
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
            <label className="label">Jurisdicción</label>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input">
              <option value="CGP">CGP</option>
              <option value="CPACA">CPACA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Juzgado</label>
            <input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className="input" placeholder="Nombre del juzgado" />
          </div>
          <div>
            <label className="label">Juez</label>
            <input type="text" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} className="input" placeholder="Nombre del juez" />
          </div>
        </div>

        <div>
          <label className="label">Parte Contraria</label>
          <input type="text" value={opposingParty} onChange={(e) => setOpposingParty(e.target.value)} className="input" placeholder="Nombre de la parte contraria" />
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-semibold font-display text-primary mb-3">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input" placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="label">Correo</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input" placeholder="Teléfono del cliente" />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-semibold font-display text-primary mb-3">Documentos Adjuntos</h3>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost flex items-center gap-2"
          >
            <FiPaperclip className="w-5 h-5" />
            Seleccionar Archivos
          </button>
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded-md text-sm">
                  <span className="text-legal-700 truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-legal-400 hover:text-error ml-2">
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
          className="btn-primary flex items-center gap-2"
        >
          <FiSave className="w-5 h-5" />
          {submitting ? 'Creando...' : 'Crear Caso'}
        </button>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-md mx-4 shadow-ambient text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display text-primary mb-2">¡Caso Creado con Éxito!</h3>
            <p className="text-legal-600 mb-6">
              Caso creado y asignado al abogado <strong>{assignedLawyerName}</strong> correctamente.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Ir al Panel
              </button>
              <button onClick={() => window.location.reload()} className="btn-ghost">
                Crear Otro Caso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
