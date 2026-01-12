import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateFormat';

interface AdminTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  customer_name: string;
  agent_name: string;
  delivery_info?: {
    id: string;
    tracking_number: string;
    package_type: string;
  };
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
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringTicket, setTransferringTicket] = useState<string | null>(null);

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

  const handleTransferTicket = async (ticketId: string, agentId: string) => {
    try {
      setTransferringTicket(ticketId);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://localhost:8000/api/support/tickets/${ticketId}/transfer/`,
        { agent_id: agentId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setShowTransferModal(false);
      setSelectedTicketId('');
      fetchAllTickets(); // Refresh tickets
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to transfer ticket');
    } finally {
      setTransferringTicket(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'In Progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'On Hold':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'Resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Closed':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getUnassignedCount = () => {
    return tickets.filter(t => t.agent_name === 'Unassigned').length;
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading support tickets...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Support Ticket Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage all customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Total Tickets</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{tickets.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-4 border-l-4 border-blue-600">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Open</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tickets.filter(t => t.status === 'Open').length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-md p-4 border-l-4 border-yellow-600">
            <p className="text-slate-600 dark:text-slate-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{tickets.filter(t => t.status === 'In Progress').length}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-4 border-l-4 border-red-600">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Unassigned</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{getUnassignedCount()}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === '' ? 'bg-indigo-600 dark:bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              All Tickets
            </button>
            {['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === status ? 'bg-indigo-600 dark:bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Subject</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Order ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Priority</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Agent</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Created</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-3 py-2 text-slate-800 dark:text-slate-200 text-sm font-medium max-w-xs truncate">{ticket.subject}</td>
                      <td className="px-3 py-2 text-sm">
                        {ticket.delivery_info ? (
                          <div>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{ticket.delivery_info.id.substring(0, 8)}...</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ticket.delivery_info.tracking_number}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">No order</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-sm">{ticket.category}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`font-medium text-sm ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">{ticket.customer_name}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          ticket.agent_name === 'Unassigned'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {ticket.agent_name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 flex-nowrap">
                          <Link
                            to={`/support/tickets/${ticket.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm whitespace-nowrap"
                          >
                            View
                          </Link>
                          {ticket.agent_name === 'Unassigned' && (
                            <button
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setShowAssignModal(true);
                              }}
                              className="text-green-600 dark:text-green-400 hover:underline font-medium text-sm whitespace-nowrap"
                              disabled={assigningTicket === ticket.id}
                            >
                              Assign
                            </button>
                          )}
                          {ticket.agent_name !== 'Unassigned' && ticket.status !== 'Closed' && (
                            <button
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setShowTransferModal(true);
                              }}
                              className="text-orange-600 dark:text-orange-400 hover:underline font-medium text-sm whitespace-nowrap"
                              disabled={transferringTicket === ticket.id}
                            >
                              Transfer
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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Assign Ticket to Agent</h3>
            
            {agents.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 mb-4">No support agents available</p>
            ) : (
              <div className="space-y-2 mb-6">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleAssignTicket(selectedTicketId, agent.id)}
                    disabled={assigningTicket === selectedTicketId}
                    className="w-full p-3 text-left border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-500 dark:hover:border-indigo-400 transition text-slate-800 dark:text-slate-200"
                  >
                    <p className="font-medium">{agent.name}</p>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTicketId('');
              }}
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transfer Ticket to Another Agent</h3>
            
            {agents.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400 mb-4">No support agents available</p>
            ) : (
              <div className="space-y-2 mb-6">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => handleTransferTicket(selectedTicketId, agent.id)}
                    disabled={transferringTicket === selectedTicketId}
                    className="w-full p-3 text-left border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 dark:hover:border-orange-400 transition text-slate-800 dark:text-slate-200"
                  >
                    <p className="font-medium">{agent.name}</p>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => {
                setShowTransferModal(false);
                setSelectedTicketId('');
              }}
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium"
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
