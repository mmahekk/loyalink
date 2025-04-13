
import { useState, useContext } from 'react'
import axios from '../../api/axiosInstance'
import { AuthContext } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CreatePromotion() {
  const { token } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'automatic',
    startTime: '',
    endTime: '',
    minSpending: '',
    rate: '',
    points: ''
  })

  const [message, setMessage] = useState({ text: '', type: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        minSpending: formData.minSpending ? parseFloat(formData.minSpending) : undefined,
        rate: formData.rate ? parseFloat(formData.rate) : undefined,
        points: formData.points ? parseInt(formData.points) : undefined
      }

      const res = await axios.post('/promotions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ text: `Promotion "${res.data.name}" created successfully.`, type: 'success' })
      setFormData({
        name: '',
        description: '',
        type: 'automatic',
        startTime: '',
        endTime: '',
        minSpending: '',
        rate: '',
        points: ''
      })
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error creating promotion', type: 'error' })
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Create New Promotion</h2>
      {message.text && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <p
            style={{
              color: message.type === 'success' ? '#2e7d32' : '#c62828',
              backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
              textAlign: 'center',
              maxWidth: 'fit-content'
            }}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto', display: 'grid', gap: '1rem' }}>
        <input name="name" placeholder="Promotion Name" value={formData.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />

        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="automatic">Automatic</option>
          <option value="one-time">One-time</option>
        </select>

        <label>Start Time</label>
        <input name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />

        <label>End Time</label>
        <input name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />

        <input name="minSpending" type="number" step="0.01" placeholder="Min Spending (optional)" value={formData.minSpending} onChange={handleChange} />
        <input name="rate" type="number" step="0.01" placeholder="Rate (optional)" value={formData.rate} onChange={handleChange} />
        <input name="points" type="number" placeholder="Points (optional)" value={formData.points} onChange={handleChange} />

        <button type="submit" style={{ background: '#00695C', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none' }}>
          Create Promotion
        </button>
      </form>
    </div>
  )
}
