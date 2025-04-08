import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import axios from '../../api/axiosInstance'
import { useNavigate, Navigate } from 'react-router-dom'
import { getClearance } from '../../utils/roles'

export default function ManagerDashboard() {
  const { user, token } = useContext(AuthContext)
  const [stats, setStats] = useState({
    eventCount: 0,
    promotionCount: 0,
    users: { regular: 0, cashier: 0, manager: 0, superuser: 0 }
  })

  const navigate = useNavigate()
  const clearance = getClearance(user.role)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventRes, promoRes, userRes] = await Promise.all([
          axios.get('/events', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/promotions', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/users', { headers: { Authorization: `Bearer ${token}` } })
        ])

        const userCounts = { regular: 0, cashier: 0, manager: 0, superuser: 0 }
        userRes.data.forEach(u => {
          if (userCounts[u.role] !== undefined) userCounts[u.role]++
        })

        setStats({
          eventCount: eventRes.data.length,
          promotionCount: promoRes.data.length,
          users: userCounts
        })
      } catch (err) {
        console.error('Failed to load manager stats:', err)
      }
    }

    fetchStats()
  }, [token])

  if (!user || clearance < 2) return <Navigate to="/select-role" />

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Manager Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <OverviewTile title="Events" value={stats.eventCount} onClick={() => navigate('/manager/events')} />
        <OverviewTile title="Promotions" value={stats.promotionCount} onClick={() => navigate('/manager/promotions')} />
        <OverviewTile title="Users" value={`${stats.users.regular} Regular`} />
        <OverviewTile title="Cashiers" value={`${stats.users.cashier} Cashiers`} />
        <OverviewTile title="Managers" value={`${stats.users.manager} Managers`} />
        <OverviewTile title="Superusers" value={`${stats.users.superuser} Superusers`} />
      </div>
    </div>
  )
}

function OverviewTile({ title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#00695C',
        color: 'white',
        padding: '1.2rem',
        borderRadius: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out'
      }}
    >
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}
