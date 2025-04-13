import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function CreateTransaction() {
  const [form, setForm] = useState({
    utorid: '',
    spent: '',
    promotionIds: '',
    remark: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.utorid || !form.spent) {
      toast.error('UTORid and amount spent are required')
      return
    }

    const payload = {
      utorid: form.utorid.trim(),
      type: 'purchase',
      spent: parseFloat(form.spent)
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
      toast.success(`Transaction created (ID: ${res.data.id})`)
      navigate('/cashier')  
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction creation failed')
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

      <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Create Purchase Transaction</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input
          name="utorid"
          placeholder="Customer UTORid"
          value={form.utorid}
          onChange={handleChange}
          required
        />
        <input
          name="spent"
          type="number"
          placeholder="Amount Spent (e.g. 19.99)"
          value={form.spent}
          onChange={handleChange}
          required
        />
        <input
          name="promotionIds"
          placeholder="Promotion IDs (comma separated)"
          value={form.promotionIds}
          onChange={handleChange}
        />
        <input
          name="remark"
          placeholder="Optional Remark"
          value={form.remark}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#4A148C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </form>
    </div>
  )
}
