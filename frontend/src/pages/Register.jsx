import { useState } from 'react'
import axios from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'
import { toast } from 'react-hot-toast'

export default function Register() {
  const [utorid, setUtorid] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/users', { utorid, name, email })
      navigate('/success')
    } catch(err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    
    }
  }

  return (
    <div className={styles.container}>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
            <input value={utorid} onChange={e => setUtorid(e.target.value)} placeholder="UTORid" />
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="UofT Email" />
            <button type="submit">Register</button>
        </form>
    </div>
    
  )
}
