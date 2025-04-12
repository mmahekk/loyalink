import { useNavigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { getClearance } from '../utils/roles'

export default function RoleSelector() {
  const { user, setActiveRole } = useContext(AuthContext)
  const navigate = useNavigate()
  
  
  if (!user) return null

  const clearance = getClearance(user.role)
  const availableRoles = ['regular']
  if (clearance >= 1) availableRoles.push('cashier')
  if (clearance >= 2) availableRoles.push('manager')
  if (clearance >= 3) availableRoles.push('superuser')

  const handleSelect = (role) => {
    setActiveRole(role)
    localStorage.setItem('activeRole', role)
    navigate(`/${role === 'regular' ? 'user' : role}`)
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Select Role</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => handleSelect(role)}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer'
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
