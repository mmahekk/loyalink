import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

export default function AwardPoints() {
  const { eventId } = useParams();
  const [guests, setGuests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState('');

  const fetchGuests = async () => {
    try {
      const res = await axios.get(`/events/${eventId}`);
      setGuests(res.data.guests || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load guests');
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const awardToOne = async (guestId) => {
    if (!points) {
      toast.error('Enter points to award');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/events/${eventId}/guests/${guestId}/award`, {
        points: parseInt(points)
      });
      toast.success('Points awarded!');
      fetchGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to award points');
    } finally {
      setSubmitting(false);
    }
  };

  const awardToAll = async () => {
    if (!points) {
      toast.error('Enter points to award');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/events/${eventId}/guests/award-all`, {
        points: parseInt(points)
      });
      toast.success('Points awarded to all guests!');
      fetchGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to award all guests');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Award Points to Guests</h2>

      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        placeholder="Points"
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />

      {guests.length === 0 ? (
        <p>No guests have RSVPed yet.</p>
      ) : (
        guests.map(guest => (
          <div
            key={guest.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.8rem',
              marginBottom: '0.8rem',
              background: '#f1f1f1',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}
          >
            <span>{guest.name} ({guest.utorid})</span>
            <button
              onClick={() => awardToOne(guest.id)}
              disabled={submitting}
              style={{
                padding: '0.4rem 1rem',
                background: '#333333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Awarding...' : 'Award'}
            </button>
          </div>
        ))
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={awardToAll}
          disabled={submitting}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#333333',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '60%',
            maxWidth: '300px',
            textAlign: 'center'
          }}
        >
          {submitting ? 'Awarding to All...' : 'Award to All Guests'}
        </button>
      </div>
    </div>
  );
}
