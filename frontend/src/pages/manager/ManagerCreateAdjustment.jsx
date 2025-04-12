import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'


export default function ManagerCreateAdjustment() {
  
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const defaultRelatedId = query.get('relatedId') || ''
  const [form, setForm] = useState({
    utorid: '',
    relatedId: defaultRelatedId,
    amount: '',
    remark: '',
    promotionIds: ''
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.utorid || !form.relatedId || !form.amount) {
      toast.error('UTORid, Related Transaction ID, and Amount are required')
      return
    }

    const payload = {
      utorid: form.utorid.trim(),
      type: 'adjustment',
      relatedId: parseInt(form.relatedId),
      amount: parseFloat(form.amount),
    }

    if (form.remark) payload.remark = form.remark.trim()
    if (form.promotionIds) {
      const ids = form.promotionIds
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n))
      if (ids.length > 0) payload.promotionIds = ids
    }

    setSubmitting(true)
    try {
      const res = await axios.post('/transactions', payload)
      toast.success(`Adjustment created (ID: ${res.data.id})`)
      navigate(`/manager/transactions/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Adjustment creation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
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
        ← Back to Transactions
      </button>
      <h2 style={{ marginBottom: '1rem' }}>Create Adjustment Transaction</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input
          name="utorid"
          placeholder="Target UTORid"
          value={form.utorid}
          onChange={handleChange}
          required
        />
        <input
          name="relatedId"
          type="number"
          placeholder="Related Transaction ID"
          value={form.relatedId}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Adjustment Amount (e.g. -40)"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          name="remark"
          placeholder="Optional remark"
          value={form.remark}
          onChange={handleChange}
        />
        <input
          name="promotionIds"
          placeholder="Promotion IDs (comma separated)"
          value={form.promotionIds}
          onChange={handleChange}
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
          {submitting ? 'Submitting...' : 'Submit Adjustment'}
        </button>
      </form>
    </div>
  )
}
