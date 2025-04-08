import { useContext, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function UserProfile() {
  const { user, token, setUser } = useContext(AuthContext)
  const validBirthday = user?.birthday && !isNaN(new Date(user.birthday).getTime())
  ? new Date(user.birthday).toISOString().split('T')[0]
  : ''

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    birthday: validBirthday
  })

  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' })
  const [avatar, setAvatar] = useState(null)
  const [editingAvatar, setEditingAvatar] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {}

    const formattedUserBirthday = user?.birthday
      ? new Date(user.birthday).toISOString().split('T')[0]
      : ''

    if (form.name !== user.name) payload.name = form.name
    if (form.email !== user.email) payload.email = form.email
    if (form.birthday !== formattedUserBirthday) payload.birthday = form.birthday

    if (Object.keys(payload).length === 0) {
      toast('No changes to update')
      return
    }

    try {
      const res = await axios.patch('/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 200) {
        toast.success('Profile updated!')
        setUser(prev => ({ ...prev, ...res.data }))
      }
    } catch (err) {
      console.error('PATCH failed:', err)
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    try {
      await axios.patch('/users/me/password', passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Password updated!')
      setPasswordForm({ old: '', new: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password update failed')
    }
  }

  const avatarUrl = user?.avatarUrl && user.avatarUrl.trim() !== ''
  ? `http://localhost:3000${user.avatarUrl}?v=${Date.now()}`
  : '/default-avatar.png'

  const submitAvatar = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('avatar', avatar)
    try {
      const res = await axios.patch('/users/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Avatar updated!')
      setUser(prev => ({ ...prev, ...res.data }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Avatar upload failed')
    }
  }

 
  return (
    <div className={styles.container}>
      <h1>My Profile</h1>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <img
          src={avatarUrl}
          alt="avatar"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #ccc'
          }}
        />
        <h2>{user.name}</h2>
        <button
          onClick={() => setEditingAvatar(prev => !prev)}
          style={{
            marginTop: '0.5rem',
            padding: '0.4rem 1rem',
            backgroundColor: '#1C2D5A',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {editingAvatar ? 'Cancel' : 'Edit Avatar'}
        </button>
      </div>

      {editingAvatar && (
        <form onSubmit={submitAvatar} className={styles.form}>
          <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
          <button type="submit">Upload Avatar</button>
        </form>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Birthday
          <input name="birthday" type="date" value={form.birthday} onChange={handleChange} />
        </label>
        <button type="submit">Update</button>
      </form>

      <h3>Change Password</h3>
      <form onSubmit={submitPassword} className={styles.form}>
        <input
          name="old"
          type="password"
          placeholder="Current password"
          value={passwordForm.old}
          onChange={handlePasswordChange}
        />
        <input
          name="new"
          type="password"
          placeholder="New password"
          value={passwordForm.new}
          onChange={handlePasswordChange}
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  )
}
