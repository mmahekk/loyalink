import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'

export default function ManagerRemoveGuest() {
  const { token } = useContext(AuthContext)
  const [eventId, setEventId] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: '', type: '' })

    try {
      await axios.delete(`/events/${eventId}/guests/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage({ text: `User ${userId} removed from event ${eventId}.`, type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to remove guest.', type: 'error' })
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '1rem' }}>
        Remove Guest from Event
      </h2>

      {message.text && (
        <p
          style={{
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
            maxWidth: 'fit-content',
            margin: '1rem auto',
            textAlign: 'center'
          }}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        <input
          type="number"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="User ID to Remove"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button
          type="submit"
          style={{
            background: '#b71c1c',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '5px',
            border: 'none'
          }}
        >
          Remove Guest
        </button>
      </form>
    </div>
  )
}
