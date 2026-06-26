import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { AIMessage } from '../../types'
import { aiService } from '../../services/aiService'
import { FiSend, FiLoader, FiTrash2, FiPaperclip, FiPlus, FiMessageSquare, FiX } from 'react-icons/fi'

interface Conversation {
  id: string
  name: string
  messages: AIMessage[]
}

const STORAGE_KEY = 'ai_conversations'
const ACTIVE_KEY = 'ai_active_conv'

function loadConversations(): Conversation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveConversations(convs: Conversation[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
}

function loadActiveId(): string | null {
  return sessionStorage.getItem(ACTIVE_KEY)
}

function saveActiveId(id: string) {
  sessionStorage.setItem(ACTIVE_KEY, id)
}

export default function AIChat({ caseId }: { caseId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = loadConversations()
    if (saved.length > 0) return saved
    const defaultConv: Conversation = { id: 'conv_1', name: 'Conversación 1', messages: [] }
    return [defaultConv]
  })
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    return loadActiveId() || conversations[0]?.id || 'conv_1'
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0]
  const messages = activeConv?.messages || []

  useEffect(() => { saveConversations(conversations) }, [conversations])
  useEffect(() => { saveActiveId(activeConvId) }, [activeConvId])
  useEffect(() => { scrollToBottom() }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateMessages = useCallback((convId: string, updater: (msgs: AIMessage[]) => AIMessage[]) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: updater(c.messages) } : c))
  }, [])

  const genName = (): string => {
    const max = conversations.reduce((n, c) => {
      const m = c.name.match(/^Conversaci\u00f3n (\d+)$/)
      return m ? Math.max(n, parseInt(m[1])) : n
    }, 0)
    return `Conversaci\u00f3n ${max + 1}`
  }

  const newConversation = () => {
    const conv: Conversation = { id: 'conv_' + Date.now(), name: genName(), messages: [] }
    setConversations(prev => [...prev, conv])
    setActiveConvId(conv.id)
  }

  const switchConversation = (id: string) => {
    setActiveConvId(id)
    setAttachedFile(null)
  }

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (filtered.length === 0) {
        const conv: Conversation = { id: 'conv_' + Date.now(), name: 'Conversación 1', messages: [] }
        filtered.push(conv)
        setActiveConvId(conv.id)
      } else if (id === activeConvId) {
        setActiveConvId(filtered[0].id)
      }
      return filtered
    })
  }

  const clearActive = () => {
    updateMessages(activeConvId, () => [])
  }

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachedFile({ name: file.name, content: 'Extrayendo texto...' })
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/v1/ai/extract', { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }, body: formData })
      const data = await res.json()
      setAttachedFile({ name: data.filename, content: data.text || '[Sin texto extraible]' })
    } catch {
      setAttachedFile({ name: file.name, content: '[Error al extraer texto del archivo]' })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !attachedFile) || isLoading) return

    let messageText = input.trim()
    if (attachedFile) {
      const content = attachedFile.content.length > 10000 ? attachedFile.content.slice(0, 10000) + '\n[...]' : attachedFile.content
      messageText = `[Archivo adjunto: ${attachedFile.name}]\n\n${content}\n\n${messageText || 'Analiza este documento'}`
    }

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: attachedFile ? `[Archivo: ${attachedFile.name}] ${input.trim() || 'Analiza este documento'}` : input.trim(),
      timestamp: new Date().toISOString(),
    }

    const currentMessages = messages
    updateMessages(activeConvId, prev => [...prev, userMessage])
    setInput('')
    setAttachedFile(null)
    setIsLoading(true)

    try {
      const response = await aiService.sendMessage(messageText, currentMessages, { caseId })
      updateMessages(activeConvId, prev => [...prev, response])
    } catch {
      const errMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error. Intente nuevamente.',
        timestamp: new Date().toISOString(),
      }
      updateMessages(activeConvId, prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[600px] card overflow-hidden">
      <div className="w-56 shrink-0 bg-surface-container-low flex flex-col">
        <div className="flex items-center justify-between p-3">
          <h4 className="text-sm font-semibold text-legal-700">Conversaciones</h4>
          <button onClick={newConversation} className="p-1 text-legal-400 hover:text-primary transition-colors" title="Nueva conversación">
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-xs text-legal-400 p-3">Sin conversaciones.</p>
          )}
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => switchConversation(c.id)}
              className={`w-full text-left p-3 flex items-center gap-2 transition-colors ${c.id === activeConvId ? 'bg-surface-container' : 'hover:bg-surface-container'}`}
            >
              <FiMessageSquare className="w-4 h-4 text-legal-400 shrink-0" />
              <span className="text-sm text-legal-700 truncate flex-1">{c.name}</span>
              <button onClick={(e) => deleteConversation(e, c.id)} className="p-0.5 text-legal-300 hover:text-error shrink-0"><FiX className="w-3 h-3" /></button>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold font-display text-primary truncate max-w-[200px]">{activeConv?.name || 'Chat'}</h3>
          <button onClick={clearActive} className="p-2 text-legal-400 hover:text-error transition-colors" title="Limpiar esta conversación">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-legal-500 py-8">
              <p className="text-lg font-display text-primary mb-2">Bienvenido al Asistente IA Legal</p>
              <p className="text-sm">Pregunte sobre investigación jurídica, análisis de casos o redacción de documentos.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-md p-3 ${message.role === 'user' ? 'bg-primary text-white' : 'bg-surface-container text-legal-900'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-legal-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container rounded-md p-3">
                <FiLoader className="w-5 h-5 animate-spin text-legal-500" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {attachedFile && (
            <div className="mb-2 px-3 py-1.5 bg-primary/5 text-primary-container rounded-md text-sm flex items-center justify-between">
              <span className="truncate mr-2">{attachedFile.name}</span>
              <button type="button" onClick={() => setAttachedFile(null)} className="text-primary-container hover:text-primary">&times;</button>
            </div>
          )}
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" onChange={handleFileAttach} className="hidden" accept="*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost px-3" title="Adjuntar archivo">
              <FiPaperclip className="w-5 h-5" />
            </button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Haga una pregunta legal..." disabled={isLoading} className="input flex-1" />
            <button type="submit" disabled={isLoading || (!input.trim() && !attachedFile)} className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
