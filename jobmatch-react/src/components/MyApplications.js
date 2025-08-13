import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../services/api';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.data.applications);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f39c12';
      case 'reviewed': return '#3498db';
      case 'interview': return '#9b59b6';
      case 'accepted': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'interview': return 'Interview Stage';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading your applications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#e74c3c' }}>Error: {error}</h2>
        <button 
          onClick={fetchApplications}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Applications</h1>
      
      {applications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#666' }}>No applications yet</h2>
          <p style={{ marginBottom: '2rem' }}>
            Start applying to jobs to see your applications here!
          </p>
          <button 
            onClick={() => window.location.href = '/jobs'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>
                {applications.length}
              </h3>
              <p style={{ margin: 0, color: '#666' }}>Total Applications</p>
            </div>
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#f39c12' }}>
                {applications.filter(a => a.status === 'pending').length}
              </h3>
              <p style={{ margin: 0, color: '#666' }}>Pending</p>
            </div>
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#27ae60' }}>
                {applications.filter(a => a.status === 'interview').length}
              </h3>
              <p style={{ margin: 0, color: '#666' }}>Interview</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((application) => (
              <div 
                key={application.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0',
                      color: '#2c3e50'
                    }}>
                      {application.job.title}
                    </h3>
                    <p style={{ 
                      margin: '0 0 0.25rem 0',
                      color: '#3498db',
                      fontWeight: '600'
                    }}>
                      {application.job.company}
                    </p>
                    <p style={{ margin: 0, color: '#666' }}>
                      📍 {application.job.location} | {application.job.type}
                    </p>
                  </div>
                  <div style={{
                    backgroundColor: getStatusColor(application.status),
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {getStatusText(application.status)}
                  </div>
                </div>
                
                <div style={{ 
                  borderTop: '1px solid #eee',
                  paddingTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                  {application.status === 'interview' && (
                    <button style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}>
                      Prepare for Interview
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.href = `/jobs/${application.job.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      color: '#3498db',
                      border: '1px solid #3498db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    View Job Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyApplications;