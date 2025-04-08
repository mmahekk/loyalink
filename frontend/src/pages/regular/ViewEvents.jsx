import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'
import { Link } from 'react-router-dom'

export default function ViewEvents() {
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)

  const fetchEvents = async (pageNum) => {
    try {
      const res = await axios.get('/events', {
        params: {
          page: pageNum,
          limit: 5,
          ended: false // only show upcoming or ongoing events
        }
      })
      setEvents(res.data.results)
      setCount(res.data.count)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load events')
    }
  }

  const handleRSVP = async (id) => {
    try {
      await axios.post(`/events/${id}/guests/me`)
      toast.success('RSVP successful')
      fetchEvents(page)
    } catch (err) {
      toast.error(err.response?.data?.error || 'RSVP failed')
    }
  }

  useEffect(() => {
    fetchEvents(page)
  }, [page])

  return (
    <div className={styles.container}>
      <h1>Upcoming Events</h1>
      {events.length === 0 ? (
        <p>No events right now.</p>
        ) : (
      events.map(event => (
        <div key={event.id} style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          background: '#f8f9ff'
        }}>
          <Link to={`/user/events/${event.id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
            {event.name}
          </Link>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Time:</strong> {new Date(event.startTime).toLocaleString()}</p>
          <p><strong>Guests:</strong> {event.numGuests}/{event.capacity || '∞'}</p>
          <button onClick={() => handleRSVP(event.id)}>RSVP</button>
        </div>
      ))
      )}

      {count > 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <button disabled={page * 5 >= count} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
