import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { QRCodeCanvas } from 'qrcode.react'
import styles from '../AuthPage.module.css'

export default function UserQRCode() {
  const { user } = useContext(AuthContext)

  if (!user) return null

  return (
    <div className={styles.container}>
      <h1>Your QR Code</h1>
      <p>Show this QR code to identify yourself for transactions.</p>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px' }}>
        <QRCodeCanvas
          value={user.utorid}
          size={200}
          bgColor="#ffffff"
          fgColor="#1C2D5A"
          level="H"
        />
      </div>
      <p style={{ marginTop: '1rem' }}><strong>UTORid:</strong> {user.utorid}</p>
    </div>
  )
}
