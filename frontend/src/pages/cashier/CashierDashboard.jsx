import { useContext } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import { getClearance } from '../../utils/roles'
import cardStyles from '../DashboardCard.module.css'

export default function CashierDashboard() {
  const { user, activeRole } = useContext(AuthContext)
  const navigate = useNavigate()
  const role = activeRole || user.role
  const clearance = getClearance(role)

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
        }}
      >
        <DashboardTile title="Create Transaction" onClick={() => navigate('/cashier/transactions')} />
        <DashboardTile title="Process Redemption" onClick={() => navigate('/cashier/process-redemption')} />
        <DashboardTile title="Register New User" onClick={() => navigate('/cashier/register')} />
        <DashboardTile title="View Events" onClick={() => navigate('/cashier/events')} />
        <DashboardTile title="View Promotions" onClick={() => navigate('/cashier/promotions')} />
      </div>
    </div>
  )
}

function DashboardTile({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${cardStyles.card} ${cardStyles.cashier}`}
      style={{
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

