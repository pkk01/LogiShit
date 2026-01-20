import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { apiUrl } from '../utils/apiBase';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const SupportFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const url = selectedCategory
        ? `${apiUrl('/support/faq/')}?category=${selectedCategory}`
        : apiUrl('/support/faq/');

      const response = await axios.get(url);
      setFaqs(response.data.faqs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Damaged', 'Lost', 'Late', 'Quality', 'Other'];

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory]);

  if (loading) {
    return <div className="text-center py-8 text-slate-600 dark:text-slate-400">Loading FAQs...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">FAQ & Knowledge Base</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Find answers to common questions</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === ''
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3">
          {faqs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center text-slate-500 dark:text-slate-400">
              <p>No FAQs found for this category</p>
            </div>
          ) : (
            faqs.map(faq => (
              <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{faq.question}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  <span className={`ml-4 text-2xl text-slate-400 dark:text-slate-500 transition ${
                    expandedId === faq.id ? 'rotate-45' : ''
                  }`}>
                    +
                  </span>
                </button>

                {expandedId === faq.id && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Support CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-lg shadow-md p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Couldn't find what you're looking for?</h3>
          <p className="mb-4">Our support agents are here to help you. Create a support ticket now.</p>
          <a
            href="/support"
            className="inline-block bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Create Support Ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportFAQ;
