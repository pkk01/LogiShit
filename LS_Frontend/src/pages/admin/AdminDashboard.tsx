import axios from 'axios'
import { BarChart3, Boxes, MessageSquare, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeliveries: 0,
    totalTickets: 0,
    drivers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const headers = { Authorization: `Bearer ${token}` }

        const [usersRes, deliveriesRes, ticketsRes] = await Promise.all([
          axios.get('/api/admin/users/', { headers }),
          axios.get('/api/admin/deliveries/', { headers }),
          axios.get('/api/admin/support/tickets/', { headers })
        ])

        const users = usersRes.data
        const drivers = users.filter((u: any) => u.role === 'driver').length

        setStats({
          totalUsers: users.length,
          totalDeliveries: deliveriesRes.data.deliveries?.length || 0,
          totalTickets: ticketsRes.data.tickets?.length || 0,
          drivers: drivers
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-90 mb-1">{label}</p>
          <p className="text-4xl font-bold">{loading ? '-' : value}</p>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ icon: Icon, label, description, onClick, color }: any) => (
    <button
      onClick={onClick}
      className={`group bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 text-left`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-xl font-bold mb-2">{label}</h3>
      <p className="text-sm opacity-90">{description}</p>
      <div className="mt-4 text-sm font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
        Go <span>→</span>
      </div>
    </button>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-indigo-100 text-lg">Welcome back, Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Boxes}
          label="Active Drivers"
          value={stats.drivers}
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={Boxes}
          label="Total Deliveries"
          value={stats.totalDeliveries}
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Support Tickets"
          value={stats.totalTickets}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            icon={Users}
            label="Manage Users"
            description="View and manage all users, roles, and permissions"
            onClick={() => navigate('/admin/users')}
            color="from-blue-500 to-blue-600"
          />
          <QuickActionCard
            icon={Boxes}
            label="Manage Deliveries"
            description="Track and manage all deliveries and assignments"
            onClick={() => navigate('/admin/deliveries')}
            color="from-green-500 to-green-600"
          />
          <QuickActionCard
            icon={MessageSquare}
            label="Support Management"
            description="Handle customer support tickets and assign agents"
            onClick={() => navigate('/admin/support')}
            color="from-purple-500 to-purple-600"
          />
          <QuickActionCard
            icon={BarChart3}
            label="View Reports"
            description="Analyze system performance and analytics"
            onClick={() => {}}
            color="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Panel</h2>
        <p className="text-slate-600 mb-6">
          Welcome to the LogiShift Admin Dashboard. Use the quick actions above to manage your system or navigate using the tabs in the navigation bar.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/admin/deliveries"
            className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <h3 className="font-bold text-blue-900 mb-1">Manage Deliveries</h3>
            <p className="text-sm text-blue-700">View all deliveries and manage assignments</p>
          </Link>
          <Link
            to="/admin/users"
            className="block p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
          >
            <h3 className="font-bold text-green-900 mb-1">Manage Users</h3>
            <p className="text-sm text-green-700">Control user accounts and permissions</p>
          </Link>
          <Link
            to="/admin/support"
            className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            <h3 className="font-bold text-purple-900 mb-1">Support Tickets</h3>
            <p className="text-sm text-purple-700">Manage customer support requests</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
