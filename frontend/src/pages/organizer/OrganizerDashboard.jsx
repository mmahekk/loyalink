import { useContext, useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { AuthContext } from '../../auth/AuthContext';

export default function OrganizerDashboard() {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/organizer/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setEvents(res.data))
    .catch(err => console.error('Failed to fetch organizer events', err));
  }, [token]);

  return (
    <div>
      <h2>Your Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.name}</strong><br />
            {event.location}<br />
            {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
