import axios from 'axios'
import { Package } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    axios.get('/api/profile/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-10 h-10" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-blue-100 text-lg">Welcome to your logistics management portal</p>
      </div>

      {/* Welcome Card */}
      {profile && (
        <div className="bg-surface rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-textSecondary text-sm font-medium uppercase tracking-wide mb-1">Welcome back,</p>
              <h2 className="text-2xl font-bold text-textPrimary">{profile.name}</h2>
              <p className="text-textSecondary mt-1">{profile.email}</p>
            </div>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-success/10 rounded-full">
              <Package className="w-7 h-7 text-success" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/new-delivery" className="bg-surface hover:bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-primary/30 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-textPrimary">New Delivery</h3>
              <p className="text-sm text-textSecondary">Create shipment</p>
            </div>
          </div>
        </a>
        <a href="/deliveries" className="bg-surface hover:bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-secondary/30 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <Package className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-textPrimary">My Deliveries</h3>
              <p className="text-sm text-textSecondary">View active orders</p>
            </div>
          </div>
        </a>
        <a href="/track" className="bg-surface hover:bg-gray-50 rounded-xl p-6 shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-alert/30 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-alert/10 rounded-lg flex items-center justify-center group-hover:bg-alert/20 transition-colors">
              <Package className="w-6 h-6 text-alert" />
            </div>
            <div>
              <h3 className="font-semibold text-textPrimary">Track Package</h3>
              <p className="text-sm text-textSecondary">Check status</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
