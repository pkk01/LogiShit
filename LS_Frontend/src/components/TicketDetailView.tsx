import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatDateTime } from '../utils/dateFormat';

interface DeliveryDetails {
  id: string;
  tracking_number: string;
  package_type: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  weight?: string;
  distance?: string;
  price?: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  agent_id?: string;
  agent_name?: string;
  customer_id: string;
  customer_name?: string;
  delivery_id?: string;
  delivery_details?: DeliveryDetails;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface InternalNote {
  id: string;
  agent_id: string;
  agent_name: string;
  note: string;
  created_at: string;
}

const TicketDetailView: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('user_id');
    setUserRole(role || 'user');
    setUserId(id || '');
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://localhost:8000/api/support/tickets/${ticketId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setTicket(response.data.ticket);
      setInternalNotes(response.data.internal_notes || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const addInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://localhost:8000/api/support/tickets/${ticketId}/add-note/`,
        { note: newNote },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      setInternalNotes([...internalNotes, response.data.note]);
      setNewNote('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;
    if (ticket.status !== 'Resolved') {
      setError('Only resolved tickets can be closed');
      return;
    }

    try {
      setClosingTicket(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://localhost:8000/api/support/tickets/${ticketId}/close/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      fetchTicketDetails(); // Refresh to show updated status
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to close ticket');
    } finally {
      setClosingTicket(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('access_token');
      await axios.put(
        `http://localhost:8000/api/support/tickets/${ticketId}/update-status/`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      fetchTicketDetails(); // Refresh to show updated status
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Ticket not found</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{ticket.subject}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Ticket ID: {ticket.id}</p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-2 rounded-full text-white font-medium ${
            ticket.status === 'Open' ? 'bg-blue-600 dark:bg-blue-700' :
            ticket.status === 'In Progress' ? 'bg-yellow-600 dark:bg-yellow-700' :
            ticket.status === 'On Hold' ? 'bg-orange-600 dark:bg-orange-700' :
            ticket.status === 'Resolved' ? 'bg-green-600 dark:bg-green-700' :
            'bg-slate-600 dark:bg-slate-700'
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Category</h3>
          <p className="text-lg text-slate-800 dark:text-slate-200">{ticket.category}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Priority</h3>
          <p className={`text-lg font-medium ${
            ticket.priority === 'High' ? 'text-red-600 dark:text-red-400' :
            ticket.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-600 dark:text-green-400'
          }`}>{ticket.priority}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Agent</h3>
          <p className="text-slate-800 dark:text-slate-200">{ticket.agent_name || 'Unassigned'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Customer</h3>
          <p className="text-slate-800 dark:text-slate-200">{ticket.customer_name || 'Unknown'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Created</h3>
          <p className="text-slate-800 dark:text-slate-200">{formatDateTime(ticket.created_at)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Last Updated</h3>
          <p className="text-slate-800 dark:text-slate-200">{formatDateTime(ticket.updated_at)}</p>
        </div>
      </div>

      {/* Order/Product Details - For agents and admins */}
      {(userRole === 'support_agent' || userRole === 'admin') && ticket.delivery_details && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400">📦</span>
            Order/Product Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Order ID</p>
              <p className="text-slate-800 dark:text-slate-200 font-mono text-sm bg-white dark:bg-slate-800 px-3 py-1 rounded">{ticket.delivery_details.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tracking Number</p>
              <p className="text-slate-800 dark:text-slate-200 font-semibold">{ticket.delivery_details.tracking_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Package Type</p>
              <p className="text-slate-800 dark:text-slate-200">{ticket.delivery_details.package_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticket.delivery_details.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                ticket.delivery_details.status === 'In Transit' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
              }`}>
                {ticket.delivery_details.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Pickup Address</p>
              <p className="text-slate-800 dark:text-slate-200 text-sm">{ticket.delivery_details.pickup_address}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Delivery Address</p>
              <p className="text-slate-800 dark:text-slate-200 text-sm">{ticket.delivery_details.delivery_address}</p>
            </div>
            {ticket.delivery_details.weight && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Weight</p>
                <p className="text-slate-800 dark:text-slate-200">{ticket.delivery_details.weight} kg</p>
              </div>
            )}
            {ticket.delivery_details.distance && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Distance</p>
                <p className="text-slate-800 dark:text-slate-200">{ticket.delivery_details.distance} km</p>
              </div>
            )}
            {ticket.delivery_details.price && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Price</p>
                <p className="text-slate-800 dark:text-slate-200">₹{ticket.delivery_details.price}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Buttons - For agents */}
      {userRole === 'support_agent' && ticket.agent_id === userId && (
        <div className="mb-6 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Update Status:</h4>
            <div className="flex flex-wrap gap-2">
              {ticket.status === 'Open' && (
                <button
                  onClick={() => handleUpdateStatus('In Progress')}
                  disabled={updatingStatus}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 text-sm font-medium"
                >
                  {updatingStatus ? 'Updating...' : 'Mark In Progress'}
                </button>
              )}
              {(ticket.status === 'Open' || ticket.status === 'In Progress') && (
                <button
                  onClick={() => handleUpdateStatus('On Hold')}
                  disabled={updatingStatus}
                  className="bg-yellow-600 dark:bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 text-sm font-medium"
                >
                  {updatingStatus ? 'Updating...' : 'Put On Hold'}
                </button>
              )}
              {(ticket.status === 'Open' || ticket.status === 'In Progress' || ticket.status === 'On Hold') && (
                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  disabled={updatingStatus}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 text-sm font-medium"
                >
                  {updatingStatus ? 'Updating...' : 'Mark Resolved'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close Ticket Button - For agents when resolved */}
      {userRole === 'support_agent' && ticket.status === 'Resolved' && (
        <div className="mb-6">
          <button
            onClick={handleCloseTicket}
            disabled={closingTicket}
            className="bg-green-600 dark:bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 font-medium"
          >
            {closingTicket ? 'Closing...' : 'Close Ticket'}
          </button>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Description</h3>
        <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Internal Notes - Only visible to agents and admins */}
      {(userRole === 'support_agent' || userRole === 'admin') && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Internal Notes</h3>
          
          {internalNotes.length > 0 && (
            <div className="mb-4 space-y-3">
              {internalNotes.map(note => (
                <div key={note.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2"><strong>By Agent:</strong> {note.agent_name}</p>
                  <p className="text-slate-700 dark:text-slate-300">{note.note}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{formatDateTime(note.created_at)}</p>
                </div>
              ))}
            </div>
          )}

          {userRole === 'support_agent' && (
            <form onSubmit={addInternalNote} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600"
              >
                {submittingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetailView;
