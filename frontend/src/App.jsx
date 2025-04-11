import { Routes, Route, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './auth/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Success from './pages/Success'
import NavBar from './components/NavBar'
import UserProfile from './pages/regular/UserProfile'
import UserDashboard from './pages/regular/UserDashboard'
import ProtectedRoute from './auth/ProtectedRoute'
import UserQRCode from './pages/regular/UserQRCode'
import TransferPoints from './pages/regular/TransferPoints'
import RedeemPoints from './pages/regular/RedeemPoints'
import RedeemQRCode from './pages/regular/RedeemQRCode'
import ViewPromotions from './pages/regular/ViewPromotions'
import ViewEvents from './pages/regular/ViewEvents'
import EventDetail from './pages/regular/EventDetail'
import UserTransactions from './pages/regular/UserTransactions'
import RoleSelector from './pages/RoleSelector'
import ManagerDashboard from './pages/manager/ManagerDashboard'
//import CashierDashboard from './pages/cashier/CashierDashboard'

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/select-role'
  const { user } = useContext(AuthContext)

  return (
    <>
      {user && !hideNav && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        
        <Route path="/select-role" element={<RoleSelector />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/qr"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <UserQRCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/transfer"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <TransferPoints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/redeem"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <RedeemPoints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/redeem/:transactionId"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <RedeemQRCode />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/user/promotions"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <ViewPromotions/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/events"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <ViewEvents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/events/:eventId"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <EventDetail/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/transactions"
          element={
            <ProtectedRoute roles={['regular', 'cashier', 'manager', 'superuser']}>
              <UserTransactions/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerDashboard/>
            </ProtectedRoute>
          }
        />

     </Routes>
    </>
  )
}
