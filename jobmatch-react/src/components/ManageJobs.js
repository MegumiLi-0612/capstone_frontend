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
  return `${y}-${m}-${day}`; // 用于比较
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
        // 后端返回在 data.data 下
        const serverJobs = Array.isArray(data?.data) ? data.data : [];
        // 为图表提供安全占位，避免空数据时报错
        const defaultPie = {
          labels: ['Bachelor', 'Master', 'PhD'],
          datasets: [{ data: [0, 0, 0], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
        };
        const defaultLine = {
          labels: [],
          datasets: [{ label: 'Applications/Day', data: [], borderColor: '#36A2EB', fill: false }],
        };
        // 补充每个职位近7天的申请趋势
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
        // 后端删除为软删除（isActive=false），前端默认不展示停用岗位
        setJobs(jobsWithTrends.filter(j => j.isActive));
      } catch (err) {
        setError('加载岗位数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerJobs();
  }, []);

  const handleDelete = async (jobId) => {
    const confirm = window.confirm('确认删除该岗位吗？');
    if (!confirm) return;
    try {
      setDeletingId(jobId);
      await jobAPI.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      alert('删除成功');
    } catch (e) {
      const backendMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message || '未知错误';
      alert(`删除失败：${backendMsg}`);
      console.error('Delete job error:', e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">加载中...</div>
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
          {/* 左侧职位信息 */}
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
                {deletingId === job.id ? '删除中...' : '删除'}
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

          {/* 中间饼图 */}
          <div className="chart-section">
            <h4 className="text-sm font-semibold mb-2 text-center">Education Distribution</h4>
            
            <div className="chart-container">
              <Pie data={job.educationData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* 右侧折线图 */}
          <div className="chart-section">
            <h4 className="text-sm font-semibold mb-2 text-center">Applications Over Time</h4>
            <div className="chart-container">
              <Line data={job.applicationTrends} options={{ maintainAspectRatio: false }} />
            </div>
            {!(job.applicationTrends?.datasets?.[0]?.data || []).some(v => v > 0) && (
              <div className="text-center text-gray-500 text-sm mt-2">暂无数据</div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};

export default ManageJobs;
