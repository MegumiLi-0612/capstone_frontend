import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';

function JobCard({ job, onApply }) {
  const [isApplied, setIsApplied] = useState(job.hasApplied || false);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleApply = () => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token) {
      alert('Please login to apply for jobs');
      window.location.href = '/login';
      return;
    }

    if (userType !== 'student') {
      alert('Only students can apply for jobs');
      return;
    }

    // 显示申请表单
    setShowApplicationForm(true);
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return job.hourlyRate ? `$${job.hourlyRate}/hour` : 'Salary negotiable';
  };

  const getJobTypeColor = (type) => {
    switch(type) {
      case 'Full-time': return '#27ae60';
      case 'Part-time': return '#3498db';
      case 'Internship': return '#9b59b6';
      case 'Contract': return '#e67e22';
      default: return '#95a5a6';
    }
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 3) return '#e74c3c';
    if (daysLeft <= 7) return '#f39c12';
    return '#27ae60';
  };

  const calculateDaysLeft = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = job.applicationDeadline ? calculateDaysLeft(job.applicationDeadline) : null;

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem' 
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '0.5rem',
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            {job.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ 
              color: '#3498db', 
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              {job.company}
            </span>
            <span style={{ 
              backgroundColor: getJobTypeColor(job.type),
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {job.type || 'Full-time'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#666' }}>
            <span>📍 {job.location}</span>
            <span>⏰ {job.workType || 'On-site'}</span>
          </div>
        </div>
        
        {/* Salary Badge */}
        {(job.salaryMin || job.salaryMax || job.hourlyRate) && (
          <div style={{ 
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </div>
        )}
      </div>

      {/* Key Details */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        {job.experienceLevel && (
          <div>
            <strong>Experience:</strong> {job.experienceLevel}
          </div>
        )}
        {job.duration && (
          <div>
            <strong>Duration:</strong> {job.duration}
          </div>
        )}
        {job.hoursPerWeek && (
          <div>
            <strong>Hours/Week:</strong> {job.hoursPerWeek}
          </div>
        )}
        {job.startDate && (
          <div>
            <strong>Start Date:</strong> {new Date(job.startDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Skills Required */}
      {job.skills && job.skills.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: '#2c3e50', marginBottom: '0.5rem', display: 'block' }}>
            Skills Required:
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.skills.map((skill, index) => (
              <span key={index} style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ 
            color: '#555', 
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            {showDetails ? job.description : `${job.description.substring(0, 150)}...`}
            {job.description.length > 150 && (
              <button 
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}
              >
                {showDetails ? 'Show Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Requirements */}
      {showDetails && job.requirements && job.requirements.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ color: '#2c3e50', marginBottom: '0.5rem', display: 'block' }}>
            Requirements:
          </strong>
          <ul style={{ 
            paddingLeft: '1.5rem',
            color: '#666',
            lineHeight: '1.5'
          }}>
            {job.requirements.map((req, index) => (
              <li key={index} style={{ marginBottom: '0.25rem' }}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {showDetails && job.benefits && job.benefits.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <strong style={{ color: '#2c3e50', marginBottom: '0.5rem', display: 'block' }}>
            Benefits:
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {job.benefits.map((benefit, index) => (
              <span key={index} style={{
                backgroundColor: '#e8f5e8',
                color: '#2e7d32',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                ✓ {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #eee'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            color: '#666', 
            fontSize: '0.9rem'
          }}>
            Posted: {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
          </span>
          {daysLeft !== null && (
            <span style={{ 
              backgroundColor: getUrgencyColor(daysLeft),
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              alert(`Saved ${job.title} to your favorites!`);
            }}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #3498db',
              color: '#3498db',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3498db';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#3498db';
            }}
          >
            💾 Save
          </button>
          
          <button 
            onClick={handleApply}
            disabled={isApplied || (daysLeft !== null && daysLeft < 0)}
            style={{
              backgroundColor: isApplied ? '#95a5a6' : '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              cursor: (isApplied || (daysLeft !== null && daysLeft < 0)) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isApplied && (daysLeft === null || daysLeft >= 0)) {
                e.target.style.backgroundColor = '#c0392b';
              }
            }}
            onMouseLeave={(e) => {
              if (!isApplied) {
                e.target.style.backgroundColor = '#e74c3c';
              }
            }}
          >
            {isApplied ? '✓ Applied' : '🚀 Apply Now'}
          </button>
        </div>
      </div>
      
      {/* 申请表单 */}
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={(message) => {
            setIsApplied(true);
            setShowApplicationForm(false);
            if (onApply) {
              onApply(job.id);
            }
          }}
        />
      )}
    </div>
  );
}


export default JobCard;
