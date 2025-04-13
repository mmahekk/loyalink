import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function CashierEventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/events') // Cashiers will only see published events due to backend role check
      setEvents(res.data.results)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Available Events</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        events.map(event => (
          <div
            key={event.id}
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              marginBottom: '1rem'
            }}
          >
            <h3>{event.name}</h3>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Starts:</strong> {new Date(event.startTime).toLocaleString()}</p>
            <p><strong>Ends:</strong> {new Date(event.endTime).toLocaleString()}</p>
            <p><strong>Capacity:</strong> {event.capacity ?? 'Unlimited'}</p>
            <p><strong>Guests:</strong> {event.numGuests}</p>
          </div>
        ))
      )}
    </div>
  )
}
