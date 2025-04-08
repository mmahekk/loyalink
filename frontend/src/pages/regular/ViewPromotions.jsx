import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function ViewPromotions() {
  const [promotions, setPromotions] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)

  const fetchPromotions = async (pageNum) => {
    try {
      const res = await axios.get('/promotions', {
        params: { page: pageNum, limit: 5 }
      })
      setPromotions(res.data.results)
      setCount(res.data.count)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load promotions')
    }
  }

  useEffect(() => {
    fetchPromotions(page)
  }, [page])

  return (
    <div className={styles.container}>
      <h1>Available Promotions</h1>
      {promotions.length === 0 && <p>No promotions available.</p>}

      {promotions.map(promo => (
        <div key={promo.id} style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          background: promo.type === 'automatic' ? '#e8f1ff' : '#fff7e6'
        }}>
          <h3>{promo.name}</h3>
          <p><strong>Type:</strong> {promo.type}</p>
          <p><strong>Ends:</strong> {new Date(promo.endTime).toLocaleString()}</p>
        </div>
      ))}

      {count > 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <button disabled={page * 5 >= count} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
