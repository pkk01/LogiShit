import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface AdminTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  customer_name: string;
  agent_name: string;
  created_at: string;
  updated_at: string;
}

interface SupportAgent {
  id: string;
  name: string;
}

const AdminSupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');

  useEffect(() => {
    fetchAllTickets();
    fetchSupportAgents();
  }, [filter]);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const url = filter
        ? `http://localhost:8000/api/admin/support/tickets/?status=${filter}`
        : 'http://localhost:8000/api/admin/support/tickets/';

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setTickets(response.data.tickets);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportAgents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/admin/support-agents/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setAgents(response.data.agents || []);
    } catch (err: any) {
      console.error('Failed to fetch support agents');
    }
  };

  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      setAssigningTicket(ticketId);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://localhost:8000/api/support/tickets/${ticketId}/reassign/`,
        { agent_id: agentId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setShowAssignModal(false);
      setSelectedTicketId('');
      fetchAllTickets(); // Refresh tickets
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign ticket');
    } finally {
      setAssigningTicket(null);
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

  const getUnassignedCount = () => {
    return tickets.filter(t => t.agent_name === 'Unassigned').length;
  };

  if (loading) {
    return <div className="text-center py-8">Loading support tickets...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Support Ticket Management</h2>
          <p className="text-gray-600 mt-2">Manage all customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm">Open</p>
            <p className="text-3xl font-bold text-blue-600">{tickets.filter(t => t.status === 'Open').length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4 border-l-4 border-yellow-600">
            <p className="text-gray-600 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'In Progress').length}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm">Unassigned</p>
            <p className="text-3xl font-bold text-red-600">{getUnassignedCount()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              All Tickets
            </button>
            {['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800 font-medium">{ticket.subject}</td>
                      <td className="px-6 py-4 text-gray-600">{ticket.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ticket.customer_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          ticket.agent_name === 'Unassigned'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {ticket.agent_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/support/tickets/${ticket.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View
                          </Link>
                          {ticket.agent_name === 'Unassigned' && (
                            <button
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setShowAssignModal(true);
                              }}
                              className="text-green-600 hover:underline font-medium"
                              disabled={assigningTicket === ticket.id}
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Ticket to Agent</h3>
            
            {agents.length === 0 ? (
              <p className="text-gray-600 mb-4">No support agents available</p>
            ) : (
              <div className="space-y-2 mb-6">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAssignTicket(selectedTicketId, agent.id)}
                    disabled={assigningTicket === selectedTicketId}
                    className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
                  >
                    <p className="font-medium text-gray-800">{agent.name}</p>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTicketId('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportManagement;
