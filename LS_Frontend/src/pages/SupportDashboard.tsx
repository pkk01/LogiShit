import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerTicketsList from '../components/CustomerTicketsList';
import SupportTicketForm from '../components/SupportTicketForm';

const SupportDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new'>('tickets');
  const [showForm, setShowForm] = useState(false);
  const [ticketsRefresh, setTicketsRefresh] = useState(0);
  const navigate = useNavigate();

  const handleTicketCreated = () => {
    setShowForm(false);
    setActiveTab('tickets');
    setTicketsRefresh(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Customer Support</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your support tickets and get help</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'tickets'
                ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'new'
                ? 'bg-indigo-600 dark:bg-indigo-700 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Create New Ticket
          </button>
          <button
            onClick={() => navigate('/support/faq')}
            className="px-6 py-3 rounded-lg font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            FAQ & Knowledge Base
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'tickets' && (
            <div key={ticketsRefresh}>
              <CustomerTicketsList />
            </div>
          )}

          {activeTab === 'new' && (
            <SupportTicketForm onTicketCreated={handleTicketCreated} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
