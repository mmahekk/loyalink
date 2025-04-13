import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'

export default function OrganizerDashboard() {
  const { token } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/organizer/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setEvents(res.data))
    .catch(err => console.error('Failed to fetch organizer events', err))
  }, [token])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Organizer Dashboard</h2>

      {events.length === 0 ? (
        <p>You are not responsible for any events.</p>
      ) : (
        events.map(event => (
          <div
            key={event.id}
            style={{
              background: '#f8f9ff',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginBottom: '1rem'
            }}
          >
            <h3>{event.name}</h3>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Time:</strong> {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleString()}</p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => navigate(`/organizer/events/${event.id}`)}>Edit Event</button>
              <button onClick={() => navigate(`/organizer/events/${event.id}/guests`)}>Add Guests</button>
              <button onClick={() => navigate(`/organizer/events/${event.id}/reward`)}>Award Points</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
