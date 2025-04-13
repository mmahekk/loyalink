import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getClearance } from '../utils/roles'

export default function NavBar() {
  const { user, logout, activeRole, setActiveRole } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!user) return null

  const role = activeRole || user.role
  const realClearance = getClearance(user.role)
  const roleColors = {
    regular: '#1C2D5A',
    cashier: '#4A148C',
    manager: '#00695C',
    superuser: '#B71C1C'
  }

  const bgColor = roleColors[role] || '#333'

  const buttonStyle = {
    background: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0
  }

  const buttonHoverStyle = {
    background: 'white',
    color: bgColor
  }

  return (
    <nav style={{
      backgroundColor: bgColor,
      color: 'white',
      padding: '0.75rem 1.5rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem' }}>
            Loyalty App
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
            {user.name} ({role})
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          flexGrow: 1
        }}>
          <button
            onClick={() => navigate(`/${role === 'regular' ? 'user' : role}`)}
            style={buttonStyle}
            onMouseEnter={e => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={e => Object.assign(e.target.style, buttonStyle)}
          >
            Home
          </button>

          <button
            onClick={() => navigate('/user/profile')}
            style={buttonStyle}
            onMouseEnter={e => Object.assign(e.target.style, buttonHoverStyle)}
            onMouseLeave={e => Object.assign(e.target.style, buttonStyle)}
          >
            My Profile
          </button>

          {realClearance > 0 && (
            <button
              onClick={() => {
                setActiveRole(null)
                navigate('/select-role')
              }}
              style={buttonStyle}
              onMouseEnter={e => Object.assign(e.target.style, buttonHoverStyle)}
              onMouseLeave={e => Object.assign(e.target.style, buttonStyle)}
            >
              Change Role
            </button>
          )}

          <button
            onClick={logout}
            style={{
              background: 'white',
              color: bgColor,
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={e => {
              e.target.style.background = '#6082B6'
            }}
            onMouseLeave={e => {
              e.target.style.background = 'white'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
