import { useContext, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import styles from '../AuthPage.module.css'

export default function UserProfile() {
  const { user, token, setUser } = useContext(AuthContext)

  const isValidDate = (date) => {
    const parsed = new Date(date)
    return date && !isNaN(parsed.getTime())
  }
  
  const validBirthday = isValidDate(user?.birthday)
    ? new Date(user.birthday).toISOString().split('T')[0]
    : ''
  

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    birthday: validBirthday
  })

  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {}


    if (form.name !== user.name) payload.name = form.name
    if (form.email !== user.email) payload.email = form.email
    if ((form.birthday || '') !== (validBirthday || '')) {
        payload.birthday = form.birthday || null  // send null if field is empty
      }
      
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
        setEditingProfile(false)
      }
    } catch (err) {
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
      setEditingAvatar(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Avatar upload failed')
    }
  }

  const avatarUrl =
    user?.avatarUrl && user.avatarUrl.trim() !== ''
      ? `http://localhost:3000${user.avatarUrl}?v=${Date.now()}`
      : '/default-avatar.png'

  return (
    <div className={styles.container} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>My Profile</h1>

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
          className={styles.formButton}
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

      <h3 style={{ textAlign: 'center' }}>Profile Information</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editingProfile}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editingProfile}
          />
        </label>
        <label>
          Birthday
          <input
            name="birthday"
            type="date"
            value={form.birthday}
            onChange={handleChange}
            disabled={!editingProfile}
          />
        </label>

        {editingProfile ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className={styles.formButton}>
            Save Changes
            </button>
            <button
            type="button"
            onClick={() => {
                setForm({
                name: user?.name || '',
                email: user?.email || '',
                birthday: isValidDate(user?.birthday)
                    ? new Date(user.birthday).toISOString().split('T')[0]
                    : ''
                })
                setEditingProfile(false)
            }}
            className={styles.formButton}
            >
            Cancel
            </button>
        </div>
        ) : (
        <button
            type="button"
            onClick={() => setEditingProfile(true)}
            className={styles.formButton}
        >
            Edit Profile
        </button>
        )}

      </form>

      <h3 style={{ marginTop: '2rem' }}>Change Password</h3>
      <form onSubmit={submitPassword} className={styles.form}>
        <label>
          Current Password
          <input
            name="old"
            type="password"
            placeholder="Current password"
            value={passwordForm.old}
            onChange={handlePasswordChange}
          />
        </label>
        <label>
          New Password
          <input
            name="new"
            type="password"
            placeholder="New password"
            value={passwordForm.new}
            onChange={handlePasswordChange}
          />
        </label>
        <button type="submit">Update Password</button>
      </form>
    </div>
  )
}
