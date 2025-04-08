import { createContext, useState, useEffect } from "react";
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loaded, setLoaded] = useState(false);
    const [activeRole, setActiveRole] = useState(null);
    const navigate = useNavigate()
  
    const login = async (utorid, password) => {
      const res = await axios.post('/auth/tokens', { utorid, password })
      const token = res.data.token
      setToken(token)
      localStorage.setItem('token', token)
    
      const profile = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
    
      setUser(profile.data)
    
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
      localStorage.removeItem('token')
      navigate('/login')
    }
  
    useEffect(() => {
      if (token) {
        axios.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setUser(res.data))
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

