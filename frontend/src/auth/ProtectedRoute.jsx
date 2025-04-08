import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext)

  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} /> // redirect to their dashboard
  }

  return children
}
