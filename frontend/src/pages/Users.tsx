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
        <h1 className="text-2xl font-bold font-display text-primary">Usuarios</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <FiUserPlus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold font-display text-primary mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="label">Nombre Completo</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
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
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
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
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-legal-400" />
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="input pl-10"
                >
                  <option value={1}>Admin</option>
                  <option value={2}>Abogado</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="text-left px-4 py-4 text-sm font-medium text-legal-500">Nombre</th>
              <th className="text-left px-4 py-4 text-sm font-medium text-legal-500">Correo</th>
              <th className="text-left px-4 py-4 text-sm font-medium text-legal-500">Rol</th>
              <th className="text-left px-4 py-4 text-sm font-medium text-legal-500">Estado</th>
              {isAdmin && <th className="text-right px-4 py-4 text-sm font-medium text-legal-500">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-4 text-sm text-legal-900">{u.full_name}</td>
                <td className="px-4 py-4 text-sm text-legal-500">{u.email}</td>
                <td className="px-4 py-4 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      (typeof u.role === 'object' && u.role?.name === 'admin')
                        ? 'bg-primary'
                        : 'bg-primary-container'
                    }`} />
                    <span className="text-legal-600">
                      {typeof u.role === 'object' ? u.role.name : u.role}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      u.is_active !== false ? 'bg-primary-container' : 'bg-error'
                    }`} />
                    <span className="text-legal-600">
                      {u.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1 text-legal-400 hover:text-error transition-colors"
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
