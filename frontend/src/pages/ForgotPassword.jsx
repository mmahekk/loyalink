import { useState } from 'react'
import axios from '../api/axiosInstance'
import { useNavigate, Link} from 'react-router-dom'
import styles from './AuthPage.module.css'
import { toast } from 'react-hot-toast'

export default function ForgotPassword() {
  const [utorid, setUtorid] = useState('')
  const [resetToken, setResetToken] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/auth/resets', { utorid })
      setResetToken(res.data.resetToken)
      setExpiresAt(new Date(res.data.expiresAt))
      //navigate('/success')
    } catch(err) {
      toast.error(err.response?.data?.error || 'Failed to request reset')
    }
  }

  const goToReset = () => {
    navigate('/reset')
  }

  return (
    <div className={styles.container}>
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
            <input
            value={utorid}
            onChange={e => setUtorid(e.target.value)}
            placeholder="UTORid"
            />
            <button type="submit">Request Reset Token</button>
        </form>

        {resetToken && (
            <div>
            <p>Copy this reset token and paste it in the Reset Password form:</p>
            <pre style={{ background: '#eee', padding: '1rem', borderRadius: '8px' }}>{resetToken}</pre>
            <p>Note: This token will expire at {expiresAt.toLocaleString()}.</p>
            <button onClick={goToReset}>Go to Reset Password</button>
            </div>
        )}
        <Link to="/login" className="link-button">
          Back
        </Link>
    </div>
  )
}
