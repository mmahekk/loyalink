import { useContext } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import { getClearance } from '../../utils/roles'

export default function CashierDashboard() {
  const { user } = useContext(AuthContext) 
  const navigate = useNavigate()
  const clearance = getClearance(user.role)

  if (!user || clearance < 1) return <Navigate to="/select-role" />

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        Welcome, {user?.name || 'Cashier'}!
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <DashboardTile title="Create Transaction" onClick={() => navigate('/cashier/transactions')} />
        <DashboardTile title="Process Redemption" onClick={() => navigate('/cashier/process-redemption')} />
        <DashboardTile title="Register New User" onClick={() => navigate('/cashier/register')} />
      </div>
    </div>
  )
}

function DashboardTile({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#4A148C', // matching navbar purple
        color: 'white',
        padding: '1.2rem',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out'
      }}
    >
      <h3 style={{ fontSize: '1.3rem', textAlign: 'center' }}>{title}</h3>
    </div>
  )
}
