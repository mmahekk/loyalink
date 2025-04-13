import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function DeleteEventById() {
  const [eventId, setEventId] = useState('')

  const handleDelete = async () => {
    if (!eventId.trim()) return toast.error('Please enter a valid Event ID')
    if (!window.confirm(`Are you sure you want to delete event ID ${eventId}?`)) return

    try {
      await axios.delete(`/events/${eventId}`)
      toast.success(`Event ${eventId} deleted successfully`)
      setEventId('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete event')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Delete Event by ID</h2>
      <input
        type="text"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        placeholder="Enter Event ID"
        style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <button
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#c62828',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Delete Event
      </button>
    </div>
  )
}
