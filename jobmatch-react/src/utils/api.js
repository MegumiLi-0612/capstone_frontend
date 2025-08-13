import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock Jobs API
const mockJobsAPI = {
  // Get all jobs
  getAllJobs: async () => {
    try {
      // Using fetch API as example
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const data = await response.json();
      
      // Transform data to job format
      return data.slice(0, 10).map(post => ({
        id: post.id,
        title: `Part-time Job ${post.id}`,
        company: `Company ${post.id}`,
        location: 'University Area',
        hourlyRate: 15 + (post.id % 10),
        schedule: 'Flexible',
        description: post.body,
        requirements: ['Flexible hours', 'Responsible', 'Eager to learn'],
        postedDate: new Date().toISOString(),
        employerId: post.userId
      }));
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      return [];
    }
  },

  // Get single job detail
  getJobById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return {
        id: response.data.id,
        title: `Part-time Job ${response.data.id}`,
        company: `Company ${response.data.id}`,
        location: 'University Area',
        hourlyRate: 15 + (response.data.id % 10),
        schedule: 'Flexible',
        description: response.data.body,
        requirements: ['Flexible hours', 'Responsible', 'Eager to learn'],
        postedDate: new Date().toISOString(),
        employerId: response.data.userId
      };
    } catch (error) {
      console.error('Failed to fetch job detail:', error);
      return null;
    }
  },

  // Create job application
  createApplication: async (jobId, studentData) => {
    try {
      const response = await api.post('/posts', {
        title: `Application for Job ${jobId}`,
        body: `Student application: ${JSON.stringify(studentData)}`,
        userId: 1
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw error;
    }
  },

  // Create new job
  createJob: async (jobData) => {
    try {
      const response = await api.post('/posts', {
        title: jobData.title,
        body: JSON.stringify(jobData),
        userId: 1
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  }
};

// User API
const userAPI = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
};

// Export all APIs
export { mockJobsAPI, userAPI };
export default api;