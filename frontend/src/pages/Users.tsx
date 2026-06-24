import { useState, useEffect, type FormEvent } from 'react'
import { User } from '../types'
import { userService } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/common/Loading'
import toast from 'react-hot-toast'
import { FiUserPlus, FiTrash2, FiShield, FiMail, FiUser, FiX } from 'react-icons/fi'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [roleId, setRoleId] = useState(2)
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = typeof currentUser?.role === 'object' && currentUser?.role !== null && 'name' in currentUser.role && currentUser.role.name === 'admin'

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try { setIsLoading(true); const data = await userService.getAll(); setUsers(data) }
    catch { toast.error('Error al cargar usuarios') }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) { toast.error('Complete todos los campos obligatorios'); return }
    setSubmitting(true)
    try { await userService.create({ email, password, full_name: fullName, role_id: roleId }); toast.success('Usuario creado correctamente'); setEmail(''); setPassword(''); setFullName(''); setRoleId(2); setShowForm(false); await loadUsers() }
    catch { toast.error('Error al crear usuario') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (u: User) => {
    if (!confirm(`¿Eliminar a ${u.full_name}?`)) return
    try { await userService.delete(u.id); toast.success('Usuario eliminado'); await loadUsers() }
    catch { toast.error('Error al eliminar usuario') }
  }

  if (isLoading) return <Loading text="Cargando usuarios..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Usuarios</h1>
          <p className="mt-1.5 text-on-surface-variant">Administración del talento jurídico</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm(!showForm)} className="btn btn-primary"><FiUserPlus className="w-4 h-4" />Nuevo Usuario</button>}
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-headline font-bold text-primary">Crear Nuevo Usuario</h2>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost p-1"><FiX className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="label">Nombre Completo</label>
              <div className="relative"><FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" /><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-11" placeholder="Nombre del abogado" /></div>
            </div>
            <div>
              <label className="label">Correo Electrónico</label>
              <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11" placeholder="correo@ejemplo.com" /></div>
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Contraseña" />
            </div>
            <div>
              <label className="label">Rol</label>
              <div className="relative"><FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" /><select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="input pl-11 appearance-none cursor-pointer"><option value={1}>Admin</option><option value={2}>Abogado</option></select></div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Creando...' : 'Crear Usuario'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-low">
              <th className="text-left px-5 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nombre</th>
              <th className="text-left px-5 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Correo</th>
              <th className="text-left px-5 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rol</th>
              <th className="text-left px-5 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Estado</th>
              {isAdmin && <th className="text-right px-5 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-low transition-colors" style={{ minHeight: '64px' }}>
                <td className="px-5 py-4 text-sm font-bold text-primary">{u.full_name}</td>
                <td className="px-5 py-4 text-sm text-on-surface-variant">{u.email}</td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-surface-low text-on-surface-variant">
                    <span className={`w-1.5 h-1.5 rounded-full ${(typeof u.role === 'object' && u.role?.name === 'admin') ? 'bg-violet-500' : 'bg-blue-500'}`} />
                    {typeof u.role === 'object' ? u.role.name : u.role}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${u.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-error-container text-on-error-container'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active !== false ? 'bg-emerald-500' : 'bg-error'}`} />
                    {u.is_active !== false ? 'Activo' : 'Inactivo'}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Eliminar usuario"><FiTrash2 className="w-4 h-4" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
