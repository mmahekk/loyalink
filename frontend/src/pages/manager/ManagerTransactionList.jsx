import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'

export default function ManagerTransactionList() {
  const [transactions, setTransactions] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    promotionId: '',
    amount: '',
    operator: '',
    suspicious: '',
    relatedUtorid: '',
    relatedId: ''
  })

  const [orderBy, setOrderBy] = useState('newest')
  const navigate = useNavigate()

  const fetchTransactions = async (pageNum = 1, overrideParams = null) => {
    setLoading(true)
    try {
      const params = overrideParams || {
        page: pageNum,
        limit: 10,
        ...filters
      }

      Object.keys(params).forEach(k => {
        if (params[k] === '') delete params[k]
      })

      const res = await axios.get('/transactions', { params })

      let results = res.data.results
      if (orderBy === 'amount_desc') results.sort((a, b) => b.amount - a.amount)
      else if (orderBy === 'amount_asc') results.sort((a, b) => a.amount - b.amount)
      else if (orderBy === 'newest') results.sort((a, b) => b.id - a.id)
      else if (orderBy === 'oldest') results.sort((a, b) => a.id - b.id)

      setTransactions(results)
      setCount(res.data.count)
      setTotalPages(Math.ceil(res.data.count / 10))
      setPage(pageNum)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [orderBy])

  const handleFilterSubmit = async (e) => {
    e.preventDefault()

    const params = { ...filters }

    // Convert relatedUtorid → relatedId
    if (filters.relatedUtorid) {
      try {
        const res = await axios.get(`/users/utorid/${filters.relatedUtorid}`)
        params.relatedId = res.data.id
        delete params.relatedUtorid
      } catch (err) {
        toast.error('Related UTORid not found')
        return
      }
    }

    fetchTransactions(1, params)
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      type: '',
      promotionId: '',
      amount: '',
      operator: '',
      suspicious: '',
      relatedUtorid: '',
      relatedId: ''
    })
    fetchTransactions(1)
  }
  
  const typeColors = {
    transfer: '#e0f7ff',
    redemption: '#fff0f0',
    purchase: '#f9f9f9',
    adjustment: '#fefae0',
    event: '#f0fff4'
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>All Transactions</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>
        {count} total transaction{count !== 1 ? 's' : ''}
      </p>
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
        <form
          onSubmit={handleFilterSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#f9f9f9'
          }}
        >
          <input
            type="text"
            placeholder="Search by UTORid or Name"
            value={filters.name}
            onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
          />

          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="redemption">Redemption</option>
            <option value="purchase">Purchase</option>
            <option value="adjustment">Adjustment</option>
            <option value="event">Event</option>
          </select>

          <input
            type="text"
            placeholder="Related UTORid"
            value={filters.relatedUtorid}
            onChange={e => setFilters(f => ({ ...f, relatedUtorid: e.target.value }))}
            disabled={!filters.type}
          />

          <input
            type="number"
            placeholder="Promotion ID"
            value={filters.promotionId}
            onChange={e => setFilters(f => ({ ...f, promotionId: e.target.value }))}
          />

          <select
            value={filters.operator}
            onChange={e => setFilters(f => ({ ...f, operator: e.target.value }))}
          >
            <option value="">Amount Operator</option>
            <option value="gte">≥</option>
            <option value="lte">≤</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={filters.amount}
            onChange={e => setFilters(f => ({ ...f, amount: e.target.value }))}
            disabled={!filters.operator}
          />

          <select
            value={filters.suspicious}
            onChange={e => setFilters(f => ({ ...f, suspicious: e.target.value }))}
          >
            <option value="">All</option>
            <option value="true">Suspicious</option>
            <option value="false">Not Suspicious</option>
          </select>

          <select
            value={orderBy}
            onChange={e => setOrderBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount_desc">Points High → Low</option>
            <option value="amount_asc">Points Low → High</option>
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
        transactions.map(tx => (
            <div
                key={tx.id}
                style={{
                    background: typeColors[tx.type] || '#fff',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem',
                    transition: 'background 0.2s ease-in-out'
                }}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{tx.type.toUpperCase()}</strong>
                    <span>{tx.amount} pts</span>
                </div>

                <p>ID: {tx.id}</p>
                <p>Created by: {tx.createdBy?.utorid || tx.createdBy || 'Unknown'}</p>
                {tx.remark && <p>Remark: {tx.remark}</p>}
                {tx.suspicious && (
                    <div style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    background: '#ffe0e0',
                    color: '#a10000',
                    fontSize: '0.8rem',
                    borderRadius: '5px'
                    }}>
                    Suspicious
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                    onClick={() => navigate(`/manager/transactions/${tx.id}`)}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: '#1C2D5A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    >
                    View
                    </button>
                    <button
                    onClick={() => navigate(`/manager/adjustments/create?relatedId=${tx.id}`)}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: '#ccc',
                        color: '#333',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                    >
                    Adjust
                    </button>
                </div>
            </div>
        ))
      )}

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
