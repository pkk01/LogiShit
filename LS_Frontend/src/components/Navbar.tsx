import { BadgeCheck, History, LogOut, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')
  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }
  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              LogiShift
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            {token && role !== 'admin' && (
              <>
                <Link
                  to="/deliveries"
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  My Deliveries
                </Link>
                <Link
                  to="/order-history"
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all flex items-center gap-1"
                >
                  <History className="w-4 h-4" /> History
                </Link>
                <Link
                  to="/new-delivery"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg transition-all shadow-md shadow-primary/20"
                >
                  New Delivery
                </Link>
              </>
            )}
            {token && role === 'admin' && (
              <>
                <Link
                  to="/admin/deliveries"
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Manage Deliveries
                </Link>
                <Link
                  to="/admin/users"
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Manage Users
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Link
              to="/track"
              className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-alert hover:bg-alert/5 rounded-lg transition-all flex items-center gap-1"
            >
              <BadgeCheck className="w-4 h-4" /> Track
            </Link>
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg transition-all shadow-md shadow-primary/20"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-all flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
