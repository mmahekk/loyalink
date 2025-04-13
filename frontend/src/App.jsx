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
import ManagerUserList from './pages/manager/ManagerUserList'
import ManagerUserDetail from './pages/manager/ManagerUserDetail'
import ManagerTransactionList from './pages/manager/ManagerTransactionList'
import ManagerTransactionDetail from './pages/manager/ManagerTransactionDetail'
import ManagerCreateAdjustment from './pages/manager/ManagerCreateAdjustment'
import CashierDashboard from './pages/cashier/CashierDashboard'
import CashierCreateTransaction from './pages/cashier/CashierCreateTransaction'
import CashierProcessRedemption from './pages/cashier/CashierProcessRedemption'
import ManagerEvents from './pages/manager/ManagerEvents'
import ManagerCreateEvent from './pages/manager/ManagerCreateEvent'
import ManagerEventList from './pages/manager/ManagerEventsList'
import ManagerDeleteEvent from './pages/manager/ManagerDeleteEvent'
import ManagerUpdateEvent from './pages/manager/ManagerUpdateEvent'
import ManagerAddOrganizer from './pages/manager/ManagerAddOrganizer'
import ManagerAddGuest from './pages/manager/ManagerAddGuest'
import ManagerRemoveGuest from './pages/manager/ManagerRemoveGuest'
import ManagerRewardGuest from './pages/manager/ManagerRewardGuests'
import ManagerPromotions from './pages/manager/ManagerPromotions'
import ManagerCreatePromotion from './pages/manager/ManagerCreatePromotion'
import ManagerPromotionList from './pages/manager/ManagerPromotionList'
import ManagerUpdatePromotion from './pages/manager/ManagerUpdatePromotion'
import CashierRegisterUser from './pages/cashier/CashierRegisterUser'

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
    
        {/* <Route path="/select-role" element={<RoleSelector />} /> */}
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
          path="/select-role"
          element={
            <ProtectedRoute roles={['cashier','manager', 'superuser']}>
              <RoleSelector/>
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
        <Route
          path="/manager/users"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerUserList/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerEvents/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/create"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerCreateEvent/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/users/:userId"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerUserDetail/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/transactions"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerTransactionList/>
            </ProtectedRoute>
          }
        />
       <Route
          path="/manager/transactions/:transactionId"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerTransactionDetail/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/adjustments/create"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerCreateAdjustment/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/view"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerEventList/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/delete"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerDeleteEvent/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/update"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerUpdateEvent/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/organizers"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerAddOrganizer/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/add-guest"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerAddGuest/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/remove-guest"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerRemoveGuest/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/events/reward"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerRewardGuest/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/promotions"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerPromotions/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/manager/promotions/create"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerCreatePromotion/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/promotions/view"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerPromotionList/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/promotions/update/:id"
          element={
            <ProtectedRoute roles={['manager', 'superuser']}>
              <ManagerUpdatePromotion/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute roles={['cashier', 'superuser']}>
              <CashierDashboard/>
            </ProtectedRoute>
          }
          />

        <Route
          path="/cashier/transactions"
          element={
            <ProtectedRoute roles={['cashier', 'superuser']}>
              <CashierCreateTransaction/>
            </ProtectedRoute>
          }
          />
        
        <Route
          path="/cashier/process-redemption"
          element={
            <ProtectedRoute roles={['cashier', 'superuser']}>
              <CashierProcessRedemption/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/register"
          element={
            <ProtectedRoute roles={['cashier', 'superuser']}>
              <CashierRegisterUser />
            </ProtectedRoute>
          }
        />
          

     </Routes>
    </>
  )
}
