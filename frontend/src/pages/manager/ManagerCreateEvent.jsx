import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'

export default function ManagerEvents() {
  const { token } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: '',
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
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        points: parseInt(formData.points, 10)
      }

      const res = await axios.post('/events', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ text: `Event "${res.data.name}" created successfully.`, type: 'success' })
      setFormData({
        name: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        capacity: '',
        points: ''
      })
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error creating event', type: 'error' })
    }
  }

  return (
    <div style={{ paddingTop: '1rem', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>

      <h2 style={{ fontSize: '1.8rem', textAlign: 'center' }}>
        Create New Event
      </h2>
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


    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <input name="name" placeholder="Event Name" value={formData.name} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />

      <label htmlFor="startTime" style={{ fontWeight: '500' }}>Start Time</label>
      <input id="startTime" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />

      <label htmlFor="endTime" style={{ fontWeight: '500' }}>End Time</label>
      <input id="endTime" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />

      <input name="capacity" type="number" placeholder="Capacity (optional)" value={formData.capacity} onChange={handleChange} />
      <input name="points" type="number" placeholder="Points" value={formData.points} onChange={handleChange} required />

      <button type="submit" style={{ padding: '0.75rem', background: '#00695C', color: 'white', border: 'none', borderRadius: '5px' }}>
        Create Event
      </button>
    </form>

    </div>
  )
}
