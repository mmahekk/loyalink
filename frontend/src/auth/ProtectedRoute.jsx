import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, activeRole } = useContext(AuthContext)

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" />

  const role = activeRole || user.role

  // Redirect if role not allowed
  if (roles && !roles.includes(role)) {
    return <Navigate to={`/${role === 'regular' ? 'user' : role}`} />
  }

  return children
}
