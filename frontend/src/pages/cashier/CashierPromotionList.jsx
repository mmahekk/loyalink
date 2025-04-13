import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function CashierPromotionList() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)

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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>All Promotions</h1>
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
  )
}
