'use client';

import { useState, useEffect } from 'react';
import FeedbackTable from '@/components/FeedbackTable';
import PriorityChart from '@/components/PriorityChart';
import FeedbackForm from '@/components/FeedbackForm';
import ReportViewer from '@/components/ReportViewer';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgUrgency: 0, avgImpact: 0 });

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/feedback/`);
      setFeedbackData(response.data);
      
      const total = response.data.length;
      const avgUrgency = response.data.reduce((sum: number, item: any) => sum + (item.urgency || 0), 0) / total || 0;
      const avgImpact = response.data.reduce((sum: number, item: any) => sum + (item.impact || 0), 0) / total || 0;
      
      setStats({ total, avgUrgency: avgUrgency.toFixed(1), avgImpact: avgImpact.toFixed(1) });
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Customer Feedback Prioritizer</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-2 rounded-md ${activeTab === 'submit' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 rounded-md ${activeTab === 'report' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Feedback</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Avg Urgency</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgUrgency}/10</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Avg Impact</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgImpact}/10</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Urgency vs Impact Analysis</h2>
              <PriorityChart data={feedbackData} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">All Feedback</h2>
                <button
                  onClick={fetchFeedback}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : (
                <FeedbackTable data={feedbackData} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <FeedbackForm onSuccess={fetchFeedback} />
        )}

        {activeTab === 'report' && (
          <ReportViewer />
        )}
      </main>
    </div>
  );
}
