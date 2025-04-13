import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { AuthContext } from '../../auth/AuthContext'

export default function UpdatePromotion() {
  const { id } = useParams()
  const { token } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    async function fetchPromotion() {
      try {
        const res = await axios.get(`/promotions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        setFormData({
          ...res.data,
          type: res.data.type === 'oneTime' ? 'one-time' : 'automatic',
          startTime: res.data.startTime?.slice(0, 16) || '',
          endTime: res.data.endTime?.slice(0, 16) || '',
          minSpending: res.data.minSpending || '',
          rate: res.data.rate || '',
          points: res.data.points || ''
        })
      } catch (err) {
        setMessage({ text: 'Failed to load promotion data.', type: 'error' })
      }
    }

    fetchPromotion()
  }, [id, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

      const res = await axios.patch(`/promotions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ text: `Promotion updated successfully.`, type: 'success' })
      setTimeout(() => navigate('/manager/promotions'), 1500)
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Update failed.', type: 'error' })
    }
  }

  if (!formData) return <p style={{ textAlign: 'center' }}>Loading...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Update Promotion</h2>
      {message.text && (
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <input name="name" placeholder="Promotion Name" value={formData.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />

        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="automatic">Automatic</option>
          <option value="one-time">One-time</option>
        </select>

        <label>Start Time</label>
        <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
        <label>End Time</label>
        <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />

        <input name="minSpending" type="number" step="0.01" placeholder="Min Spending" value={formData.minSpending} onChange={handleChange} />
        <input name="rate" type="number" step="0.01" placeholder="Rate" value={formData.rate} onChange={handleChange} />
        <input name="points" type="number" placeholder="Points" value={formData.points} onChange={handleChange} />

        <button type="submit" style={{ background: '#00695C', color: 'white', padding: '0.75rem', borderRadius: '6px' }}>
          Update Promotion
        </button>
      </form>
    </div>
  )
}
