import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function UserDashboard() {
  const { user, setUser } = useContext(AuthContext)
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
  const refreshUser = async () => {
    try {
      const res = await axios.get('/users/me')
      setUser(res.data)
    } catch (err) {
      toast.error('Failed to refresh user profile')
    }
  }
  

  useEffect(() => {
    fetchRecentTransactions()
    refreshUser()
  }, [])

  const typeColor = {
    purchase: '#e0f7ff',
    redemption: '#f0fff0',
    transfer: '#fff0f0',
    adjustment: '#f5f5f5',
    event: '#f9f9ff'
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Welcome, {user?.name || 'User'}!
      </h1>

      <div style={{
        padding: '1.5rem',
        borderRadius: '12px',
        background: '#e6f0ff',
        border: '1px solid #aac',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Points: {user?.points ?? 0}</h2>
        <p><strong>Status:</strong> {user?.verified ? 'Verified' : 'Not Verified'}</p>
      </div>

      <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        marginBottom: '2rem'
      }}
      className="action-buttons"
      >
        <button onClick={() => navigate('/user/qr')}>Show My QR Code</button>
        <button onClick={() => navigate('/user/transfer')}>Transfer Points</button>
        <button onClick={() => navigate('/user/redeem')}>Redeem Points</button>
        <button onClick={() => navigate('/user/promotions')}>View Promotions</button>
        <button onClick={() => navigate('/user/events')}>View Events</button>
        <button onClick={() => navigate('/user/transactions')}>My Transactions</button>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Recent Transactions</h2>
      {recentTx.length === 0 ? (
        <p>No recent transactions</p>
      ) : (
        recentTx.map(tx => (
          <div key={tx.id} style={{
            background: typeColor[tx.type] || '#f4f4f4',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{tx.type.toUpperCase()}</strong>
              {tx.amount !== undefined && <span>{tx.amount} pts</span>}
            </div>
            {tx.relatedId && <p>Related ID: {tx.relatedId}</p>}
            {tx.promotionId && <p>Promo ID: {tx.promotionId}</p>}
            {tx.remark && <p>Note: {tx.remark}</p>}
            {tx.type === 'redemption' && (
              <div style={{
                marginTop: '0.5rem',
                display: 'inline-block',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: tx.processed ? '#155724' : '#856404',
                backgroundColor: tx.processed ? '#d4edda' : '#fff3cd',
                border: `1px solid ${tx.processed ? '#c3e6cb' : '#ffeeba'}`
              }}>
                {tx.processed ? 'Processed' : 'Pending'}
              </div>
            )}
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>By: {tx.createdBy}</p>
          </div>
        ))
      )}
    </div>
  )
}
