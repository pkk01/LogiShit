import axios from 'axios'
import { Mail, Search, Shield, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminUsers() {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    axios.get('/api/admin/users/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setItems(res.data))
  }, [])

  const filteredUsers = items.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              User Management
            </h1>
            <p className="text-blue-100 text-lg">Total Users: {items.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((u, idx) => (
          <div 
            key={u.id} 
            className="group bg-surface rounded-2xl border-2 border-gray-100 hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Header with Role Badge */}
            <div className={`px-6 py-4 ${
              u.role === 'admin' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                : 'bg-gradient-to-r from-primary to-blue-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{u.name}</h3>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-textSecondary font-medium uppercase tracking-wide">Email</p>
                  <p className="text-sm text-textPrimary truncate font-medium">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-xs text-textSecondary font-medium uppercase tracking-wide">Role</p>
                  <p className="text-sm text-textPrimary font-bold capitalize">{u.role}</p>
                </div>
              </div>

              {u.id && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-textSecondary font-medium">User ID</p>
                  <p className="text-xs text-textPrimary font-mono mt-1">{u.id}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-gradient-to-br from-surface to-gray-50 p-16 rounded-2xl text-center border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-textPrimary mb-3">No Users Found</h3>
          <p className="text-textSecondary text-lg">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
