import axios from 'axios';
import { AlertCircle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiUrl } from '../utils/apiBase';

interface Order {
  id: string;
  tracking_number: string;
  delivery_address: string;
  status: string;
  package_type: string;
}

interface SupportTicketFormProps {
  deliveryId?: string;
  onTicketCreated?: () => void;
}

export default function SupportTicketForm({ deliveryId, onTicketCreated }: SupportTicketFormProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(deliveryId || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const token = localStorage.getItem('access_token');

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await axios.get(apiUrl('/deliveries/'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (!deliveryId && token) {
      fetchOrders();
    } else if (deliveryId) {
      setLoadingOrders(false);
    }
  }, [token, deliveryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!selectedDeliveryId && !deliveryId) {
      setMessage('Please select an order/product');
      setMessageType('error');
      return;
    }

    if (!subject.trim()) {
      setMessage('Please enter a subject');
      setMessageType('error');
      return;
    }

    if (!description.trim()) {
      setMessage('Please enter a description');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const ticketData = {
        delivery_id: deliveryId || selectedDeliveryId,
        subject: subject.trim(),
        category: category,
        description: description.trim(),
      };

      await axios.post(apiUrl('/support/tickets/create/'), ticketData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setMessage('Support ticket created successfully! We will get back to you soon.');
      setMessageType('success');
      setSubject('');
      setCategory('general');
      setDescription('');
      if (!deliveryId) {
        setSelectedDeliveryId('');
      }

      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create ticket. Please try again.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <AlertCircle
            size={20}
            className={messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
          />
          <p
            className={
              messageType === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }
          >
            {message}
          </p>
        </div>
      )}

      {/* Order Selection */}
      {!deliveryId && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            <span className="flex items-center gap-2">
              <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
              Select Order/Product <span className="text-red-500">*</span>
            </span>
          </label>
          {loadingOrders ? (
            <div className="bg-slate-100 dark:bg-slate-700 h-10 rounded animate-pulse" />
          ) : orders.length === 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200">
                No active orders found. Please place an order to raise a support ticket.
              </p>
            </div>
          ) : (
            <select
              value={selectedDeliveryId}
              onChange={(e) => setSelectedDeliveryId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition"
            >
              <option value="">-- Select an order --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.tracking_number} - {order.package_type} ({order.status})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Subject */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief description of your issue"
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition"
          required
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition"
        >
          <option value="general">General Inquiry</option>
          <option value="delivery_issue">Delivery Issue</option>
          <option value="damaged_package">Damaged Package</option>
          <option value="missing_items">Missing Items</option>
          <option value="billing">Billing Issue</option>
          <option value="refund">Refund Request</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please provide detailed information about your issue"
          rows={5}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (loadingOrders && !deliveryId)}
        className="w-full bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Creating Ticket...
          </>
        ) : (
          'Create Support Ticket'
        )}
      </button>
    </form>
  );
}
