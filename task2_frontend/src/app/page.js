"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [formData, setFormData] = useState({
    business_name: '',
    stars: 5,
    text: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    setAiResponse(null);

    // Ensure no double slashes if the env var has a trailing slash
    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const API_URL = envUrl.replace(/\/$/, '');

    try {
      const res = await fetch(`${API_URL}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      const data = await res.json();
      setStatus({ type: 'success', message: 'Review submitted successfully!' });
      
      if (data.sentiment_analysis) {
          setAiResponse({
              summary: data.sentiment_analysis,
              action: data.recommended_action
          });
      }
      
      setFormData({ business_name: '', stars: 5, text: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex justify-end mb-4">
        <Link href="/admin" className="text-sm text-indigo-600 hover:text-indigo-800">
          Go to Admin Dashboard →
        </Link>
      </div>
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Submit a Review</h2>
        
        {status.message && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="e.g. Joe's Pizza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex space-x-4 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, stars: star })}
                  className={`text-2xl focus:outline-none ${formData.stars >= star ? 'text-yellow-400' : 'text-gray-300 transform hover:scale-110'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Review</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Share your experience..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {aiResponse && (
            <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Our AI Response</h3>
                <div className="bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800">
                    <p><strong>Summary:</strong> {aiResponse.summary}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
