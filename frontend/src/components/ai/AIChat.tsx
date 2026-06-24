import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { AIMessage } from '../../types'
import { aiService } from '../../services/aiService'
import { FiSend, FiTrash2, FiPaperclip, FiPlus, FiMessageSquare, FiX } from 'react-icons/fi'

interface Conversation { id: string; name: string; messages: AIMessage[] }

const STORAGE_KEY = 'ai_conversations'
const ACTIVE_KEY = 'ai_active_conv'

function loadConversations(): Conversation[] { try { const raw = sessionStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] } }
function saveConversations(convs: Conversation[]) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(convs)) }
function loadActiveId(): string | null { return sessionStorage.getItem(ACTIVE_KEY) }
function saveActiveId(id: string) { sessionStorage.setItem(ACTIVE_KEY, id) }

export default function AIChat({ caseId }: { caseId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => { const saved = loadConversations(); return saved.length > 0 ? saved : [{ id: 'conv_1', name: 'Conversación 1', messages: [] }] })
  const [activeConvId, setActiveConvId] = useState<string>(() => loadActiveId() || conversations[0]?.id || 'conv_1')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0]
  const messages = activeConv?.messages || []

  useEffect(() => { saveConversations(conversations) }, [conversations])
  useEffect(() => { saveActiveId(activeConvId) }, [activeConvId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const updateMessages = useCallback((convId: string, updater: (msgs: AIMessage[]) => AIMessage[]) => { setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: updater(c.messages) } : c)) }, [])

  const genName = (): string => { const max = conversations.reduce((n, c) => { const m = c.name.match(/^Conversación (\d+)$/); return m ? Math.max(n, parseInt(m[1])) : n }, 0); return `Conversación ${max + 1}` }

  const newConversation = () => { const conv = { id: 'conv_' + Date.now(), name: genName(), messages: [] }; setConversations(prev => [...prev, conv]); setActiveConvId(conv.id) }

  const switchConversation = (id: string) => { setActiveConvId(id); setAttachedFile(null) }

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (filtered.length === 0) { const conv = { id: 'conv_' + Date.now(), name: 'Conversación 1', messages: [] }; filtered.push(conv); setActiveConvId(conv.id) }
      else if (id === activeConvId) setActiveConvId(filtered[0].id)
      return filtered
    })
  }

  const clearActive = () => updateMessages(activeConvId, () => [])

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setAttachedFile({ name: file.name, content: 'Extrayendo texto...' })
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await fetch('/api/v1/ai/extract', { method: 'POST', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }, body: formData })
      const data = await res.json()
      setAttachedFile({ name: data.filename, content: data.text || '[Sin texto extraible]' })
    } catch { setAttachedFile({ name: file.name, content: '[Error al extraer texto del archivo]' }) }
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

    const userMessage: AIMessage = { id: Date.now().toString(), role: 'user', content: attachedFile ? `[Archivo: ${attachedFile.name}] ${input.trim() || 'Analiza este documento'}` : input.trim(), timestamp: new Date().toISOString() }
    const currentMessages = messages
    updateMessages(activeConvId, prev => [...prev, userMessage])
    setInput(''); setAttachedFile(null); setIsLoading(true)

    try { const response = await aiService.sendMessage(messageText, currentMessages, { caseId }); updateMessages(activeConvId, prev => [...prev, response]) }
    catch { updateMessages(activeConvId, prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Lo siento, ocurrió un error. Intente nuevamente.', timestamp: new Date().toISOString() }]) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="flex h-full bg-surface-lowest rounded-xl border border-outline-variant/20 overflow-hidden animate-fade-in">
      <div className="w-56 shrink-0 bg-surface-low border-r border-outline-variant/20 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-outline-variant/20">
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Conversaciones</h4>
          <button onClick={newConversation} className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-all" title="Nueva conversación"><FiPlus className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 && <p className="text-xs text-outline p-2">Sin conversaciones.</p>}
          {conversations.map(c => (
            <button key={c.id} onClick={() => switchConversation(c.id)} className={`w-full text-left p-2.5 flex items-center gap-2 rounded-lg transition-colors ${c.id === activeConvId ? 'bg-surface-lowest text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <FiMessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate flex-1">{c.name}</span>
              <button onClick={(e) => deleteConversation(e, c.id)} className="p-0.5 rounded text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><FiX className="w-3 h-3" /></button>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
          <h3 className="text-sm font-headline font-bold text-primary truncate">{activeConv?.name || 'Chat'}</h3>
          <button onClick={clearActive} className="btn btn-ghost p-2 text-outline hover:text-error"><FiTrash2 className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4"><FiMessageSquare className="w-7 h-7 text-primary-container" /></div>
              <p className="text-sm font-bold text-primary mb-1">Bienvenido al Asistente IA Legal</p>
              <p className="text-sm text-on-surface-variant max-w-sm">Pregunte sobre investigación jurídica, análisis de casos o redacción de documentos.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${message.role === 'user' ? 'bg-primary-container text-white rounded-br-sm' : 'bg-surface-low text-on-surface rounded-bl-sm'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1.5 font-medium ${message.role === 'user' ? 'text-on-primary-container' : 'text-outline'}`}>{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-surface-low rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '300ms' }} /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant/20">
          {attachedFile && (
            <div className="mb-3 px-3 py-2 bg-surface-low border border-outline-variant/20 rounded-lg text-sm flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2 min-w-0"><FiPaperclip className="w-3.5 h-3.5 text-primary-container shrink-0" /><span className="truncate text-on-surface-variant">{attachedFile.name}</span></div>
              <button type="button" onClick={() => setAttachedFile(null)} className="p-0.5 rounded text-outline hover:text-error transition-colors ml-2"><FiX className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" onChange={handleFileAttach} className="hidden" accept="*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-ghost px-3 text-outline hover:text-primary" title="Adjuntar archivo"><FiPaperclip className="w-5 h-5" /></button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Haga una pregunta legal..." disabled={isLoading} className="input flex-1" />
            <button type="submit" disabled={isLoading || (!input.trim() && !attachedFile)} className="btn btn-primary px-4"><FiSend className="w-4 h-4" /></button>
          </div>
        </form>
      </div>
    </div>
  )
}
