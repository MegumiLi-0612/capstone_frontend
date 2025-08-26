import React, { useState, useEffect, useCallback } from 'react';
import JobCard from './JobCard';
import { jobAPI } from '../services/api';

function JobShowcase() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    experienceLevel: '',
    search: ''
  });

  // 将fetchJobs移到useEffect之前，并使用useCallback包装
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建查询参数
      const params = {
        page: 1,
        limit: 20
      };
      
      // 只添加非空的过滤器
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.search) params.search = filters.search;
      
      const response = await jobAPI.getAllJobs(params);
      
      if (response.data.success) {
        setJobs(response.data.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.error?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]); // 依赖filters而不是fetchJobs

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId) => {
    console.log(`Applied to job ID: ${jobId}`);
    // 申请后可以重新获取职位列表以更新状态
    // fetchJobs();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({
        ...prev,
        search: e.target.value
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      experienceLevel: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Loading jobs...</h2>
        <div style={{ marginTop: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: '#e74c3c' }}>Error Loading Jobs</h2>
        <p>{error}</p>
        <button 
          onClick={fetchJobs}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2c3e50', 
        marginBottom: '2rem',
        fontSize: '2.5rem'
      }}>
        🚀 Available Job Opportunities
      </h1>
      
      {/* Search and Filter Section */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <input
            type="text"
            placeholder="Search jobs..."
            onKeyPress={handleSearch}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
          
          <select 
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Experience Levels</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
          </select>
          
          <button
            onClick={clearFilters}
            style={{
              padding: '0.75rem',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Clear Filters
          </button>
        </div>
        
        <p style={{ color: '#666', fontSize: '1rem', margin: 0, textAlign: 'center' }}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {jobs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#666' }}>No jobs found</h3>
          <p style={{ marginBottom: '2rem' }}>
            {filters.search || filters.type || filters.experienceLevel 
              ? 'Try adjusting your filters to see more results'
              : 'Check back later for new opportunities!'}
          </p>
          {(filters.search || filters.type || filters.experienceLevel) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={{
                ...job,
                // 确保所有必需的字段都存在
                id: job.id,
                title: job.title || 'Untitled Position',
                company: job.company || 'Unknown Company',
                location: job.location || 'Location TBD',
                type: job.type || job.jobType || 'Full-time',
                workType: job.workType || 'On-site',
                salaryMin: job.salaryMin || null,
                salaryMax: job.salaryMax || null,
                hourlyRate: job.hourlyRate || null,
                experienceLevel: job.experienceLevel || 'Entry Level',
                duration: job.duration || null,
                hoursPerWeek: job.hoursPerWeek || null,
                startDate: job.startDate || null,
                applicationDeadline: job.applicationDeadline || null,
                description: job.description || 'No description available',
                requirements: job.requirements || [],
                skills: job.skills || [],
                benefits: job.benefits || [],
                postedDate: job.postedDate || job.createdAt || new Date().toISOString(),
                hasApplied: job.hasApplied || false
              }} 
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* Load More Button (如果需要的话) */}
      {jobs.length >= 20 && (
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <button
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Load More Jobs
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
          💡 Job Search Tips
        </h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          color: '#666',
          lineHeight: '1.8'
        }}>
          <li style={{ marginBottom: '0.5rem' }}>✓ Tailor your resume for each application</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Research the company before applying</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Follow up on your applications</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Prepare for technical interviews</li>
          <li style={{ marginBottom: '0.5rem' }}>✓ Keep your skills updated</li>
        </ul>
      </div>

      {/* 添加一个创建测试数据的按钮（仅用于测试） */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '1rem', color: '#856404' }}>
            <strong>Developer Mode:</strong> If you're seeing deadline passed messages, you can create new test jobs.
          </p>
          <button
            onClick={async () => {
              //const employerToken = localStorage.getItem('token');
              const userType = localStorage.getItem('userType');
              
              if (userType !== 'employer') {
                alert('Please login as an employer to create jobs');
                return;
              }

              try {
                // 创建一个未来日期的职位
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 2);
                
                await jobAPI.createJob({
                  title: 'Test Job - ' + new Date().getTime(),
                  description: 'This is a test job created for development purposes',
                  location: 'Remote',
                  type: 'Full-time',
                  workType: 'Remote',
                  salaryMin: 50000,
                  salaryMax: 80000,
                  experienceLevel: 'Entry Level',
                  applicationDeadline: futureDate.toISOString().split('T')[0]
                });
                
                alert('Test job created successfully!');
                fetchJobs();
              } catch (error) {
                alert('Failed to create test job. Make sure you are logged in as an employer.');
              }
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Test Job (Employer Only)
          </button>
        </div>
      )}
    </div>
  );
}

export default JobShowcase;
