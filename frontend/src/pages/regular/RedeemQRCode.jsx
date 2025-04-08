import { useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import styles from '../AuthPage.module.css'

export default function RedeemQRCode() {
  const { transactionId } = useParams()

  return (
    <div className={styles.container}>
      <h1>Redemption Request</h1>
      <p>Show this QR code to a cashier to process your redemption.</p>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px' }}>
        <QRCodeCanvas
          value={transactionId}
          size={200}
          bgColor="#ffffff"
          fgColor="#1C2D5A"
          level="H"
        />
      </div>
      <p style={{ marginTop: '1rem' }}>
        <strong>Redemption ID:</strong> {transactionId}
      </p>
    </div>
  )
}
