import { useState, useEffect, type FormEvent } from 'react'
import { User } from '../types'
import { userService } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/common/Loading'
import toast from 'react-hot-toast'
import { FiUserPlus, FiTrash2, FiShield, FiMail, FiUser } from 'react-icons/fi'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-legal-900 dark:text-white">Usuarios</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <FiUserPlus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-legal-800 rounded-xl p-6 border border-legal-200 dark:border-legal-700">
          <h2 className="text-lg font-semibold text-legal-900 dark:text-white mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Nombre Completo</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-legal-300 rounded-lg bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
                  placeholder="Nombre del abogado"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Correo Electrónico</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-legal-300 rounded-lg bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-legal-300 rounded-lg bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
                placeholder="Contraseña"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-legal-700 dark:text-legal-200 mb-1">Rol</label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-legal-300 rounded-lg bg-white dark:bg-legal-700 text-legal-900 dark:text-white"
                >
                  <option value={2}>Abogado</option>
                  <option value={1}>Admin</option>
                  <option value={3}>Cliente</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-legal-800 rounded-xl border border-legal-200 dark:border-legal-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-legal-200 dark:border-legal-700">
              <th className="text-left px-4 py-3 text-sm font-medium text-legal-500">Nombre</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-legal-500">Correo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-legal-500">Rol</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-legal-500">Estado</th>
              {isAdmin && <th className="text-right px-4 py-3 text-sm font-medium text-legal-500">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-legal-200 dark:divide-legal-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-legal-50 dark:hover:bg-legal-700/50">
                <td className="px-4 py-3 text-sm text-legal-900 dark:text-white">{u.full_name}</td>
                <td className="px-4 py-3 text-sm text-legal-600 dark:text-legal-300">{u.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (typeof u.role === 'object' && u.role?.name === 'admin')
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : (typeof u.role === 'object' && u.role?.name === 'abogado')
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {typeof u.role === 'object' ? u.role.name : u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.is_active !== false
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {u.is_active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1 text-legal-400 hover:text-red-600 transition-colors"
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
