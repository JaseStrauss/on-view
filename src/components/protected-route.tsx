import { Navigate } from 'react-router-dom'
import { AppLoader } from '@/components/app-loader'
import { useAuth } from '@/contexts/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AppLoader layout="page" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
