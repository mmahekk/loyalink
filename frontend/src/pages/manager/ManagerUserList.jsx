import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ManagerUserList() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    utorid: '',
    role: '',
    verified: '',
    activated: ''
  })
  const [orderBy, setOrderBy] = useState('points_desc')
  const navigate = useNavigate()

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = {
        page: pageNum,
        limit: 10,
        ...filters,
        orderBy
      }
      Object.keys(params).forEach(k => params[k] === '' && delete params[k])
      const res = await axios.get('/users', { params })
      setUsers(res.data.results)
      setTotalPages(Math.ceil(res.data.count / 10))
      setPage(pageNum)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers(1) }, [orderBy])

  const handleVerify = async (userId) => {
    try {
      await axios.patch(`/users/${userId}`, { verified: true })
      toast.success('User verified')
      fetchUsers(page)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchUsers(1)
  }

  const clearFilters = () => {
    setFilters({ utorid: '', role: '', verified: '', activated: '' })
    setTimeout(() => fetchUsers(1), 0)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>All Users</h1>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowFilters(prev => !prev)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1C2D5A',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#f9f9f9'
        }}>
          <input placeholder="Search by UTORid" value={filters.utorid} onChange={(e) => setFilters(f => ({ ...f, utorid: e.target.value }))} />
          <select value={filters.role} onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}>
            <option value="">All Roles</option>
            <option value="regular">Regular</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="superuser">Superuser</option>
          </select>
          <select value={filters.verified} onChange={(e) => setFilters(f => ({ ...f, verified: e.target.value }))}>
            <option value="">All Verified</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <select value={filters.activated} onChange={(e) => setFilters(f => ({ ...f, activated: e.target.value }))}>
            <option value="">All Activation</option>
            <option value="true">Activated</option>
            <option value="false">Not Activated</option>
          </select>
          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="points_desc">Points: High → Low</option>
            <option value="points_asc">Points: Low → High</option>
          </select>
          <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2' }}>
            <button type="submit" style={{ flex: 1 }}>Apply</button>
            <button type="button" onClick={clearFilters} style={{ flex: 1 }}>Clear</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        users.map(user => (
          <div
            key={user.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'white',
              transition: 'background 0.2s ease-in-out'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <strong>{user.name}</strong> — <span>{user.utorid}</span>
                <p>Role: {user.role}</p>
                <p>Points: {user.points}</p>
                <p>Verified: {user.verified ? 'Yes' : 'No'}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/manager/users/${user.id}`)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: '#1C2D5A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View
                </button>
                {!user.verified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVerify(user.id)
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#1C2D5A'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.color = '#1C2D5A'
                    }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #1C2D5A',
                      background: 'white',
                      color: '#1C2D5A',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => fetchUsers(page - 1)} disabled={page === 1}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => fetchUsers(page + 1)} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  )
}
