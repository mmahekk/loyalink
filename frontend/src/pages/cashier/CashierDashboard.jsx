import { useContext } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import { getClearance } from '../../utils/roles'

export default function CashierDashboard() {
  // accessing the current user from AuthContext
  const { user } = useContext(AuthContext) 
  // hook to navigate to different routes
  const navigate = useNavigate()
  // checking the user's clearance level
  const clearance = getClearance(user.role)

  // redirect if not logged in or not a cashier
  if (!user || clearance < 1) return <Navigate to="/select-role" />

  // otherwise render the dashboard
  return (
    <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>  
     
     {/* Displaying a welcome message for the cashier */}

      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Welcome, {user?.name || 'Cashier'}!
      </h1>

      {/*Buttons for creating a transaction and processing a redemption*/}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem'
      }}>
        <button onClick={() => navigate('/cashier/transactions')}>
          Create Transaction
        </button>
        <button onClick={() => navigate('/cashier/process-redemption')}>
          Process Redemption
        </button>
      </div>
    </div>
  )
}
