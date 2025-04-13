import { useNavigate } from 'react-router-dom'

export default function PromotionHub() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem' }}>
        Promotion Management Hub
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/manager/promotions/create')}
          style={buttonStyle}
        >
          Create New Promotion
        </button>

        <button
          onClick={() => navigate('/manager/promotions/view')}
          style={buttonStyle}
        >
          View All Promotions
        </button>

        {/* You can add more buttons here as you implement features */}
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
  minWidth: '220px'
}
