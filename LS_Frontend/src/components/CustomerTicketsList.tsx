import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const CustomerTicketsList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        'http://localhost:8000/api/support/tickets/',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setTickets(response.data.tickets);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
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

  const filteredTickets = filter
    ? tickets.filter(t => t.status === filter)
    : tickets;

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading your support tickets...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">My Support Tickets</h2>

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

      {filteredTickets.length === 0 ? (
        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
          <p>No support tickets found</p>
          <Link to="/support/new" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
            Create your first ticket
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-200 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{ticket.subject}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{ticket.category}</td>
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
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/support/tickets/${ticket.id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerTicketsList;
