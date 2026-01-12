import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, Link as LinkIcon, MessageCircle, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormat';

interface AgentTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  customer_name: string;
  customer_id: string;
  delivery_info?: {
    id: string;
    tracking_number: string;
    package_type: string;
  };
  created_at: string;
  updated_at: string;
}

interface AgentProfile {
  name: string;
  email: string;
}

const AgentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    fetchAgentProfile();
    fetchAssignedTickets();
  }, [filter]);

  const fetchAgentProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/api/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const url = filter
        ? `http://localhost:8000/api/agent/tickets/?status=${filter}`
        : 'http://localhost:8000/api/agent/tickets/';

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setTickets(response.data.tickets);
      
      // Calculate stats
      setStats({
        open: response.data.tickets.filter((t: any) => t.status === 'Open').length,
        inProgress: response.data.tickets.filter((t: any) => t.status === 'In Progress').length,
        resolved: response.data.tickets.filter((t: any) => t.status === 'Resolved').length,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUnassignedTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/admin/support/tickets/?status=Open',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setTickets(response.data.tickets.filter((t: any) => !t.agent_id));
      setFilter('unassigned');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch unassigned tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
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
      setError('');
      fetchAssignedTickets(); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to close ticket');
    }
  };



  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading your tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-300 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="w-9 h-9 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold uppercase tracking-wide mb-2">
              Agent workspace
            </div>
            <h1 className="text-4xl font-bold mb-1">Hello, {profile?.name || 'Support Agent'}</h1>
            <p className="text-indigo-100 text-base">Resolve customer inquiries and provide excellent support.</p>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="relative grid sm:grid-cols-3 gap-3 mt-6">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20">
              <AlertCircle className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-100">Open Tickets</p>
              <p className="text-2xl font-bold text-white">{stats.open}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-100">In Progress</p>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-100">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Info Card */}
      {profile && (
        <div className="bg-white rounded-2xl p-7 shadow-lg border border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-slate-500 text-sm font-medium mb-2">Your Profile</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{profile.name}</h2>
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                <span>{profile.email}</span>
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex-shrink-0 border border-indigo-200">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status === filter ? '' : status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No tickets found</p>
          <p className="text-gray-400 text-sm mt-2">Great job! Keep up the good work.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-semibold">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate">{ticket.description.substring(0, 50)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.delivery_info ? (
                        <div>
                          <p className="text-slate-900 font-mono text-xs bg-slate-100 px-2 py-1 rounded">{ticket.delivery_info.id.substring(0, 8)}...</p>
                          <p className="text-xs text-slate-500 mt-1">{ticket.delivery_info.tracking_number}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No order</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{ticket.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-sm ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ticket.customer_name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/support/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" /> View
                        </Link>
                        {ticket.status === 'Resolved' && (
                          <button
                            onClick={() => handleCloseTicket(ticket.id)}
                            className="text-green-600 hover:text-green-700 font-semibold text-sm transition hover:underline"
                            title="Close resolved ticket"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentDashboard;
