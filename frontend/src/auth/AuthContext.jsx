import { createContext, useState, useEffect } from "react";
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loaded, setLoaded] = useState(false);
    const [activeRole, _setActiveRole] = useState(() => {
      return localStorage.getItem('activeRole') || null
    })
    
    const setActiveRole = (role) => {
      _setActiveRole(role)
      if (role) {
        localStorage.setItem('activeRole', role)
      } else {
        localStorage.removeItem('activeRole')
      }
    }
    const navigate = useNavigate()
  
    const login = async (utorid, password) => {
      const res = await axios.post('/auth/tokens', { utorid, password })
      const token = res.data.token
      setToken(token)
      localStorage.setItem('token', token)
    
      const profile = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
    
      setUser({
        ...profile.data,
        isOrganizer: profile.data.eventOrganizers && profile.data.eventOrganizers.length > 0
      })
    
      switch (profile.data.role) {
        case 'regular':
          navigate('/user')
          break
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
          setUser({
            ...res.data,
            isOrganizer: res.data.eventOrganizers && res.data.eventOrganizers.length > 0
          })
        })
        
        .catch(() => logout())
        .finally(()=> setLoaded(true))
      }else{
        setLoaded(true)
      }
    }, [token])
  
    return (
      <AuthContext.Provider value={{ user, token, login, logout, loaded, setUser, activeRole, setActiveRole }}>
        {children}
      </AuthContext.Provider>
    )
  }

