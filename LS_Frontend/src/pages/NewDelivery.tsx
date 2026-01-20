import axios from 'axios'
import { ArrowLeft, Calendar, Check, IndianRupee, Loader2, MapPin, Package, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiUrl } from '../utils/apiBase'
import { getCitiesForState, indiaStates } from '../utils/indiaLocations'
import { formatPrice, PACKAGE_TYPES } from '../utils/priceFormat'

interface DeliveryForm {
  pickup: AddressFields
  delivery: AddressFields
  weight: string
  package_type: string
  pickup_date: string
}

interface AddressFields {
  line1: string
  line2: string
  landmark: string
  city: string
  state: string
  pincode: string
  country: string
}

interface PriceEstimate {
  base_rate: number
  distance_km: number
  distance_cost: number
  weight_kg: number
  weight_cost: number
  package_type: string
  package_surcharge: number
  total_price: number
}

export default function NewDelivery() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [form, setForm] = useState<DeliveryForm>({
    pickup: {
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    delivery: {
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    weight: '',
    package_type: 'Small',
    pickup_date: '',
  })
  const [msg, setMsg] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [estimating, setEstimating] = useState(false)

  useEffect(() => {
    const state = location.state as any
    if (state?.mode === 'edit' && state?.delivery) {
      setIsEditing(true)
      const delivery = state.delivery
      const mapAddressFromString = (address: string): AddressFields => ({
        line1: address || '',
        line2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
      })

      setForm({
        pickup: mapAddressFromString(delivery.pickup_address),
        delivery: mapAddressFromString(delivery.delivery_address),
        weight: delivery.weight ? `${delivery.weight}` : '',
        package_type: delivery.package_type || 'Small',
        pickup_date: new Date(delivery.pickup_date).toISOString().split('T')[0],
      })
    }
  }, [location])

  // Estimate price function
  const estimatePrice = async () => {
    const pickupPincode = form.pickup.pincode
    const deliveryPincode = form.delivery.pincode
    const weight = parseFloat(form.weight)
    const { city: pickup_city, state: pickup_state } = form.pickup
    const { city: delivery_city, state: delivery_state } = form.delivery

    // Require city/state because backend distance calc uses only these
    if (!pickup_city || !pickup_state || !delivery_city || !delivery_state) {
      setPriceEstimate(null)
      return
    }

    if (!pickupPincode || !deliveryPincode || !weight || !form.package_type) {
      setPriceEstimate(null)
      return
    }

    setEstimating(true)
    try {
      const backendUrl = apiUrl()
      const payload = {
        pickup_pincode: pickupPincode.toString(),
        delivery_pincode: deliveryPincode.toString(),
        pickup_city,
        pickup_state,
        delivery_city,
        delivery_state,
        weight: weight,
        package_type: form.package_type
      }
      console.log('=== PRICE ESTIMATION REQUEST ===')
      console.log('Payload:', payload)
      console.log('URL:', `${backendUrl}/estimate-price/`)
      const res = await axios.post(`${backendUrl}/estimate-price/`, payload)
      console.log('=== PRICE ESTIMATION SUCCESS ===')
      console.log('Response:', res.data)
      setPriceEstimate(res.data)
    } catch (err: any) {
      console.error('=== PRICE ESTIMATION ERROR ===')
      console.error('Full error object:', err)
      console.error('Error status:', err?.response?.status)
      console.error('Error response data:', err?.response?.data)
      console.error('Error message:', err?.message)
      setPriceEstimate(null)
    } finally {
      setEstimating(false)
    }
  }

  // Auto-estimate price when form changes
  useEffect(() => {
    const timer = setTimeout(() => {
      estimatePrice()
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [form.pickup, form.delivery, form.weight, form.package_type])

  const formatAddress = (addr: AddressFields) =>
    [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode, addr.country]
      .filter(Boolean)
      .join(', ')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('access_token')
    const backendUrl = apiUrl()

    const pickupRequired = [form.pickup.line1, form.pickup.city, form.pickup.state, form.pickup.pincode].every(Boolean)
    const deliveryRequired = [form.delivery.line1, form.delivery.city, form.delivery.state, form.delivery.pincode].every(Boolean)

    if (!pickupRequired || !deliveryRequired || !form.pickup_date) {
      setMsg('Please complete required address fields and pickup date')
      return
    }

    setLoading(true)

    try {
      if (isEditing && id) {
        const res = await axios.put(`${backendUrl}/deliveries/${id}/edit/`, {
          pickup_address: formatAddress(form.pickup),
          delivery_address: formatAddress(form.delivery),
          pickup: form.pickup,
          delivery: form.delivery,
          weight: parseFloat(form.weight) || 0,
          package_type: form.package_type,
          pickup_date: new Date(form.pickup_date).toISOString(),
        }, { headers: { Authorization: `Bearer ${token}` } })
        setMsg(`Updated: ${res.data.delivery.tracking_number}`)
        setTimeout(() => {
          navigate('/deliveries')
        }, 1500)
      } else {
        const res = await axios.post(`${backendUrl}/deliveries/`, {
          pickup_address: formatAddress(form.pickup),
          delivery_address: formatAddress(form.delivery),
          pickup: form.pickup,
          delivery: form.delivery,
          weight: parseFloat(form.weight) || 0,
          package_type: form.package_type,
          pickup_date: new Date(form.pickup_date).toISOString(),
        }, { headers: { Authorization: `Bearer ${token}` } })
        setMsg(`Created: ${res.data.delivery.tracking_number}`)
        setForm({
          pickup: {
            line1: '',
            line2: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
          },
          delivery: {
            line1: '',
            line2: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            country: '',
          },
          weight: '',
          package_type: 'Small',
          pickup_date: '',
        })
        setPriceEstimate(null)
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
                <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" />
                  Pickup Address <span className="text-error">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Pincode <span className="text-error">*</span></label>
                    <input
                      value={form.pickup.pincode}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, pincode: e.target.value } })}
                      placeholder="e.g., 560001"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Address Line 1 <span className="text-error">*</span></label>
                    <input
                      value={form.pickup.line1}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, line1: e.target.value } })}
                      placeholder="House / Building / Street"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Address Line 2</label>
                    <input
                      value={form.pickup.line2}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, line2: e.target.value } })}
                      placeholder="Apartment, floor, block"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Landmark</label>
                    <input
                      value={form.pickup.landmark}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, landmark: e.target.value } })}
                      placeholder="Near park / mall"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">State <span className="text-error">*</span></label>
                    <select
                      value={form.pickup.state}
                      onChange={(e) => {
                        const nextState = e.target.value
                        setForm({
                          ...form,
                          pickup: { ...form.pickup, state: nextState, city: '' }
                        })
                      }}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="">Select State</option>
                      {indiaStates.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">City <span className="text-error">*</span></label>
                    <select
                      value={form.pickup.city}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, city: e.target.value } })}
                      disabled={!form.pickup.state}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all bg-white disabled:bg-gray-100"
                      required
                    >
                      <option value="">{form.pickup.state ? 'Select City' : 'Select state first'}</option>
                      {getCitiesForState(form.pickup.state).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-textSecondary">Country</label>
                    <input
                      value={form.pickup.country}
                      onChange={(e) => setForm({ ...form, pickup: { ...form.pickup, country: e.target.value } })}
                      placeholder="Country"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:pl-6 md:border-l md:border-dashed md:border-gray-200 md:ml-2 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
                <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-error" />
                  Delivery Address <span className="text-error">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Pincode <span className="text-error">*</span></label>
                    <input
                      value={form.delivery.pincode}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, pincode: e.target.value } })}
                      placeholder="e.g., 560034"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Address Line 1 <span className="text-error">*</span></label>
                    <input
                      value={form.delivery.line1}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, line1: e.target.value } })}
                      placeholder="House / Building / Street"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Address Line 2</label>
                    <input
                      value={form.delivery.line2}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, line2: e.target.value } })}
                      placeholder="Apartment, floor, block"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">Landmark</label>
                    <input
                      value={form.delivery.landmark}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, landmark: e.target.value } })}
                      placeholder="Near school / office"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">State <span className="text-error">*</span></label>
                    <select
                      value={form.delivery.state}
                      onChange={(e) => {
                        const nextState = e.target.value
                        setForm({
                          ...form,
                          delivery: { ...form.delivery, state: nextState, city: '' }
                        })
                      }}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="">Select State</option>
                      {indiaStates.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textSecondary">City <span className="text-error">*</span></label>
                    <select
                      value={form.delivery.city}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, city: e.target.value } })}
                      disabled={!form.delivery.state}
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all bg-white disabled:bg-gray-100"
                      required
                    >
                      <option value="">{form.delivery.state ? 'Select City' : 'Select state first'}</option>
                      {getCitiesForState(form.delivery.state).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-textSecondary">Country</label>
                    <input
                      value={form.delivery.country}
                      onChange={(e) => setForm({ ...form, delivery: { ...form.delivery, country: e.target.value } })}
                      placeholder="Country"
                      className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-all"
                    />
                  </div>
                </div>
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
                <label className="text-sm font-semibold text-textPrimary">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g., 5.0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-textPrimary">Package Type</label>
                <select
                  value={form.package_type}
                  onChange={(e) => setForm({ ...form, package_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                >
                  {PACKAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  Estimated Price
                </label>
                <div className="w-full px-4 py-3 border-2 border-primary/30 rounded-xl bg-primary/5 flex items-center gap-2">
                  {estimating ? (
                    <>
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-textSecondary text-sm">Calculating...</span>
                    </>
                  ) : priceEstimate ? (
                    <span className="text-xl font-bold text-primary">{formatPrice(priceEstimate.total_price)}</span>
                  ) : (
                    <span className="text-textSecondary text-sm">Enter all details</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {priceEstimate && (
              <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-blue-50 border-2 border-primary/20 rounded-xl">
                <p className="text-sm font-semibold text-textPrimary mb-3">Price Breakdown:</p>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Base Rate:</span>
                    <span className="font-semibold text-textPrimary">{formatPrice(priceEstimate.base_rate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Distance ({priceEstimate.distance_km.toFixed(2)} km):</span>
                    <span className="font-semibold text-textPrimary">{formatPrice(priceEstimate.distance_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">Weight ({priceEstimate.weight_kg} kg):</span>
                    <span className="font-semibold text-textPrimary">{formatPrice(priceEstimate.weight_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSecondary">{priceEstimate.package_type} Surcharge:</span>
                    <span className="font-semibold text-textPrimary">{formatPrice(priceEstimate.package_surcharge)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Date Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
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
