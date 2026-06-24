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

  const isAdmin = typeof currentUser?.role === 'object'
    && currentUser?.role !== null
    && 'name' in currentUser.role
    && currentUser.role.name === 'admin'

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getAll()
      setUsers(data)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) {
      toast.error('Complete todos los campos obligatorios')
      return
    }
    setSubmitting(true)
    try {
      await userService.create({ email, password, full_name: fullName, role_id: roleId })
      toast.success('Usuario creado correctamente')
      setEmail('')
      setPassword('')
      setFullName('')
      setRoleId(2)
      setShowForm(false)
      await loadUsers()
    } catch {
      toast.error('Error al crear usuario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Eliminar a ${user.full_name}?`)) return
    try {
      await userService.delete(user.id)
      toast.success('Usuario eliminado')
      await loadUsers()
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  if (isLoading) return <Loading text="Cargando usuarios..." />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Usuarios</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Administración de usuarios del sistema</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <FiUserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Crear Nuevo Usuario</h2>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost p-1">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="label">Nombre Completo</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="Nombre del abogado"
                />
              </div>
            </div>
            <div>
              <label className="label">Correo Electrónico</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Contraseña"
              />
            </div>
            <div>
              <label className="label">Rol</label>
              <div className="relative">
                <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="input pl-10 appearance-none cursor-pointer"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Abogado</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Creando...' : 'Crear Usuario'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Correo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Estado</th>
              {isAdmin && <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white">{u.full_name}</td>
                <td className="px-4 py-3.5 text-sm text-neutral-500 dark:text-neutral-400">{u.email}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    (typeof u.role === 'object' && u.role?.name === 'admin')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400'
                      : (typeof u.role === 'object' && u.role?.name === 'abogado')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  }`}>
                    {typeof u.role === 'object' ? u.role.name : u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.is_active !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {u.is_active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Eliminar usuario"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
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
