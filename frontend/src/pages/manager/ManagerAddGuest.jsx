import { useState, useContext } from 'react'
import axios from '../../api/axiosInstance'
import { AuthContext } from '../../auth/AuthContext'

export default function AddGuestToEvent() {
  const { token } = useContext(AuthContext)
  const [eventId, setEventId] = useState('')
  const [utorid, setUtorid] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/events/${eventId}/guests`, { utorid }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage({ type: 'success', text: `Successfully added ${utorid} as guest to event ${eventId}` })
      setEventId('')
      setUtorid('')
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error adding guest' })
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Add Guest to Event</h2>
      {message && (
        <p style={{
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
          padding: '0.75rem 1.25rem',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input
          type="number"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="UTORid of Guest"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          required
        />
        <button
          type="submit"
          style={{
            background: '#00695C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem'
          }}
        >
          Add Guest
        </button>
      </form>
    </div>
  )
}
