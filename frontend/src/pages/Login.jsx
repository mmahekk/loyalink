import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function Login() {
  const [utorid, setUtorid] = useState('')
  const [password, setPassword] = useState('')
  const { login, logout, loaded , user, setActiveRole} = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if(loaded) logout()
  }, [loaded])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(utorid, password)
      //setActiveRole(null)
      // setTimeout(() => {
      //   if (user?.role === 'regular') {
      //     setActiveRole('regular')
      //     navigate('/user')
      //   } else {
      //     navigate('/select-role')
      //   }
      // }, 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login Failed')
    }
  }
  useEffect(() => {
    if (user) {
      if (user.role === 'regular') {
        setActiveRole('regular')
        navigate('/user')
      } else {
        setActiveRole(null)
        navigate('/select-role')
      }
    }
  }, [user])
  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          placeholder="UTORid"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <Link to="/forgot" className="link-button">
        Forgot Password?
      </Link>
    </div>
  )
}
