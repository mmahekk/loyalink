import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function UserDashboard() {
  const { user } = useContext(AuthContext)
  const [recentTx, setRecentTx] = useState([])
  const navigate = useNavigate()

  const fetchRecentTransactions = async () => {
    try {
      const res = await axios.get('/users/me/transactions', {
        params: { page: 1, limit: 3 }
      })
      setRecentTx(res.data.results)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load recent transactions')
    }
  }

  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const typeColor = {
    purchase: '#e0f7ff',
    redemption: '#fff0f0',
    transfer: '#f0fff0',
    adjustment: '#f5f5f5',
    event: '#f9f9ff'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Welcome, {user?.name || 'User'}!</h1>

      <div style={{
        marginTop: '1rem',
        padding: '1.5rem',
        borderRadius: '12px',
        background: '#e6f0ff',
        border: '1px solid #aac'
      }}>
        <h2>Points: {user?.points ?? 0}</h2>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Status:</strong> {user?.verified ? 'Verified' : 'Not Verified'}
        </p>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Recent Transactions</h2>
      {recentTx.length === 0 ? (
        <p>No recent transactions</p>
      ) : (
        recentTx.map(tx => (
          <div key={tx.id} style={{
            background: typeColor[tx.type] || '#f4f4f4',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p><strong>Type:</strong> {tx.type}</p>
            {tx.amount !== undefined && <p><strong>Points:</strong> {tx.amount}</p>}
            {tx.remark && <p><strong>Remark:</strong> {tx.remark}</p>}
            <p><strong>By:</strong> {tx.createdBy}</p>
          </div>
        ))
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '2rem',
        maxWidth: '400px',
        marginInline: 'auto'
      }}>
        <button onClick={() => navigate('/user/qr')}>Show My QR Code</button>
        <button onClick={() => navigate('/user/transfer')}>Transfer Points</button>
        <button onClick={() => navigate('/user/redeem')}>Redeem Points</button>
        <button onClick={() => navigate('/user/promotions')}>View Promotions</button>
        <button onClick={() => navigate('/user/events')}>View Events</button>
        <button onClick={() => navigate('/user/transactions')}>My Transactions</button>
      </div>
    </div>
  )
}
