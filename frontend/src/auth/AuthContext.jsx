import { createContext, useState, useEffect } from "react";
import axios from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loaded, setLoaded] = useState(false)
  const [activeRole, _setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || null
  })

  const location = useLocation()
  const navigate = useNavigate()

  const setActiveRole = (role) => {
    _setActiveRole(role)
    if (role) {
      localStorage.setItem('activeRole', role)
    } else {
      localStorage.removeItem('activeRole')
    }
  }

  const login = async (utorid, password) => {
    const res = await axios.post('/auth/tokens', { utorid, password })
    const token = res.data.token
    setToken(token)
    localStorage.setItem('token', token)

    const profileRes = await axios.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const userData = {
      ...profileRes.data,
      isOrganizer: profileRes.data.eventOrganizers && profileRes.data.eventOrganizers.length > 0
    }

    setUser(userData)

    if (userData.role === 'regular') {
      navigate('/select-role')
    } else {
      switch (userData.role) {
        case 'cashier':
          navigate('/cashier')
          break
        case 'manager':
          navigate('/manager')
          break
        case 'superuser':
          navigate('/superuser')
          break
        default:
          navigate('/')
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setActiveRole(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  useEffect(() => {
    if (token) {
      axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const isOrganizer = res.data.eventOrganizers && res.data.eventOrganizers.length > 0
          setUser({ ...res.data, isOrganizer })

          if (isOrganizer) {
            setActiveRole("organizer")
          } else {
            setActiveRole(res.data.role)
          }
        })
        .catch(() => logout())
        .finally(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loaded, setUser, activeRole, setActiveRole }}>
      {children}
    </AuthContext.Provider>
  )
}
