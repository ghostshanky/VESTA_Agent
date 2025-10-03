import { useState } from 'react';

interface Feedback {
  id: number;
  text: string;
  sentiment?: string;
  theme?: string;
  urgency?: number;
  impact?: number;
  priority_score?: number;
  created_at: string;
}

export default function FeedbackTable({ data }: { data: Feedback[] }) {
  const [sortField, setSortField] = useState<string>('priority_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = (a as any)[sortField] || 0;
    const bValue = (b as any)[sortField] || 0;
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feedback
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('sentiment')}
            >
              Sentiment {sortField === 'sentiment' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('theme')}
            >
              Theme {sortField === 'theme' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('urgency')}
            >
              Urgency {sortField === 'urgency' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('impact')}
            >
              Impact {sortField === 'impact' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('priority_score')}
            >
              Priority {sortField === 'priority_score' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {item.text}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {item.theme || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {item.urgency ? `${item.urgency}/10` : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {item.impact ? `${item.impact}/10` : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                {item.priority_score ? item.priority_score.toFixed(2) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
