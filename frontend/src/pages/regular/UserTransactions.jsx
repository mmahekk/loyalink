import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function UserTransactions() {
  const [transactions, setTransactions] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [relatedMap, setRelatedMap] = useState({})
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    relatedId: searchParams.get('relatedId') || '',
    relatedUtorid: searchParams.get('relatedUtorid') || '',
    promotionId: searchParams.get('promotionId') || '',
    amount: searchParams.get('amount') || '',
    operator: searchParams.get('operator') || ''
  })

  const [orderBy, setOrderBy] = useState(searchParams.get('orderBy') || 'newest')

  const fetchTransactions = async (pageNum = 1, overrideParams = null) => {
    try {
      const params = overrideParams || Object.fromEntries(searchParams)
      params.page = pageNum
      params.limit = 5

      const res = await axios.get('/users/me/transactions', { params })
      setTransactions(res.data.results)
      setCount(res.data.count)
      setTotalPages(Math.ceil(res.data.count / 5))
      setPage(pageNum)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load transactions')
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [orderBy])

  useEffect(() => {
    const query = Object.fromEntries([...searchParams])
    setFilters(prev => ({ ...prev, ...query }))
    fetchTransactions(parseInt(query.page || '1', 10))
  }, [])

  useEffect(() => {
    const missing = transactions.filter(tx => tx.relatedId && !relatedMap[tx.relatedId])
    missing.forEach(async (tx) => {
      try {
        const res = await axios.get(`/users/id/${tx.relatedId}`)
        setRelatedMap(prev => ({ ...prev, [tx.relatedId]: res.data.utorid }))
      } catch {
        setRelatedMap(prev => ({ ...prev, [tx.relatedId]: 'Unknown' }))
      }
    })
  }, [transactions])

  const handleFilterSubmit = async (e) => {
    e.preventDefault()
    const params = { ...filters, page: 1, orderBy }
  
    // Resolve relatedUtorid to relatedId only if type is specified
    if (filters.relatedUtorid && filters.type) {
      try {
        const res = await axios.get(`/users/utorid/${filters.relatedUtorid}`)
        params.relatedId = res.data.id
      } catch {
        toast.error('Related UTORid not found')
        return
      }
    }
  
    // relatedId only valid with type
    if (!filters.type) {
      delete params.relatedId
    }
  
    delete params.relatedUtorid
  
    Object.keys(params).forEach(k => {
      if (params[k] === '') delete params[k]
    })
  
    setSearchParams(params)
    fetchTransactions(1, params)
  }

  const handleClearFilters = () => {
    const cleared = {
      type: '',
      relatedId: '',
      relatedUtorid: '',
      promotionId: '',
      amount: '',
      operator: ''
    }
    setFilters(cleared)
    setSearchParams({})
    fetchTransactions(1, { page: 1, limit: 5 })
  }

  const typeColor = {
    transfer: '#e0f7ff',
    redemption: '#fff0f0',
    purchase: '#f9f9f9',
    adjustment: '#fefae0',
    event: '#f0fff4'
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>My Transactions</h1>
      <p style={{ marginBottom: '1rem', textAlign: 'center', color: '#555' }}>
        {count} total transaction{count !== 1 ? 's' : ''}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
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
        <form onSubmit={handleFilterSubmit} style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.75rem',
          marginBottom: '2rem',
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}>
          <select value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="redemption">Redemption</option>
            <option value="purchase">Purchase</option>
            <option value="adjustment">Adjustment</option>
            <option value="event">Event</option>
          </select>

          <input placeholder="Related UTORid" value={filters.relatedUtorid}
            onChange={(e) => setFilters(f => ({ ...f, relatedUtorid: e.target.value }))} />

          <input placeholder="Related Transaction ID" value={filters.relatedId}
            onChange={(e) => setFilters(f => ({ ...f, relatedId: e.target.value }))} />

          <input placeholder="Promotion ID" value={filters.promotionId}
            onChange={(e) => setFilters(f => ({ ...f, promotionId: e.target.value }))} />

          <select value={filters.operator} onChange={(e) => setFilters(f => ({ ...f, operator: e.target.value }))}>
            <option value="">Amount Operator</option>
            <option value="gte">≥</option>
            <option value="lte">≤</option>
          </select>

          <input type="number" placeholder="Amount"
            value={filters.amount}
            onChange={(e) => setFilters(f => ({ ...f, amount: e.target.value }))}
            disabled={!filters.operator}
          />

          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1 }}>Apply</button>
            <button type="button" onClick={handleClearFilters} style={{ flex: 1 }}>Clear</button>
          </div>
        </form>
      )}

      {transactions.map(tx => (
        <div key={tx.id} style={{
          background: typeColor[tx.type] || '#f4f4f4',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{tx.type.toUpperCase()}</strong>
            <span>{tx.amount} pts</span>
          </div>
          {tx.relatedId && (
            <p>
              <strong>{tx.type === 'transfer' ? (tx.amount < 0 ? 'To' : 'From') : 'Related'}:</strong>{' '}
              {relatedMap[tx.relatedId] || `ID ${tx.relatedId}`}
            </p>
          )}
          {tx.promotionId && <p>Promo ID: {tx.promotionId}</p>}
          {tx.remark && <p>Note: {tx.remark}</p>}
          {tx.type === 'redemption' && (
            <div style={{
              marginTop: '0.5rem',
              display: 'inline-block',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: tx.processed ? '#155724' : '#856404',
              backgroundColor: tx.processed ? '#d4edda' : '#fff3cd',
              border: `1px solid ${tx.processed ? '#c3e6cb' : '#ffeeba'}`
            }}>
              {tx.processed ? 'Processed' : 'Pending'}
            </div>
          )}
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>By: {tx.createdBy}</p>
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ID: {tx.id}</div>
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={() => fetchTransactions(page - 1)} disabled={page === 1}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => fetchTransactions(page + 1)} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  )
}
