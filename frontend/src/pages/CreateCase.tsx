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
    if (!title) { toast.error('El título es obligatorio'); return }
    setSubmitting(true)
    try {
      const newCase = await caseService.create({ title, description, case_type: caseType || undefined, jurisdiction, court_name: courtName || undefined, judge_name: judgeName || undefined, opposing_party: opposingParty || undefined, client_name: clientName || undefined, client_email: clientEmail || undefined, client_phone: clientPhone || undefined })
      for (const file of selectedFiles) { try { await caseDocumentService.upload(newCase.id, file) } catch { console.error('Error al subir archivo:', file.name) } }
      toast.success('Caso creado correctamente')
      navigate('/cases/' + newCase.id)
    } catch { toast.error('Error al crear el caso') }
    finally { setSubmitting(false) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/cases" className="p-2 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"><FiArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Nuevo Caso</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Registre un nuevo proceso en el sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div><label className="label">Título *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Título del caso" /></div>
        <div><label className="label">Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" placeholder="Descripción del caso" /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Tipo de Caso</label>
            <select value={caseType} onChange={(e) => setCaseType(e.target.value)} className="input">
              <option value="">Seleccione...</option>
              <option value="civil">Civil</option><option value="laboral">Laboral</option><option value="penal">Penal</option>
              <option value="administrativo">Administrativo</option><option value="familia">Familia</option><option value="comercial">Comercial</option>
            </select></div>
          <div><label className="label">Jurisdicción</label>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input">
              <option value="CGP">CGP</option><option value="CPACA">CPACA</option>
            </select></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Juzgado</label><input type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className="input" placeholder="Nombre del juzgado" /></div>
          <div><label className="label">Juez</label><input type="text" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} className="input" placeholder="Nombre del juez" /></div>
        </div>

        <div><label className="label">Parte Contraria</label><input type="text" value={opposingParty} onChange={(e) => setOpposingParty(e.target.value)} className="input" placeholder="Nombre de la parte contraria" /></div>

        <div className="pt-5 border-t border-outline-variant/20">
          <h3 className="text-sm font-headline font-bold text-primary mb-3">Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Nombre</label><input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input" placeholder="Nombre del cliente" /></div>
            <div><label className="label">Correo</label><input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input" placeholder="correo@ejemplo.com" /></div>
            <div><label className="label">Teléfono</label><input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input" placeholder="Teléfono del cliente" /></div>
          </div>
        </div>

        <div className="pt-5 border-t border-outline-variant/20">
          <h3 className="text-sm font-headline font-bold text-primary mb-3">Documentos Adjuntos</h3>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary"><FiPaperclip className="w-4 h-4" />Seleccionar Archivos</button>
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-surface-low rounded-lg text-sm">
                  <span className="text-on-surface-variant truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-outline hover:text-error ml-2"><FiX className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-outline mt-2">Los archivos se subirán después de crear el caso.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn btn-primary"><FiSave className="w-4 h-4" />{submitting ? 'Creando...' : 'Crear Caso'}</button>
          <Link to="/cases" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
