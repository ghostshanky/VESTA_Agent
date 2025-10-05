"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface FeedbackItem {
  id: number;
  text: string;
  sentiment: string;
  theme: string;
  summary: string;
  urgency: number;
  impact: number;
  priority_score: number;
  created_at: string;
}

interface FeedbackTableProps {
  feedback: FeedbackItem[];
  onDelete: (id: number) => void;
}

const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedback, onDelete }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof FeedbackItem | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
      case "neutral":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
    }
  };

  const getThemeColor = (theme: string) => {
    const colors = {
      "Feature Request": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
      "Bug Report": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
      "UX Issue": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
      "Performance": "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
      "Pricing": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
      "Support": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
      "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200",
    };
    return colors[theme as keyof typeof colors] || colors.Other;
  };

  const sortedFeedback = useMemo(() => {
    if (!sortConfig.key) return feedback;

    const sorted = [...feedback].sort((a, b) => {
      const key = sortConfig.key!;
      let aValue = a[key];
      let bValue = b[key];

      // Handle undefined or null values
      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      // For string comparison, case insensitive
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [feedback, sortConfig]);

  const requestSort = (key: keyof FeedbackItem) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof FeedbackItem) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 dark:border-white/10">
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Feedback Analysis</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">Feedback</th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white cursor-pointer select-none"
                onClick={() => requestSort("sentiment")}
              >
                Sentiment {getSortIndicator("sentiment")}
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white cursor-pointer select-none"
                onClick={() => requestSort("theme")}
              >
                Theme {getSortIndicator("theme")}
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white cursor-pointer select-none"
                onClick={() => requestSort("urgency")}
              >
                Urgency {getSortIndicator("urgency")}
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white cursor-pointer select-none"
                onClick={() => requestSort("impact")}
              >
                Impact {getSortIndicator("impact")}
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white cursor-pointer select-none"
                onClick={() => requestSort("priority_score")}
              >
                Priority {getSortIndicator("priority_score")}
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedFeedback.map((item, index) => (
              <motion.tr
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200"
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium whitespace-pre-wrap break-words" title={item.text}>
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {item.summary || "Processing..."}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment || "unknown")}`}>
                    {item.sentiment || "Processing..."}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThemeColor(item.theme || "Other")}`}>
                    {item.theme || "Processing..."}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      {item.urgency || "?"}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                      {item.impact || "?"}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                      {item.priority_score ? item.priority_score.toFixed(1) : "?"}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 font-semibold"
                    aria-label={`Delete feedback ${item.id}`}
                  >
                    Remove
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {feedback.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">No feedback data available yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Submit some feedback to see the analysis.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackTable;
