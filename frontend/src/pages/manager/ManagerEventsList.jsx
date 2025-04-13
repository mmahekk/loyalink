import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function ManagerEventList() {
  const [events, setEvents] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  const fetchEvents = async (pageNum = 1) => {
    try {
      const res = await axios.get('/events', {
        params: {
          page: pageNum,
          limit: 10,
          published: true // or false/undefined depending on your needs
        }
      })

      setEvents(res.data.results)
      setCount(res.data.count)
      setPage(pageNum)
      setTotalPages(Math.ceil(res.data.count / 10))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load events')
    }
  }

  useEffect(() => {
    fetchEvents(1)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      await axios.delete(`/events/${id}`)
      toast.success('Event deleted')
      fetchEvents(page) // Refresh current page
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete event')
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>All Events</h1>
      <p style={{ marginBottom: '1rem' }}>{count} total event{count !== 1 ? 's' : ''}</p>

      {events.map(event => (
        <div key={event.id} style={{
          background: '#f9f9f9',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{event.name}</strong>
            <span>{event.numGuests} Guest{event.numGuests !== 1 ? 's' : ''}</span>
          </div>
          <p>Location: {event.location}</p>
          <p>Start: {new Date(event.startTime).toLocaleString()}</p>
          <p>End: {new Date(event.endTime).toLocaleString()}</p>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              onClick={() => handleDelete(event.id)}
              style={{
                background: '#c62828',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => fetchEvents(page - 1)} disabled={page === 1}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => fetchEvents(page + 1)} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  )
}
