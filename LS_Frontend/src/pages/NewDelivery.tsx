import axios from 'axios'
import { ArrowLeft, Calendar, Check, MapPin, Package, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface DeliveryForm {
  pickup_address: string
  delivery_address: string
  weight?: string
  package_type?: string
  pickup_date: string
}

export default function NewDelivery() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [form, setForm] = useState<DeliveryForm>({
    pickup_address: '',
    delivery_address: '',
    weight: '',
    package_type: '',
    pickup_date: '',
  })
  const [msg, setMsg] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const state = location.state as any
    if (state?.mode === 'edit' && state?.delivery) {
      setIsEditing(true)
      const delivery = state.delivery
      setForm({
        pickup_address: delivery.pickup_address,
        delivery_address: delivery.delivery_address,
        weight: delivery.weight || '',
        package_type: delivery.package_type || '',
        pickup_date: new Date(delivery.pickup_date).toISOString().split('T')[0],
      })
    }
  }, [location])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')

    if (!form.pickup_address || !form.delivery_address || !form.pickup_date) {
      setMsg('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      if (isEditing && id) {
        const res = await axios.put(`/api/deliveries/${id}/edit/`, {
          ...form,
          pickup_date: new Date(form.pickup_date).toISOString(),
        }, { headers: { Authorization: `Bearer ${token}` } })
        setMsg(`Updated: ${res.data.delivery.tracking_number}`)
        setTimeout(() => {
          navigate('/deliveries')
        }, 1500)
      } else {
        const res = await axios.post('/api/deliveries/', {
          ...form,
          pickup_date: new Date(form.pickup_date).toISOString(),
        }, { headers: { Authorization: `Bearer ${token}` } })
        setMsg(`Created: ${res.data.delivery.tracking_number}`)
        setForm({
          pickup_address: '',
          delivery_address: '',
          weight: '',
          package_type: '',
          pickup_date: '',
        })
        setTimeout(() => {
          navigate('/deliveries')
        }, 1500)
      }
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.response?.data?.error || 'Failed to save delivery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              {isEditing ? 'Edit Delivery' : 'New Delivery'}
            </h1>
            <p className="text-blue-100 text-sm mt-1">Fill in the details to schedule your shipment</p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {msg && (
        <div className={`max-w-4xl mx-auto mb-4 px-4 py-3 rounded-lg flex items-center gap-2 shadow-md ${
          msg.includes('Failed') || msg.includes('Please') 
            ? 'bg-gradient-to-br from-error/10 to-red-50 border-2 border-error/30 text-error'
            : 'bg-gradient-to-br from-success/10 to-green-50 border-2 border-success/30 text-success'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            msg.includes('Failed') || msg.includes('Please') ? 'bg-error/20' : 'bg-success/20'
          }`}>
            {msg.includes('Failed') || msg.includes('Please') ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          </div>
          <p className="font-semibold">{msg}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-4xl mx-auto bg-surface rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
        <form onSubmit={submit} className="p-8 space-y-8">
          {/* Location Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-textPrimary">Location Details</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" />
                  Pickup Address <span className="text-error">*</span>
                </label>
                <input
                  value={form.pickup_address}
                  onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
                  placeholder="Enter complete pickup address..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-error" />
                  Delivery Address <span className="text-error">*</span>
                </label>
                <input
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  placeholder="Enter complete delivery address..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-textPrimary">Package Details</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-textPrimary">Weight</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g., 5 kg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-textPrimary">Package Type</label>
                <select
                  value={form.package_type}
                  onChange={(e) => setForm({ ...form, package_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select Type</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Pickup Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={form.pickup_date}
                  onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="w-5 h-5" />
              {loading ? 'Saving...' : isEditing ? 'Update Delivery' : 'Create Delivery'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/deliveries')}
              className="px-8 py-4 bg-gray-200 text-textPrimary rounded-xl hover:bg-gray-300 transition-all font-semibold text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
