"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, BarChart3, RefreshCw, User } from "lucide-react";
import axios from "axios";
import { ThemeProvider } from "@/components/ThemeProvider";
import Toggle from "@/components/Toggle";
import FeedbackTable from "@/components/FeedbackTable";
import Charts from "@/components/Charts";
import ReportPreview from "@/components/ReportPreview";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vesta-agent.onrender.com";

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

function DashboardContent() {
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const [activeTab, setActiveTab] = useState("dashboard");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ text: "", source: "web" });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/feedback/`);
      setFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      setIsGenerating(true);
      const response = await axios.post(`${API_URL}/report/generate`);
      const reportResponse = await axios.get(`${API_URL}/report/latest`);
      setReport(reportResponse.data.markdown_report);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLatestReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/report/latest`);
      setReport(response.data.markdown_report);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching latest report:", error);
      }
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.text.trim()) return;

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/feedback/`, newFeedback);
      setNewFeedback({ text: "", source: "web" });
      await fetchFeedback();
      if (feedback.length + 1 >= 4) {
        await fetchReport();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFeedback = async (feedbackId: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await axios.delete(`${API_URL}/feedback/${feedbackId}`);
      await fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };
  
  const submitCsv = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first.");
      return;
    }

    setCsvUploading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await axios.post(`${API_URL}/feedback/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      setCsvFile(null);
      await fetchFeedback();
    } catch (error) {
      alert("Error uploading CSV file");
      console.error(error);
    } finally {
      setCsvUploading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      setEmailMessage('Please enter a valid email address.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/report/send-to-email`, { email });
      setEmailMessage('Email sent successfully');
    } catch (error) {
      setEmailMessage('Failed to send email');
    }
  };

  useEffect(() => {
    fetchFeedback();
    getLatestReport();
  }, []);

  const stats = {
    total: feedback.length,
    avgUrgency: feedback.length > 0 ? feedback.reduce((sum, item) => sum + item.urgency, 0) / feedback.length : 0,
    avgImpact: feedback.length > 0 ? feedback.reduce((sum, item) => sum + item.impact, 0) / feedback.length : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 backdrop-blur-lg bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <img src="/VESTAicon.svg" alt="VESTA Logo" className="h-8 w-8" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                VESTA - an AI Feedback Prioritizer
              </h1>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{mode === 'admin' ? 'Admin' : 'User'}</span>
              </motion.div>
              <motion.button
                onClick={() => setMode(mode === 'admin' ? 'user' : 'admin')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Switch to {mode === 'admin' ? 'User' : 'Admin'}
              </motion.button>
              <Toggle />
            </div>
          </div>
        </div>
      </motion.header>

      {mode === 'admin' && (
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10 backdrop-blur-lg bg-white/5 dark:bg-black/5 border-b border-white/10 dark:border-white/5"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 py-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "upload", label: "Upload Feedback", icon: Upload },
                { id: "reports", label: "Reports", icon: FileText },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-black/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.nav>
      )}

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {(() => {
          if (mode === 'user') {
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Submit New Feedback</h2>
                  <form onSubmit={submitFeedback} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback Text
                      </label>
                      <textarea
                        value={newFeedback.text}
                        onChange={(e) => setNewFeedback({ ...newFeedback, text: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        rows={4}
                        placeholder="Enter your feedback here..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Source
                      </label>
                      <select
                        value={newFeedback.source}
                        onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value })}
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      >
                        <option value="web">Web</option>
                        <option value="email">Email</option>
                        <option value="survey">Survey</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            );
          }
          return (
            <React.Fragment>
              {activeTab === "dashboard" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Total Feedback", value: stats.total, color: "from-blue-500 to-cyan-500" },
                      { label: "Avg Urgency", value: `${stats.avgUrgency.toFixed(1)}/10`, color: "from-yellow-500 to-orange-500" },
                      { label: "Avg Impact", value: `${stats.avgImpact.toFixed(1)}/10`, color: "from-green-500 to-emerald-500" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className={`bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300`}
                      >
                        <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <Charts feedback={feedback} />

                  <FeedbackTable feedback={feedback} onDelete={deleteFeedback} />

                  {report && <ReportPreview report={report} />}
                </motion.div>
              )}

              {activeTab === "upload" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl mx-auto space-y-8"
                >
                  <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Submit New Feedback</h2>
                    <form onSubmit={submitFeedback} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Feedback Text
                        </label>
                        <textarea
                          value={newFeedback.text}
                          onChange={(e) => setNewFeedback({ ...newFeedback, text: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          rows={4}
                          placeholder="Enter your feedback here..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Source
                        </label>
                        <select
                          value={newFeedback.source}
                          onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value })}
                          className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                        >
                          <option value="web">Web</option>
                          <option value="email">Email</option>
                          <option value="survey">Survey</option>
                          <option value="support">Support</option>
                        </select>
                      </div>
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                      </motion.button>
                    </form>
                  </div>

                  <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Upload Feedback CSV</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select CSV File
                        </label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                        />
                      </div>
                      <motion.button
                        onClick={submitCsv}
                        disabled={!csvFile || csvUploading}
                        className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {csvUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Submit CSV
                          </>
                        )}
                      </motion.button>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      {csvFile ? `File selected: ${csvFile.name}` : `No file selected.`}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      CSV format: <code>text</code> (required), <code>source</code> (optional, e.g., web, email, survey, support)
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "reports" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Priority Reports</h2>
                    <motion.button
                      onClick={fetchReport}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Generate Report
                        </>
                      )}
                    </motion.button>
                  </div>

                  {report ? (
                    <>
                      <ReportPreview report={report} />
                      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 dark:border-white/10">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Send Report via Email</h3>
                        <div className="space-y-4">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          <motion.button
                            onClick={handleSendEmail}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Send Email
                          </motion.button>
                          {emailMessage && (
                            <p className={`text-sm ${emailMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {emailMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 dark:border-white/10 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Reports Generated</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Generate a priority report to see insights from your feedback data.</p>
                      <motion.button
                        onClick={fetchReport}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Generate First Report
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </React.Fragment>
          );
        })()}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}