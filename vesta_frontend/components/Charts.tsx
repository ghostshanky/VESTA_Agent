"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ResponsiveContainer } from "recharts";
import { useTheme } from "./ThemeProvider";

interface FeedbackItem {
  id: number;
  text: string;
  sentiment: string;
  theme: string;
  summary: string;
  urgency: number;
  impact: number;
  priority_score: number;
}

interface ChartsProps {
  feedback: FeedbackItem[];
}

const Charts: React.FC<ChartsProps> = ({ feedback }) => {
  const { theme } = useTheme();

  const priorityData = feedback.reduce((acc, item) => {
    const theme = item.theme;
    const existing = acc.find(d => d.theme === theme);
    if (existing) {
      existing.count += 1;
      existing.avgPriority = (existing.avgPriority * (existing.count - 1) + item.priority_score) / existing.count;
    } else {
      acc.push({ theme, count: 1, avgPriority: item.priority_score });
    }
    return acc;
  }, [] as { theme: string; count: number; avgPriority: number }[]);

  const scatterData = feedback.map(item => ({
    urgency: item.urgency,
    impact: item.impact,
    theme: item.theme,
    priority: item.priority_score,
  }));

  const chartColors = theme === "dark"
    ? { primary: "rgb(96 165 250)", secondary: "rgb(129 140 248)", grid: "rgb(55 65 81)", text: "rgb(249 250 251)" }
    : { primary: "rgb(59 130 246)", secondary: "rgb(139 92 246)", grid: "rgb(229 231 235)", text: "rgb(55 65 81)" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-light-card dark:bg-dark-card backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-light-border dark:border-dark-border">
        <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Priority Distribution by Theme</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis
              dataKey="theme"
              stroke={chartColors.text}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              label={{ value: 'Feedback Theme', position: 'insideBottom', offset: 10, style: { textAnchor: 'middle', fill: chartColors.text } }}
            />
            <YAxis
              stroke={chartColors.text}
              label={{ value: 'Number of Feedback Items', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: chartColors.text } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "rgb(31 41 55)" : "rgb(255 255 255)",
                border: `1px solid ${chartColors.grid}`,
                borderRadius: "8px",
              }}
              formatter={(value, name) => [`${value} items`, 'Feedback Count']}
              labelFormatter={(label) => `Theme: ${label}`}
            />
            <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} name="Feedback Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-light-card dark:bg-dark-card backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-light-border dark:border-dark-border">
        <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Urgency vs Impact Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart data={scatterData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis
              type="number"
              dataKey="urgency"
              name="Urgency"
              height={80}
              domain={[0, 10]}
              stroke={chartColors.text}
              label={{ value: 'Urgency Level (1-10)', position: 'insideBottom',  style: { textAnchor: 'middle', fill: chartColors.text } }}
            />
            <YAxis
              type="number"
              dataKey="impact"
              name="Impact"
              domain={[0, 10]}
              stroke={chartColors.text}
              label={{ value: 'Impact Level (1-10)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: chartColors.text } }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: theme === "dark" ? "rgb(31 41 55)" : "rgb(255 255 255)",
                border: `1px solid ${chartColors.grid}`,
                borderRadius: "8px",
              }}
              formatter={(value, name) => [`${value}/10`, name]}
              labelFormatter={(label) => `Feedback Item`}
            />
            <Scatter dataKey="impact" fill={chartColors.secondary} name="Impact" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;