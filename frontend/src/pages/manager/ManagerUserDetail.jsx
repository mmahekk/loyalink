import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import { AuthContext } from '../../auth/AuthContext'

export default function ManagerUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, activeRole } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ email: '', verified: true, suspicious: false, role: '' })
  const [initial, setInitial] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const role = activeRole || user.role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users/${userId}`)

        const cachedSuspicious = localStorage.getItem(`suspicious_user_${userId}`)
        const resolvedSuspicious = typeof res.data.suspicious === 'boolean'
          ? res.data.suspicious
          : cachedSuspicious !== null
            ? cachedSuspicious === 'true'
            : false

        setUser(res.data)
        setForm({
          email: res.data.email || '',
          verified: res.data.verified ?? true,
          suspicious: resolvedSuspicious,
          role: res.data.role
        })
        setInitial({
          ...res.data,
          suspicious: resolvedSuspicious
        })
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load user')
      }
    }
    fetchUser()
  }, [userId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    const updates = {}
    if (form.email !== initial.email) updates.email = form.email
    if (form.verified !== initial.verified) updates.verified = form.verified
    if (form.role !== initial.role && !form.suspicious) {
      updates.role = form.role
      if (form.role === 'cashier') updates.suspicious = false
    } else if (form.role !== initial.role && form.suspicious) {
      toast.error('Cannot promote user while marked as suspicious')
      return
    } else if (form.suspicious !== initial.suspicious) {
      updates.suspicious = form.suspicious
    }

    if (Object.keys(updates).length === 0) {
      toast('No changes to update')
      return
    }

    try {
      const res = await axios.patch(`/users/${userId}`, updates)

      // Save suspicious to localStorage
      if (updates.suspicious !== undefined) {
        localStorage.setItem(`suspicious_user_${userId}`, updates.suspicious)
      }

      setUser(prev => ({ ...prev, ...res.data }))
      setInitial(prev => ({ ...prev, ...res.data }))
      setForm(f => ({ ...f, ...res.data }))

      toast.success('User updated')
      setSaved(true)
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    }
  }

  if (!user) return <p>Loading...</p>

  // const roleOptions = role === 'superuser'
  //   ? ['regular', 'cashier', 'manager', 'superuser']
  //   : ['regular', 'cashier']
  const roleOptions = (() => {
    const currentisSuperuser = role === 'superuser'
    const editableTarget = ['regular', 'cashier'].includes(user?.role)
    if(currentisSuperuser) return ['regular', 'cashier', 'manager', 'superuser']
    if(!editableTarget) return [user?.role]
    return ['regular', 'cashier']
  })()

  const renderField = (label, value, fieldKey, editableType = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {editing && fieldKey ? (
        editableType === 'select' ? (
          <select
            name={fieldKey}
            value={form[fieldKey]}
            onChange={handleChange}
            disabled = {!roleOptions.includes(form[fieldKey])}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            {roleOptions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        ) : editableType === 'checkbox' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name={fieldKey}
              checked={form[fieldKey]}
              onChange={handleChange}
            />
            {label}
          </label>
        ) : (
          <input
            type="text"
            name={fieldKey}
            value={form[fieldKey]}
            onChange={handleChange}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        )
      ) : (
        <div style={{ padding: '0.4rem 0.6rem', background: '#f7f7f7', borderRadius: '6px' }}>
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '—'}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/manager/users')}
        style={{
          marginBottom: '1rem',
          background: 'none',
          border: 'none',
          color: '#1C2D5A',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        ← Back to User List
      </button>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        User: {user.utorid}
      </h2>

      {saved && (
        <div style={{
          background: '#d4edda',
          padding: '0.5rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          color: '#155724',
          fontWeight: 500
        }}>
          ✔ Changes saved successfully
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr', marginBottom: '2rem' }}>
        {renderField('Name', user.name)}
        {renderField('Birthday', user.birthday)}
        {renderField('Created At', new Date(user.createdAt).toLocaleDateString())}
        {renderField('Last Login', user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never')}
        {renderField('Points', user.points)}
        {renderField('Email', form.email, 'email')}
        {renderField('Role', form.role, 'role', 'select')}
        {renderField('Verified', form.verified, 'verified', 'checkbox')}
        {renderField('Suspicious', form.suspicious, 'suspicious', 'checkbox')}
      </div>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          style={{ padding: '0.6rem 1.25rem', background: '#1C2D5A', color: 'white', border: 'none', borderRadius: '6px' }}
        >
          Edit
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, padding: '0.6rem', background: '#1C2D5A', color: 'white', border: 'none', borderRadius: '6px' }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setForm({
                email: initial.email,
                verified: initial.verified,
                suspicious: initial.suspicious,
                role: initial.role
              })
              setEditing(false)
              setSaved(false)
            }}
            style={{ flex: 1, padding: '0.6rem', background: '#1C2D5A', color: 'white', border: 'none', borderRadius: '6px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
