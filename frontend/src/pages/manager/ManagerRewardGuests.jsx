import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { toast } from 'react-hot-toast'

export default function RewardGuests() {
  const { token } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    eventId: '',
    utorid: '',
    amount: '',
    remark: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        type: 'event',
        amount: parseInt(formData.amount),
        remark: formData.remark
      }

      if (formData.utorid) payload.utorid = formData.utorid

      const res = await axios.post(`/events/${formData.eventId}/transactions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Points awarded successfully!')
      console.log('Response:', res.data)

      setFormData({ eventId: '', utorid: '', amount: '', remark: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error awarding points')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Reward Guests</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <input
          name="eventId"
          placeholder="Event ID"
          value={formData.eventId}
          onChange={handleChange}
          required
        />
        <input
          name="utorid"
          placeholder="Guest UTORid (optional)"
          value={formData.utorid}
          onChange={handleChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          name="remark"
          placeholder="Remark"
          value={formData.remark}
          onChange={handleChange}
        />
        <button type="submit" style={{ padding: '0.75rem', background: '#00695C', color: 'white', border: 'none', borderRadius: '5px' }}>
          Award Points
        </button>
      </form>
    </div>
  )
}
