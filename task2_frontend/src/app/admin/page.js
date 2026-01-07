"use client";
import { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [starFilter, setStarFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const fetchReviews = async () => {
      try {
          setError(null);
          const res = await fetch(`${API_URL}/reviews/`);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          // Sort by newest first
          data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setReviews(data);
      } catch (error) {
          console.error("Failed to fetch reviews:", error);
          setError("Failed to connect to backend server. Is it running?");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    // Initial fetch for existing data
    fetchReviews();

    // Setup Server-Sent Events (SSE) for real-time updates
    const eventSource = new EventSource(`${API_URL}/reviews/events`);

    eventSource.onmessage = (event) => {
      try {
        const newReview = JSON.parse(event.data);
        setReviews((prevReviews) => {
          // Check if review already exists to avoid duplicates (optional safety)
          if (prevReviews.some(r => r.id === newReview.id)) return prevReviews;
          // Prepend new review
          return [newReview, ...prevReviews];
        });
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      // EventSource automatically attempts to reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Filter Logic
  const filteredReviews = reviews.filter(review => {
      const matchStars = starFilter === 'all' || review.stars === parseInt(starFilter);
      const matchSearch = review.business_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStars && matchSearch;
  });

  // Analytics Data Preparation
  const starDistributionData = useMemo(() => {
    return [1, 2, 3, 4, 5].map(star => ({
      name: `${star} ★`,
      count: reviews.filter(r => r.stars === star).length,
      fill: star <= 2 ? '#EF4444' : star === 3 ? '#F59E0B' : '#10B981'
    }));
  }, [reviews]);

  const timelineData = useMemo(() => {
    // Pie Chart Data: High vs Low Rated
    const lowRated = reviews.filter(r => r.stars <= 3).length;
    const highRated = reviews.filter(r => r.stars > 3).length;
    
    return [
        { name: 'Needs Attention (≤3★)', value: lowRated, color: '#EF4444' }, // Red
        { name: 'Satisfied (>3★)', value: highRated, color: '#10B981' }      // Green
    ];
  }, [reviews]);

  if (loading && reviews.length === 0) return <div className="p-8 text-center text-gray-600">Loading Dashboard...</div>;

  if (error && reviews.length === 0) return (
    <div className="p-8 text-center text-red-600">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <p>{error}</p>
      <button 
        onClick={fetchReviews}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar - Analytics */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 fixed h-full overflow-y-auto z-10 hidden md:block">
        <div className="p-6">
            <h2 className="text-2xl font-bold text-indigo-600 mb-8">Admin Panel</h2>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Analytics</h3>
                    
                    {/* Stat: Total Reviews */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
                        <dt className="text-xs font-medium text-gray-500 truncate">Total Reviews</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">{reviews.length}</dd>
                    </div>

                    {/* Stat: Average Rating */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
                        <dt className="text-xs font-medium text-gray-500 truncate">Avg Rating</dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                            {(reviews.reduce((acc, r) => acc + r.stars, 0) / (reviews.length || 1)).toFixed(1)} 
                            <span className="text-xs text-gray-400 ml-1">/ 5.0</span>
                        </dd>
                    </div>

                    {/* Stat: Sentiment Pie Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sentiment</dt>
                        <div className="h-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={timelineData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={50}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {timelineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs space-y-1 mt-2">
                            {timelineData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="flex items-center text-gray-600">
                                        <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: entry.color}}></span>
                                        {index === 0 ? 'Low Rated' : 'High Rated'}
                                    </span>
                                    <span className="font-bold">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stat: Rating Spread */}
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm mt-6">
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={starDistributionData} margin={{top:0, bottom:0, left:-20, right:0}}>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                                    <YAxis hide />
                                    <RechartsTooltip 
                                        contentStyle={{ fontSize: '12px', padding: '4px' }}
                                        cursor={{fill: 'transparent'}}
                                    />
                                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                        {starDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h1>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="w-full md:w-1/2 relative">
                  <input 
                    type="text" 
                    placeholder="Search business name..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Search Icon */}
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
              </div>

              {/* Star Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Filter by Stars:</span>
                  <select 
                    value={starFilter} 
                    onChange={(e) => setStarFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                      <option value="all">All Stars</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                  </select>
              </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Results ({filteredReviews.length})</h3>
             </div>
             <ul className="divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <li key={review.id} className="p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                              <h3 className="text-lg font-medium text-indigo-600">{review.business_name}</h3>
                              <div className="flex items-center mt-1">
                                <div className="flex text-yellow-400">
                                    {'★'.repeat(review.stars)}
                                    <span className="text-gray-200">{'★'.repeat(5 - review.stars)}</span>
                                </div>
                                <span className="ml-2 text-sm text-gray-500">{new Date(review.created_at).toLocaleString()}</span>
                              </div>
                          </div>
                      </div>
                      
                      <p className="text-base text-gray-800">"{review.text}"</p>
                        
                      {/* AI Insights Section */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Summary</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{review.sentiment_analysis || 'Processing...'}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Recommended Action</h4>
                                <p className="text-sm text-green-900 leading-relaxed">{review.recommended_action || 'Processing...'}</p>
                            </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
            {filteredReviews.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No reviews found</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
