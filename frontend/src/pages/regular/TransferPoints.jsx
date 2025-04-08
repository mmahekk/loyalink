import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function TransferPoints() {
  const [recipientId, setRecipientId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/users/${recipientId}/transactions`, {
        type: 'transfer',
        amount: parseInt(amount),
        remark
      })
      toast.success('Points transferred successfully')
      navigate('/user')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transfer failed')
    }
  }

  return (
    <div className={styles.container}>
      <h1>Transfer Points</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Recipient UTORid"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to transfer"
          type="number"
        />
        <input
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Optional remark"
        />
        <button type="submit">Send Points</button>
      </form>
    </div>
  )
}
