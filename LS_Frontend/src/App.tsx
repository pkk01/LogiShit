import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Deliveries from './pages/Deliveries'
import Login from './pages/Login'
import NewDelivery from './pages/NewDelivery'
import OrderHistory from './pages/OrderHistory'
import Register from './pages/Register'
import Track from './pages/Track'
import AdminDeliveries from './pages/admin/AdminDeliveries'
import AdminUsers from './pages/admin/AdminUsers'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-textPrimary">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/deliveries" element={<RequireAuth><Deliveries /></RequireAuth>} />
          <Route path="/deliveries/:id" element={<RequireAuth><NewDelivery /></RequireAuth>} />
          <Route path="/new-delivery" element={<RequireAuth><NewDelivery /></RequireAuth>} />
          <Route path="/order-history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
          <Route path="/track" element={<Track />} />
          <Route path="/admin/deliveries" element={<RequireAuth><AdminDeliveries /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
        </Routes>
      </div>
    </div>
  )
}
