import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

export default function OrganizerEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    startTime: '',
    endTime: '',
    capacity: '',
    pointsAwarded: '',
    published: false
  });

  useEffect(() => {
    axios.get(`/events/${eventId}`)
      .then(res => {
        const e = res.data;
        setForm({
          name: e.name || '',
          location: e.location || '',
          description: e.description || '',
          startTime: e.startTime.slice(0, 16),
          endTime: e.endTime.slice(0, 16),
          capacity: e.capacity || '',
          pointsAwarded: e.pointsAwarded || '',
          published: e.published
        });
      })
      .catch(() => toast.error('Failed to load event'));
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/events/${eventId}`, {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        pointsAwarded: form.pointsAwarded ? parseInt(form.pointsAwarded) : null
      });
      toast.success('Event updated!');
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Edit Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Event Name" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
        <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required />
        <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity" />
        <input name="pointsAwarded" type="number" value={form.pointsAwarded} onChange={handleChange} placeholder="Points to Award" />
        <label>
          <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
          Published
        </label>
        <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#333333', color: 'white', border: 'none', borderRadius: '6px' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
