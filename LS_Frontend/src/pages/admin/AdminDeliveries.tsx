import axios from 'axios'
import { Calendar, Edit2, MapPin, Package, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import DeliveryStatusTimeline from '../../components/DeliveryStatusTimeline'
import { formatDate } from '../../utils/dateFormat'

interface Delivery {
  id: string
  user_id: string
  user_name: string
  user_email: string
  status: string
  pickup_address: string
  delivery_address: string
  weight: string
  package_type: string
  pickup_date: string
  delivery_date?: string
  tracking_number: string
  created_at: string
}

export default function AdminDeliveries() {
  const [items, setItems] = useState<Delivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const statusOptions = ['Pending', 'Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']

  const fetchDeliveries = () => {
    const token = localStorage.getItem('access_token')
    axios.get('/api/admin/deliveries/', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setItems(res.data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const handleUpdateStatus = async () => {
    if (!selectedDelivery || !newStatus) return

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.put(
        `/api/admin/delivery/${selectedDelivery.id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchDeliveries()
      setSelectedDelivery(null)
      setNewStatus('')
      alert('Delivery status updated successfully')
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openStatusModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery)
    setNewStatus(delivery.status)
  }

  const filteredItems = filterStatus 
    ? items.filter(d => d.status === filterStatus)
    : items

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Package className="w-8 h-8" /> Manage Deliveries
        </h1>
        <div className="text-sm text-textSecondary">
          Total: {filteredItems.length} deliveries
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-surface rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-textPrimary mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-surface rounded-lg p-8 text-center border border-gray-200">
            <p className="text-textSecondary">No deliveries found</p>
          </div>
        ) : (
          filteredItems.map((d) => (
            <div key={d.id} className="bg-surface rounded-lg p-6 border border-gray-200 hover:border-primary transition">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Tracking & User Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold">Tracking Number</p>
                    <p className="text-lg font-mono font-bold text-primary">{d.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold flex items-center gap-1">
                      <User className="w-3 h-3" /> Customer
                    </p>
                    <p className="text-sm font-semibold text-textPrimary">{d.user_name}</p>
                    <p className="text-xs text-textSecondary">{d.user_email}</p>
                  </div>
                </div>

                {/* Column 2: Addresses & Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Pickup Address
                    </p>
                    <p className="text-sm text-textPrimary">{d.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Delivery Address
                    </p>
                    <p className="text-sm text-textPrimary">{d.delivery_address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-textSecondary uppercase font-semibold">Weight</p>
                      <p className="text-sm text-textPrimary">{d.weight || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-textSecondary uppercase font-semibold">Type</p>
                      <p className="text-sm text-textPrimary">{d.package_type || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Column 3: Status & Actions */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold">Current Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      d.status === 'Delivered' ? 'bg-success/20 text-success' :
                      d.status === 'Cancelled' ? 'bg-error/20 text-error' :
                      d.status === 'In Transit' || d.status === 'Out for Delivery' ? 'bg-primary/20 text-primary' :
                      'bg-gray-200 text-textSecondary'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Pickup Date
                    </p>
                    <p className="text-sm text-textPrimary">{formatDate(d.pickup_date)}</p>
                  </div>
                  {d.delivery_date && (
                    <div>
                      <p className="text-xs text-textSecondary uppercase font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Delivery Date
                      </p>
                      <p className="text-sm text-textPrimary">{formatDate(d.delivery_date)}</p>
                    </div>
                  )}
                  <button
                    onClick={() => openStatusModal(d)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    <Edit2 className="w-4 h-4" /> Update Status
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Update Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">Update Delivery Status</h2>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Status Timeline */}
            <div className="mb-6">
              <DeliveryStatusTimeline
                currentStatus={selectedDelivery.status}
                pickupDate={selectedDelivery.pickup_date}
                deliveryDate={selectedDelivery.delivery_date}
              />
            </div>

            {/* Delivery Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-xs text-textSecondary uppercase font-semibold">Tracking Number</label>
                <p className="text-lg font-mono font-bold text-primary">{selectedDelivery.tracking_number}</p>
              </div>
              <div>
                <label className="text-xs text-textSecondary uppercase font-semibold">Customer</label>
                <p className="text-lg font-semibold text-textPrimary">{selectedDelivery.user_name}</p>
                <p className="text-sm text-textSecondary">{selectedDelivery.user_email}</p>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Select New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading || newStatus === selectedDelivery.status}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="flex-1 bg-gray-200 text-textPrimary py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
