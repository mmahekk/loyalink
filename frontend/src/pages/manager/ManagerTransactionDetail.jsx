import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ManagerTransactionDetail() {
  const { transactionId } = useParams()
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const navigate = useNavigate()

  const fetchTransaction = async () => {
    try {
      const res = await axios.get(`/transactions/${transactionId}`)
      setTx(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }

  const toggleSuspicious = async () => {
    try {
      setMarking(true)
      const res = await axios.patch(`/transactions/${transactionId}/suspicious`, {
        suspicious: !tx.suspicious
      })
      toast.success(
        res.data.suspicious
          ? 'Marked as suspicious'
          : 'Unmarked as suspicious'
      )
      setTx(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update suspicious status')
    } finally {
      setMarking(false)
    }
  }
  

  useEffect(() => {
    fetchTransaction()
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>
  if (!tx) return <p style={{ padding: '2rem' }}>Transaction not found.</p>

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/manager/transactions')}
        style={{
          marginBottom: '1rem',
          background: 'none',
          border: 'none',
          color: '#1C2D5A',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        ← Back to Transaction List
      </button>

      <h2 style={{ marginBottom: '1.5rem' }}>Transaction #{tx.id}</h2>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
        <Detail label="UTORid" value={tx.utorid} />
        <Detail label="Type" value={tx.type} />
        {tx.spent !== undefined && <Detail
            label="Spent ($)"
            value={
                typeof tx.spent === 'number'
                ? tx.spent.toFixed(2)
                : tx.spent
                    ? String(tx.spent)
                    : '—'
            }
            />}
        <Detail label="Points" value={tx.amount} />
        <Detail label="Promotion IDs" value={tx.promotionIds.length ? tx.promotionIds.join(', ') : '—'} />
        <Detail label="Remark" value={tx.remark || '—'} />
        <Detail label="Created By" value={tx.createdBy} />
        <Detail label="Suspicious" value={tx.suspicious ? 'Yes' : 'No'} />
      </div>

      <button
        onClick={toggleSuspicious}
        disabled={marking}
        style={{
            marginTop: '2rem',
            padding: '0.6rem 1.2rem',
            background: tx.suspicious ? '#1C2D5A' : '#B71C1C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
        }}
        >
            {marking
                ? 'Updating...'
                : tx.suspicious
                ? 'Unmark as Suspicious'
                : 'Mark as Suspicious'}
        </button>

    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <strong>{label}:</strong>
      <div style={{ padding: '0.3rem 0.5rem', background: '#f9f9f9', borderRadius: '6px', marginTop: '0.2rem' }}>
        {value}
      </div>
    </div>
  )
}
