import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { AuthContext } from '../../auth/AuthContext'
import { useContext } from 'react'

export default function ManagerUpdateEvent() {
  const { token } = useContext(AuthContext)

  const [eventId, setEventId] = useState('')
  const [updateData, setUpdateData] = useState({})
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUpdateData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventId) {
      setMessage({ text: 'Event ID is required.', type: 'error' })
      return
    }

    try {
      const payload = { ...updateData }

      if (payload.capacity) {
        payload.capacity = payload.capacity === 'null' ? null : parseInt(payload.capacity)
      }

      if (payload.points) {
        payload.points = parseInt(payload.points)
      }

      if (payload.published === 'true') payload.published = true

      const res = await axios.patch(`/events/${eventId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ text: `Event ${res.data.name} updated successfully.`, type: 'success' })
      setUpdateData({})
      setEventId('')
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update event.', type: 'error' })
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Update Event</h2>

      {message.text && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.25rem',
              borderRadius: '6px',
              backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: message.type === 'success' ? '#2e7d32' : '#c62828',
              border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
              textAlign: 'center'
            }}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <input
          name="eventId"
          placeholder="Event ID (required)"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          required
        />

        <input name="name" placeholder="New Name" value={updateData.name || ''} onChange={handleChange} />
        <input name="location" placeholder="New Location" value={updateData.location || ''} onChange={handleChange} />
        <textarea name="description" placeholder="New Description" value={updateData.description || ''} onChange={handleChange} />
        <input name="startTime" type="datetime-local" value={updateData.startTime || ''} onChange={handleChange} />
        <input name="endTime" type="datetime-local" value={updateData.endTime || ''} onChange={handleChange} />
        <input name="capacity" type="text" placeholder="Capacity (number or 'null')" value={updateData.capacity || ''} onChange={handleChange} />
        <input name="points" type="number" placeholder="New Points" value={updateData.points || ''} onChange={handleChange} />
        <select name="published" value={updateData.published || ''} onChange={handleChange}>
          <option value="">Set Published</option>
          <option value="true">Yes</option>
        </select>

        <button type="submit" style={{ background: '#00695C', color: 'white', padding: '0.75rem', borderRadius: '5px', border: 'none' }}>
          Update Event
        </button>
      </form>
    </div>
  )
}
