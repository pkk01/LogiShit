import { BadgeCheck, Bell, History, LogOut, Moon, Settings, Sun, Truck, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import notificationService from '../services/notificationService'
import NotificationDropdown from './NotificationDropdown'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('user_id')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [unreadCount, setUnreadCount] = useState(0)
  const [realtimeTick, setRealtimeTick] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // keep state in sync if theme changes elsewhere
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  // WebSocket realtime notifications
  useEffect(() => {
    if (!token || !userId) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socketUrl = `${protocol}://${window.location.host}/ws/notifications/${userId}/?token=${token}`
    let retryTimer: number | undefined

    const connect = () => {
      const socket = new WebSocket(socketUrl)
      wsRef.current = socket

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload?.unread_count !== undefined) {
            setUnreadCount(payload.unread_count)
          }
          setRealtimeTick((t) => t + 1)
        } catch (err) {
          console.error('WebSocket message parse error', err)
        }
      }

      socket.onclose = () => {
        wsRef.current = null
        retryTimer = window.setTimeout(connect, 3000)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [token, userId])

  // Fetch unread count on component mount and periodically
  useEffect(() => {
    if (token) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [token])

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }
  const isHome = location.pathname === '/' || location.pathname === '/dashboard'
  return (
    <nav className="bg-surface dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className={`${isHome ? 'max-w-6xl' : 'max-w-7xl'} mx-auto px-4`}>
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
            {token && role === 'user' && (
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
                  to="/support"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all shadow-md shadow-orange-600/20"
                >
                  Support
                </Link>
                <Link
                  to="/new-delivery"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg transition-all shadow-md shadow-primary/20"
                >
                  New Delivery
                </Link>
              </>
            )}
            {token && role === 'driver' && (
              <>
                <Link
                  to="/driver/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-md shadow-green-600/20 flex items-center gap-1"
                >
                  <Truck className="w-4 h-4" /> My Deliveries
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
                <Link
                  to="/admin/support"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-md shadow-purple-600/20"
                >
                  Support Management
                </Link>
              </>
            )}
            {token && role === 'support_agent' && (
              <>
                <Link
                  to="/agent/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1"
                >
                  My Tickets
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
            
            {/* Notifications Bell - visible for authenticated users */}
            {token && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-primary/5 transition-all relative"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-textSecondary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)}
                  onNotificationClick={() => fetchUnreadCount()}
                  onCountChange={fetchUnreadCount}
                  refreshKey={realtimeTick}
                />
              </div>
            )}
            
            {/* Theme toggle - always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-primary/5 transition-all"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-textSecondary" />}
            </button>
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
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg transition-all shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface dark:bg-gray-800 rounded-xl shadow-xl border-2 border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    {role === 'admin' ? (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-textPrimary hover:bg-primary/5 transition-colors border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-3 px-4 py-3 text-textPrimary hover:bg-primary/5 transition-colors border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4 text-primary" />
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowProfileMenu(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-textPrimary hover:bg-primary/5 transition-colors border-b border-gray-100 dark:border-gray-700"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowProfileMenu(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/5 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
