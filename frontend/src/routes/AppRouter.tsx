import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import Loading from '../components/common/Loading'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Cases from '../pages/Cases'
import CaseDetail from '../pages/CaseDetail'
import CreateCase from '../pages/CreateCase'
import Calendar from '../pages/Calendar'
import AIAssistant from '../pages/AIAssistant'
import Users from '../pages/Users'
import NotFound from '../pages/NotFound'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Cargando..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/dashboard" replace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Cases />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CreateCase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CaseDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Calendar />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AIAssistant />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotFound />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
