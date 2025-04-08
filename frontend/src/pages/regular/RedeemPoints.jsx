import { useState } from 'react'
import axios from '../../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function RedeemPoints() {
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/users/me/transactions', {
        type: 'redemption',
        amount: parseInt(amount),
        remark
      })
      const transactionId = res.data.id
      toast.success('Redemption request created')
      navigate(`/user/redeem/${transactionId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Redemption failed')
    }
  }

  return (
    <div className={styles.container}>
      <h1>Redeem Points</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          placeholder="Amount to redeem"
        />
        <input
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Optional remark"
        />
        <button type="submit">Submit Redemption</button>
      </form>
    </div>
  )
}
