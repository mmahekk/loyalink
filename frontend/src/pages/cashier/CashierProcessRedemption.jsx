import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ProcessRedemption() {
  const navigate = useNavigate()
  const [transactionId, setTransactionId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!transactionId) {
      toast.error('Please enter a Transaction ID')
      return
    }

    setSubmitting(true)
    try {
      await axios.patch(`/transactions/${transactionId}/processed`, { processed: true })
      toast.success(`Redemption Transaction #${transactionId} processed!`)
      setTransactionId('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Processing failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/cashier')}
        style={{
          marginBottom: '1rem',
          background: 'none',
          border: 'none',
          color: '#1C2D5A',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: '1rem' }}>Process Redemption</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
        <input
          type="number"
          placeholder="Enter Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#1C2D5A',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Processing...' : 'Process'}
        </button>
      </form>
    </div>
  )
}
