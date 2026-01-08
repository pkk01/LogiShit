import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface TicketDetail {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  agent_id?: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface InternalNote {
  id: string;
  agent_id: string;
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
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role || 'user');
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

  if (loading) {
    return <div className="text-center py-8">Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-8 text-red-600">Ticket not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{ticket.subject}</h1>
          <p className="text-gray-600 mt-2">Ticket ID: {ticket.id}</p>
        </div>
        <div className="text-right">
          <span className={`px-4 py-2 rounded-full text-white font-medium ${
            ticket.status === 'Open' ? 'bg-blue-600' :
            ticket.status === 'In Progress' ? 'bg-yellow-600' :
            ticket.status === 'On Hold' ? 'bg-orange-600' :
            ticket.status === 'Resolved' ? 'bg-green-600' :
            'bg-gray-600'
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Category</h3>
          <p className="text-lg text-gray-800">{ticket.category}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Priority</h3>
          <p className={`text-lg font-medium ${
            ticket.priority === 'High' ? 'text-red-600' :
            ticket.priority === 'Medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>{ticket.priority}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Created</h3>
          <p className="text-gray-800">{new Date(ticket.created_at).toLocaleString()}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Last Updated</h3>
          <p className="text-gray-800">{new Date(ticket.updated_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          {ticket.description}
        </p>
      </div>

      {/* Internal Notes - Only visible to agents and admins */}
      {(userRole === 'support_agent' || userRole === 'admin') && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Internal Notes</h3>
          
          {internalNotes.length > 0 && (
            <div className="mb-4 space-y-3">
              {internalNotes.map(note => (
                <div key={note.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">By Agent: {note.agent_id}</p>
                  <p className="text-gray-700">{note.note}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(note.created_at).toLocaleString()}</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
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
