import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!user) return null

  const role = user.role
  const bgColor = role === 'regular' ? '#1C2D5A' : '#333' // PMS 655 blue

  return (
    <nav style={{
      backgroundColor: bgColor,
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <div
        onClick={() => navigate('/user')}
        style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}
      >
        Loyalty App
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {role === 'regular' && (
          <button
            onClick={() => navigate('/user/profile')}
            style={{
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            My Profile
          </button>
        )}

        <span style={{ fontSize: '0.95rem' }}>{user.name} ({role})</span>

        <button
          onClick={logout}
          style={{
            background: 'white',
            color: bgColor,
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
