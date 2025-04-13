import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function CashierRegisterUser() {
  const [form, setForm] = useState({
    utorid: '',
    name: '',
    email: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { utorid, name, email } = form

    if (!utorid || !name || !email) {
      toast.error('All fields are required')
      return
    }

    try {
      setSubmitting(true)
      const res = await axios.post('/users', form)
      toast.success(`User ${res.data.name} registered!`)
      setForm({ utorid: '', name: '', email: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
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

      <h2>Register New User</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input name="utorid" placeholder="UTORid (8 chars)" value={form.utorid} onChange={handleChange} required />
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="UofT Email" value={form.email} onChange={handleChange} required />
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
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
