"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface ReportPreviewProps {
  report: string;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ report }) => {
  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Top 5 Priority Report</h3>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-400">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 ml-4 text-gray-600 dark:text-gray-300">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="mb-1">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-800 dark:text-white">
                {children}
              </strong>
            ),
            hr: () => (
              <hr className="border-gray-200 dark:border-gray-700 my-4" />
            ),
          }}
        >
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ReportPreview;