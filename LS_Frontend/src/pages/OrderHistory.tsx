import axios from 'axios';
import { ArrowLeft, Edit2, Eye, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryStatusTimeline from '../components/DeliveryStatusTimeline';
import { formatDateTime } from '../utils/dateFormat';

interface Delivery {
  id: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  weight: string;
  package_type: string;
  pickup_date: string;
  delivery_date?: string;
  tracking_number: string;
  created_at: string;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const statusOptions = ['Pending', 'Scheduled', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/deliveries/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(response.data);
      setFilteredDeliveries(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch deliveries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = deliveries;

    if (selectedStatus) {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((d) => new Date(d.created_at).toDateString() === filterDate);
    }

    setFilteredDeliveries(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedStatus, dateFilter]);

  const handleEdit = (delivery: Delivery) => {
    navigate(`/deliveries/${delivery.id}`, { state: { delivery, mode: 'edit' } });
  };

  const handleCancel = async (deliveryId: string) => {
    if (!window.confirm('Are you sure you want to cancel this delivery?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`/api/deliveries/${deliveryId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeliveries();
      setSelectedDelivery(null);
      alert('Delivery cancelled successfully');
    } catch (err) {
      alert('Failed to cancel delivery');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-textSecondary">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-textPrimary" />
          </button>
          <h1 className="text-3xl font-bold text-textPrimary">Order History</h1>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">Date Created</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6 text-error">
            {error}
          </div>
        )}

        {/* Deliveries List */}
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="bg-surface rounded-lg p-8 text-center border border-gray-200">
              <p className="text-textSecondary">No orders found</p>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-surface rounded-lg p-4 border border-gray-200 hover:border-primary transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Delivery Info */}
                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold">Tracking</p>
                    <p className="text-sm font-mono font-bold text-primary">{delivery.tracking_number}</p>
                  </div>

                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold">From</p>
                    <p className="text-sm text-textPrimary truncate">{delivery.pickup_address}</p>
                  </div>

                  <div>
                    <p className="text-xs text-textSecondary uppercase font-semibold">To</p>
                    <p className="text-sm text-textPrimary truncate">{delivery.delivery_address}</p>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-textSecondary uppercase font-semibold">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        delivery.status === 'Delivered' ? 'bg-success/20 text-success' :
                        delivery.status === 'Cancelled' ? 'bg-error/20 text-error' :
                        delivery.status === 'In Transit' || delivery.status === 'Out for Delivery' ? 'bg-primary/20 text-primary' :
                        'bg-gray-200 text-textSecondary'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {delivery.status !== 'Delivered' && delivery.status !== 'Cancelled' && delivery.status !== 'In Transit' && delivery.status !== 'Out for Delivery' && (
                        <>
                          <button
                            onClick={() => handleEdit(delivery)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(delivery.id)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">Delivery Details</h2>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Timeline */}
              <DeliveryStatusTimeline
                currentStatus={selectedDelivery.status}
                pickupDate={selectedDelivery.pickup_date}
                deliveryDate={selectedDelivery.delivery_date}
              />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-textSecondary uppercase font-semibold">Tracking Number</label>
                  <p className="text-lg font-mono font-bold text-primary">{selectedDelivery.tracking_number}</p>
                </div>
                <div>
                  <label className="text-xs text-textSecondary uppercase font-semibold">Status</label>
                  <p className="text-lg font-semibold text-textPrimary">{selectedDelivery.status}</p>
                </div>
                <div>
                  <label className="text-xs text-textSecondary uppercase font-semibold">Weight</label>
                  <p className="text-lg text-textPrimary">{selectedDelivery.weight || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-textSecondary uppercase font-semibold">Package Type</label>
                  <p className="text-lg text-textPrimary">{selectedDelivery.package_type || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-textSecondary uppercase font-semibold">Pickup Address</label>
                  <p className="text-lg text-textPrimary">{selectedDelivery.pickup_address}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-textSecondary uppercase font-semibold">Delivery Address</label>
                  <p className="text-lg text-textPrimary">{selectedDelivery.delivery_address}</p>
                </div>
                <div>
                  <label className="text-xs text-textSecondary uppercase font-semibold">Pickup Date</label>
                  <p className="text-lg text-textPrimary">{formatDateTime(selectedDelivery.pickup_date)}</p>
                </div>
                {selectedDelivery.delivery_date && (
                  <div>
                    <label className="text-xs text-textSecondary uppercase font-semibold">Delivery Date</label>
                    <p className="text-lg text-textPrimary">{formatDateTime(selectedDelivery.delivery_date)}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedDelivery.status !== 'Delivered' && selectedDelivery.status !== 'Cancelled' && selectedDelivery.status !== 'In Transit' && selectedDelivery.status !== 'Out for Delivery' && (
                  <>
                    <button
                      onClick={() => {
                        navigate(`/deliveries/${selectedDelivery.id}`, { state: { delivery: selectedDelivery, mode: 'edit' } });
                        setSelectedDelivery(null);
                      }}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition font-medium"
                    >
                      Edit Delivery
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedDelivery.id);
                      }}
                      className="flex-1 bg-error text-white py-2 rounded-lg hover:bg-error/90 transition font-medium"
                    >
                      Cancel Delivery
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="flex-1 bg-gray-200 text-textPrimary py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
