import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'

export default function Success() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.container}>
      <h1>You have successfully reset your password</h1>
      <p>You will be redirected to Login shortly...</p>
    </div>
  )
}
