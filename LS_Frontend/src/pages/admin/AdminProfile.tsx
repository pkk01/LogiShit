import axios from 'axios'
import { ChevronLeft, Mail, MapPin, Phone, Save, Shield, User, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COUNTRY_CODES, format10DigitPhone, isValid10DigitPhone } from '../../utils/phoneFormat'

interface UserProfile {
  id: string
  name: string
  email: string
  contact_number: string
  address: string
  role: string
}

export default function AdminProfile() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile & { country_code: string }>>({ country_code: '+1' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const res = await axios.get(`/api/admin/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(res.data)
      setFormData(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch user', err)
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'contact_number') {
      setFormData((prev) => ({ ...prev, [name]: format10DigitPhone(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      setMessage({ type: 'error', text: 'Name and email are required' })
      return
    }

    if (formData.contact_number && !isValid10DigitPhone(formData.contact_number)) {
      setMessage({ type: 'error', text: 'Please enter exactly 10 digits for phone number' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('access_token')
      await axios.put(
        `/api/admin/users/${userId}/`,
        {
          name: formData.name,
          email: formData.email,
          contact_number: formData.contact_number || '',
          address: formData.address || '',
          role: formData.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUser(formData as UserProfile)
      setMessage({ type: 'success', text: 'User profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.error || 'Failed to update user profile',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"></div>
          </div>
          <p className="text-textSecondary">Loading user profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit User Profile</h1>
              <p className="text-blue-100">Manage user information</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border-2 ${
            message.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-error/10 border-error/30 text-error'
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Form */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border-2 border-gray-100 p-7 shadow-md">
          <h2 className="text-2xl font-bold text-textPrimary mb-6">User Information</h2>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.country_code || '+1'}
                  onChange={handleChange}
                  className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                  name="country_code"
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number || ''}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="1234567890"
                  maxLength={10}
                />
              </div>
              {formData.contact_number && !isValid10DigitPhone(formData.contact_number) && (
                <p className="text-xs text-error mt-1">Please enter exactly 10 digits</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="123 Main Street, City, State"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Role
              </label>
              <select
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="user">User</option>
                <option value="driver">Driver</option>
                <option value="support_agent">Support Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-surface rounded-2xl border-2 border-gray-100 p-7 shadow-md h-fit">
          <h2 className="text-lg font-bold text-textPrimary mb-6">User Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full h-20 bg-primary/5 rounded-xl">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-textSecondary uppercase font-semibold mb-1">ID</p>
                <p className="text-xs font-mono text-textPrimary">{user?.id}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-textSecondary uppercase font-semibold mb-1">Role</p>
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
                  {formData.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
