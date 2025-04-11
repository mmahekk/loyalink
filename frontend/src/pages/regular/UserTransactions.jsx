import { useEffect, useState } from 'react'
import axios from '../../api/axiosInstance'
import { toast } from 'react-hot-toast'
import { Navigate, Link, useNavigate } from 'react-router-dom'

export default function UserTransactions() {
  const [transactions, setTransactions] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    type: '',
    relatedId: '',
    promotionId: '',
    amount: '',
    operator: ''
  })

  const fetchTransactions = async (pageNum) => {
    try {
      const params = {
        page: pageNum,
        limit: 5,
        ...filters
      }

      if (params.relatedId === '') delete params.relatedId
      if (params.promotionId === '') delete params.promotionId
      if (params.amount === '') delete params.amount
      if (params.type === '') delete params.type
      if (params.operator === '') delete params.operator

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
    fetchTransactions(page)
  }, [page])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchTransactions(1)
  }

  const handleClearFilters = () => {
    setFilters({
      type: '',
      relatedId: '',
      promotionId: '',
      amount: '',
      operator: ''
    })
    fetchTransactions(1)
  }

  const typeColor = {
    purchase: '#e0f7ff',
    redemption: '#f0fff0',
    transfer: '#fff0f0',
    adjustment: '#f5f5f5',
    event: '#f9f9ff'
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>My Transactions</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowFilters(prev => !prev)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: '#1C2D5A',
            color: 'white',
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
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '2rem',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <select
            value={filters.type}
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="redemption">Redemption</option>
            <option value="purchase">Purchase</option>
            <option value="adjustment">Adjustment</option>
            <option value="event">Event</option>
          </select>

          <input
            type="number"
            placeholder="Related ID"
            value={filters.relatedId}
            onChange={(e) => setFilters(f => ({ ...f, relatedId: e.target.value }))}
            disabled={!filters.type}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />

          <input
            type="number"
            placeholder="Promotion ID"
            value={filters.promotionId}
            onChange={(e) => setFilters(f => ({ ...f, promotionId: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />

          <select
            value={filters.operator}
            onChange={(e) => setFilters(f => ({ ...f, operator: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="">Amount Operator</option>
            <option value="gte">≥</option>
            <option value="lte">≤</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={filters.amount}
            onChange={(e) => setFilters(f => ({ ...f, amount: e.target.value }))}
            disabled={!filters.operator}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
            <button type="submit" style={{ flex: 1, padding: '0.5rem' }}>Apply</button>
            <button type="button" onClick={handleClearFilters} style={{ flex: 1, padding: '0.5rem' }}>Clear</button>
          </div>
        </form>
      )}

      {transactions.length === 0 && <p>No transactions yet.</p>}

      {transactions.map(tx => (
        <div key={tx.id} style={{
          background: typeColor[tx.type] || '#f4f4f4',
          border: '1px solid #ccc',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{tx.type.toUpperCase()}</strong>
            {tx.amount !== undefined && <span>{tx.amount} pts</span>}
          </div>
          {tx.relatedId && <p>Related ID: {tx.relatedId}</p>}
          {tx.promotionId && <p>Promo ID: {tx.promotionId}</p>}
          {tx.remark && <p>Note: {tx.remark}</p>}
          {tx.type === 'redemption' && (
           <>
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
       
           {!tx.processed && (
             <div style={{ marginTop: '0.5rem' }}>
               <button
                 onClick={() => navigate(`/user/redeem/${tx.id}`)}
                 style={{
                   padding: '0.4rem 0.75rem',
                   marginTop: '0.4rem',
                   borderRadius: '6px',
                   border: 'none',
                   background: '#1C2D5A',
                   color: 'white',
                   cursor: 'pointer'
                 }}
               >
                 View QR Code
               </button>
             </div>
           )}
         </>
          )}
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>By: {tx.createdBy}</p>
        </div>
      ))}

      {count > 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
