import { useNavigate } from 'react-router-dom'

export default function ManagerEvents() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem' }}>
        Event Management Hub
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => navigate('/manager/events/create')} 
          style={buttonStyle}
        >
          Create New Event
        </button>

        <button 
          onClick={() => navigate('/manager/events/view')} 
          style={buttonStyle}
        >
          View All Events
        </button>

        <button 
          onClick={() => navigate('/manager/events/delete')} 
          style={buttonStyle}
        >
          Delete Event by ID
        </button>

        <button 
          onClick={() => navigate('/manager/events/update')} 
          style={buttonStyle}
        >
          Update Event
        </button>

        <button 
        onClick={() => navigate('/manager/events/organizers')} 
        style={buttonStyle}
      >
        Add Organizer to Event
      </button>

      <button 
        onClick={() => navigate('/manager/events/add-guest')} 
        style={buttonStyle}
      >
        Add Guest to Event
      </button>

      <button 
        onClick={() => navigate('/manager/events/remove-guest')} 
        style={buttonStyle}
      >
        Remove Guest from Event
      </button>

      <button 
        onClick={() => navigate('/manager/events/reward')} 
        style={buttonStyle}
      >
        Reward Guests
      </button>




      </div>
    </div>
  )
}

const buttonStyle = {
  background: '#00695C',
  color: 'white',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  border: 'none',
  transition: '0.3s',
  minWidth: '200px'
}
