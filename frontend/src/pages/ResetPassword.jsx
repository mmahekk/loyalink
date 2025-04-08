import { useState } from 'react'
import axios from '../api/axiosInstance'
import { useNavigate, Link } from 'react-router-dom'
import styles from './AuthPage.module.css'
import { toast } from 'react-hot-toast'

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState('')
  const [utorid, setUtorid] = useState('')
  const [password, setPassword] = useState('')
//   const resetToken = localStorage.getItem('resetToken')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/auth/resets/${resetToken}`, { utorid, password })
      navigate('/success')
    } catch(err){
      toast.error(err.response?.data?.error || 'Reset failed — make sure your token is valid and not expired')
    }
  }

  return (
    <div className={styles.container}>
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
            <input
            value={resetToken}
            onChange={e => setResetToken(e.target.value)}
            placeholder="Reset Token"
            />
            <input
            value={utorid}
            onChange={e => setUtorid(e.target.value)}
            placeholder="UTORid"
            />
            <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="New Password"
            />
        <button type="submit">Reset Password</button>
      </form>
      <Link to="/forgot" className="link-button">
        Back
      </Link>
    </div>
  )
}
