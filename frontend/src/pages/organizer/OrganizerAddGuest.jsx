import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function AddGuestToEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [utorid, setUtorid] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!utorid.trim()) {
      toast.error('Please enter a UTORid')
      return
    }

    try {
      setSubmitting(true)
      await axios.post(`/events/${eventId}/guests`, { utorid: utorid.trim() })
      toast.success('Guest added successfully!')
      setUtorid('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add guest')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>

      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Add Guest to Event</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          placeholder="Guest UTORid"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#333333',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Adding...' : 'Add Guest'}
        </button>
      </form>
    </div>
  )
}
