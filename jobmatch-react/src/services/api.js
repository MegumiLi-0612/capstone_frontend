// src/services/api.js
import axios from 'axios';
import { currentConfig } from '../config/config';

// API 基础 URL
const API_BASE_URL = currentConfig.API_BASE_URL;
// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Job APIs
export const jobAPI = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: () => api.get('/jobs/employer/my-jobs')
};

// Application APIs
export const applicationAPI = {
  submitApplication: (data) => {
    // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
    const config = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': undefined // 移除默认的 Content-Type
      };
    }
    return api.post('/applications', data, config);
  },
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status) => api.patch(`/applications/${id}/status`, { status })
};

// Upload APIs
export const uploadAPI = {
  downloadResume: (filename) => api.get(`/upload/resume/${filename}`, { responseType: 'blob' })
};

// Task APIs
export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleTask: (id) => api.patch(`/tasks/${id}/toggle`)
};


export default api;