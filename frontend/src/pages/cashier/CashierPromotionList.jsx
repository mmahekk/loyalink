import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'


export default function CashierPromotionList() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/promotions')
      setPromotions(res.data.results)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  return (
    <>
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/cashier')}
        style={{
          background: 'none',
          border: 'none',
          color: '#1C2D5A',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        ← Back to Dashboard
      </button>
    </div>

    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>All Promotions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        promotions.map(promo => (
          <div
            key={promo.id}
            style={{
              background: '#f9f9f9',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginBottom: '1rem'
            }}
          >
            <h3>{promo.name} (ID: {promo.id})</h3>
            <p><strong>Type:</strong> {promo.type}</p>
            <p><strong>Description:</strong> {promo.description}</p>
            <p><strong>Ends:</strong> {new Date(promo.endTime).toLocaleString()}</p>
            {promo.minSpending != null && !isNaN(promo.minSpending) && (
              <p><strong>Min Spending:</strong> ${parseFloat(promo.minSpending).toFixed(2)}</p>
            )}
            {promo.rate !== null && <p><strong>Rate:</strong> {promo.rate}</p>}
            {promo.points !== null && <p><strong>Points:</strong> {promo.points}</p>}
          </div>
        ))
      )}
    </div>
  </>
)
}