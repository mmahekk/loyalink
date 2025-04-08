import { Routes, Route } from 'react-router-dom'
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
//import ManagerDashboard from './pages/manager/ManagerDashboard'
//import CashierDashboard from './pages/cashier/CashierDashboard'

export default function App() {

  const { user } = useContext(AuthContext)

  return (
    <>
      {user && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute roles={['regular']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute roles={['regular']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/qr"
          element={
            <ProtectedRoute roles={['regular']}>
              <UserQRCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/transfer"
          element={
            <ProtectedRoute roles={['regular']}>
              <TransferPoints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/redeem"
          element={
            <ProtectedRoute roles={['regular']}>
              <RedeemPoints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/redeem/:transactionId"
          element={
            <ProtectedRoute roles={['regular']}>
              <RedeemQRCode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/promotions"
          element={
            <ProtectedRoute roles={['regular']}>
              <ViewPromotions/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/events"
          element={
            <ProtectedRoute roles={['regular']}>
              <ViewEvents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/events/:eventId"
          element={
            <ProtectedRoute roles={['regular']}>
              <EventDetail/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/transactions"
          element={
            <ProtectedRoute roles={['regular']}>
              <UserTransactions/>
            </ProtectedRoute>
          }
        />
     </Routes>
    </>
  )
}
