import axios, { AxiosInstance, AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Sesión expirada. Inicie sesión nuevamente.')
    } else if (error.response?.status === 403) {
      toast.error('No tiene permisos para realizar esta acción.')
    } else if (error.response?.status === 500) {
      toast.error('Error del servidor. Intente nuevamente.')
    } else {
      toast.error(error.message || 'Ocurrió un error')
    }
    return Promise.reject(error)
  }
)

export default api
