import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ReportViewer() {
  const [report, setReport] = useState<{ id: number, generated_at: string, markdown_report: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchLatestReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/report/latest`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/report/generate`);
      setReport(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Priority Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchLatestReport}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={generateNewReport}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate New Report'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading...</p>
      ) : report ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Generated: {new Date(report.generated_at).toLocaleString()}
          </p>
          <div className="prose max-w-none">
            <ReactMarkdown>{report.markdown_report}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <p className="text-center py-8 text-gray-500">
          No reports available. Click &quot;Generate New Report&quot; to create one.
        </p>
      )}
    </div>
  );
}
