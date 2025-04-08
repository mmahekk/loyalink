import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function UserTransactions() {
  const [transactions, setTransactions] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)

  const fetchTransactions = async (pageNum) => {
    try {
      const res = await axios.get('/users/me/transactions', {
        params: { page: pageNum, limit: 5 }
      })
      setTransactions(res.data.results)
      setCount(res.data.count)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load transactions')
    }
  }

  useEffect(() => {
    fetchTransactions(page)
  }, [page])

  const typeColor = {
    purchase: '#e0f7ff',
    redemption: '#fff0f0',
    transfer: '#f0fff0',
    adjustment: '#f5f5f5',
    event: '#f9f9ff'
  }

  return (
    <div className={styles.container}>
      <h1>My Transactions</h1>

      {transactions.length === 0 && <p>No transactions yet.</p>}

      {transactions.map(tx => (
        <div key={tx.id} style={{
          background: typeColor[tx.type] || '#f4f4f4',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p><strong>Type:</strong> {tx.type}</p>
          {tx.spent && <p><strong>Spent:</strong> ${tx.spent.toFixed(2)}</p>}
          {tx.amount !== undefined && <p><strong>Points:</strong> {tx.amount}</p>}
          {tx.relatedId && (
            <p><strong>Related ID:</strong> {tx.relatedId}</p>
          )}
          <p><strong>Created By:</strong> {tx.createdBy}</p>
          {tx.remark && <p><strong>Remark:</strong> {tx.remark}</p>}
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
