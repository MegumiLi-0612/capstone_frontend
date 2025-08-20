import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { jobAPI, applicationAPI } from '../services/api';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

import '../styles/ManageJobs.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const toDateKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`; // for comparison
};

const getLastNDays = (n) => {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(new Date(d));
  }
  return days;
};

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const { data } = await jobAPI.getEmployerJobs();
        // Backend returns data under data.data
        const serverJobs = Array.isArray(data?.data) ? data.data : [];
        // Provide safe placeholders for charts to avoid errors with empty data
        const defaultPie = {
          labels: ['Bachelor', 'Master', 'PhD'],
          datasets: [{ data: [0, 0, 0], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
        };
        const defaultLine = {
          labels: [],
          datasets: [{ label: 'Applications/Day', data: [], borderColor: '#36A2EB', fill: false }],
        };
        // Add application trends for the last 7 days for each job
        const jobsWithTrends = await Promise.all(
          serverJobs.map(async (j) => {
            try {
              const appsRes = await applicationAPI.getJobApplications(j.id);
              const applications = Array.isArray(appsRes?.data?.data) ? appsRes.data.data : [];

              const last7Days = getLastNDays(7);
              const labelsDisplay = last7Days.map(d => `${d.getMonth() + 1}/${d.getDate()}`);
              const labelKeys = last7Days.map(toDateKey);
              const counts = new Array(last7Days.length).fill(0);

              applications.forEach(app => {
                const key = toDateKey(app.appliedAt);
                const idx = labelKeys.indexOf(key);
                if (idx !== -1) counts[idx] += 1;
              });

              return {
                ...j,
                educationData: defaultPie,
                applicationTrends: {
                  labels: labelsDisplay,
                  datasets: [{ label: 'Applications/Day', data: counts, borderColor: '#36A2EB', fill: false }]
                }
              };
            } catch (e) {
              return {
                ...j,
                educationData: defaultPie,
                applicationTrends: defaultLine
              };
            }
          })
        );
        // Backend deletion is soft delete (isActive=false), frontend doesn't show inactive jobs by default
        setJobs(jobsWithTrends.filter(j => j.isActive));
      } catch (err) {
        setError('Failed to load job data');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerJobs();
  }, []);

  const handleDelete = async (jobId) => {
    const confirm = window.confirm('Are you sure you want to delete this job?');
    if (!confirm) return;
    try {
      setDeletingId(jobId);
      await jobAPI.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      alert('Delete successful');
    } catch (e) {
      const backendMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Unknown error';
      alert(`Delete failed: ${backendMsg}`);
      console.error('Delete job error:', e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Jobs I Posted</h1>

      {jobs.map((job) => (
        <div key={job.id} className="job-card-grid mb-8">
          {/* Left side job information */}
          <div className="job-info">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-blue-800">{job.title}</h3>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}
              >
                {job.isActive ? 'Active' : 'Inactive'}
              </span>
          
            </div>
            <p>📍 Location: {job.location || '-'}</p>
            <p>🧩 Type: {job.type || '-'}</p>
            <p>🗓 Posted: {formatDate(job.postedDate)}</p>
            <p>⏳ Deadline: {formatDate(job.applicationDeadline)}</p>
            <p>📨 Applications: Total {job.totalApplications ?? 0} / Pending {job.pendingApplications ?? 0}</p>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDelete(job.id)}
                disabled={deletingId === job.id}
              >
                {deletingId === job.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {Array.isArray(job.skills) && job.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Middle pie chart */}
          <div className="chart-section">
            <h4 className="text-sm font-semibold mb-2 text-center">Education Distribution</h4>
            
            <div className="chart-container">
              <Pie data={job.educationData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Right side line chart */}
          <div className="chart-section">
            <h4 className="text-sm font-semibold mb-2 text-center">Applications Over Time</h4>
            <div className="chart-container">
              <Line data={job.applicationTrends} options={{ maintainAspectRatio: false }} />
            </div>
            {!(job.applicationTrends?.datasets?.[0]?.data || []).some(v => v > 0) && (
              <div className="text-center text-gray-500 text-sm mt-2">No data available</div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};

export default ManageJobs;
