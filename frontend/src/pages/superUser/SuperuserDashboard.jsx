import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import axios from '../../api/axiosInstance'
import { useNavigate, Navigate } from 'react-router-dom'
import { getClearance } from '../../utils/roles'
import cardStyles from '../DashboardCard.module.css'

export default function SuperuserDashboard() {
  const { user, token } = useContext(AuthContext)
  const [stats, setStats] = useState({
    eventCount: 0,
    promotionCount: 0,
    userCount: 0
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

        setStats({
          eventCount: eventRes.data.length,
          promotionCount: promoRes.data.length,
          userCount: userRes.data.count || userRes.data.length || 0
        })
      } catch (err) {
        console.error('Failed to load superuser stats:', err)
      }
    }

    fetchStats()
  }, [token])

  if (!user || clearance < 3) return <Navigate to="/select-role" />

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Superuser Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <OverviewTile title="Events" value={stats.eventCount} onClick={() => navigate('/manager/events')} />
        <OverviewTile title="Promotions" value={stats.promotionCount} onClick={() => navigate('/manager/promotions')} />
        <OverviewTile title="Users" value={stats.userCount} onClick={() => navigate('/manager/users')} />
        <OverviewTile title="Transactions" value="View All" onClick={() => navigate('/manager/transactions')} />
      </div>
    </div>
  )
}

function OverviewTile({ title, value, onClick }) {
    return (
      <div
        onClick={onClick}
        className={`${cardStyles.card} ${cardStyles.superuser}`}
        style={{
          padding: '1.2rem',
          borderRadius: '10px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease-in-out'
        }}
      >
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ fontSize: '1.2rem' }}>{value}</div>
      </div>
    )
  }
  
