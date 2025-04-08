import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, activeRole} = useContext(AuthContext)
  const role = activeRole || user.role
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(role)) {
    return <Navigate to={`/${role}`} /> // redirect to their dashboard
  }

  return children
}
