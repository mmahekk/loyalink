import { useState, useContext } from 'react'
import axios from '../../api/axiosInstance'
import { AuthContext } from '../../auth/AuthContext'

export default function AddOrganizer() {
  const { token } = useContext(AuthContext)
  const [eventId, setEventId] = useState('')
  const [utorid, setUtorid] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/events/${eventId}/organizers`, { utorid }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setMessage({ text: `Successfully added ${utorid} as organizer for event ${eventId}.`, type: 'success' })
      setEventId('')
      setUtorid('')
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error adding organizer.', type: 'error' })
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Add Organizer to Event</h2>

      {message.text && (
        <div style={{
          color: message.type === 'success' ? '#2e7d32' : '#c62828',
          backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
          padding: '0.75rem 1.25rem',
          borderRadius: '6px',
          border: `1px solid ${message.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`,
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Event ID" 
          value={eventId} 
          onChange={(e) => setEventId(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="UTORid of Organizer" 
          value={utorid} 
          onChange={(e) => setUtorid(e.target.value)} 
          required 
        />
        <button type="submit" style={{
          padding: '0.75rem',
          background: '#00695C',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          Add Organizer
        </button>
      </form>
    </div>
  )
}
