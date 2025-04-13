import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, activeRole, loaded } = useContext(AuthContext)
  const location = useLocation()
  const role = activeRole || user?.role

  if (!loaded) return null
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to={`/${role}`} replace />
  }

  return children
}
