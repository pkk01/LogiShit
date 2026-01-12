import { Navigate, Route, Routes } from 'react-router-dom'
import AgentDashboard from './components/AgentDashboard'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import TicketDetailView from './components/TicketDetailView'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDeliveries from './pages/admin/AdminDeliveries'
import AdminProfile from './pages/admin/AdminProfile'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSupportManagement from './pages/AdminSupportManagement'
import Dashboard from './pages/Dashboard'
import Deliveries from './pages/Deliveries'
import DriverDashboard from './pages/driver/DriverDashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NewDelivery from './pages/NewDelivery'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'
import Register from './pages/Register'
import SupportDashboard from './pages/SupportDashboard'
import SupportFAQ from './pages/SupportFAQ'
import Track from './pages/Track'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-textPrimary">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/deliveries" element={<RequireAuth><Deliveries /></RequireAuth>} />
          <Route path="/deliveries/:id" element={<RequireAuth><NewDelivery /></RequireAuth>} />
          <Route path="/new-delivery" element={<RequireAuth><NewDelivery /></RequireAuth>} />
          <Route path="/order-history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
          <Route path="/track" element={<Track />} />
          <Route path="/driver/dashboard" element={<RequireAuth><DriverDashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/deliveries" element={<RequireAuth><AdminDeliveries /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
          <Route path="/admin/users/:userId/profile" element={<RequireAuth><AdminProfile /></RequireAuth>} />
          
          {/* Support System Routes */}
          <Route path="/support" element={<RequireAuth><SupportDashboard /></RequireAuth>} />
          <Route path="/support/tickets/:ticketId" element={<RequireAuth><TicketDetailView /></RequireAuth>} />
          <Route path="/support/faq" element={<SupportFAQ />} />
          <Route path="/agent/dashboard" element={<RequireAuth><AgentDashboard /></RequireAuth>} />
          <Route path="/admin/support" element={<RequireAuth><AdminSupportManagement /></RequireAuth>} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
