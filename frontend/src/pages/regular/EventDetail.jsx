import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'
import { AuthContext } from '../../auth/AuthContext'

export default function EventDetail() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const { user } = useContext(AuthContext)

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/events/${eventId}`)
      setEvent(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Event not found')
    }
  }

  const handleRSVP = async () => {
    try {
      await axios.post(`/events/${eventId}/guests/me`)
      toast.success('RSVP successful')
      fetchEvent()
    } catch (err) {
      toast.error(err.response?.data?.error || 'RSVP failed')
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [])

  if (!event) return null

  const alreadyRSVPed = event.guests?.some(guest => guest.utorid === user?.utorid)

  return (
    <div className={styles.container}>
      <h1>{event.name}</h1>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Time:</strong> {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleString()}</p>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Capacity:</strong> {event.capacity || 'Unlimited'}</p>
      <p><strong>Guests:</strong> {event.numGuests}</p>

      {alreadyRSVPed ? (
        <p style={{ color: 'green', marginTop: '1rem' }}>You’ve already RSVPed to this event.</p>
      ) : (
        <button onClick={handleRSVP}>RSVP to this event</button>
      )}
    </div>
  )
}
