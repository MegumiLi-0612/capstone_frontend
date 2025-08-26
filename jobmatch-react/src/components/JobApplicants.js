import React, { useState, useEffect } from 'react';
import { applicationAPI, uploadAPI } from '../services/api';
import '../styles/JobApplicants.css';

const JobApplicants = ({ jobId, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which application is being updated
  const [statusUpdateHistory, setStatusUpdateHistory] = useState({}); // Track status change history
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getJobApplications(jobId);
      
      if (response.data.success) {
        setApplicants(response.data.data);
        // Initialize status history
        const history = {};
        response.data.data.forEach(app => {
          history[app.id] = [{
            status: app.status,
            timestamp: new Date().toISOString(),
            action: 'Initial'
          }];
        });
        setStatusUpdateHistory(history);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusChange = (applicationId, newStatus, applicantName) => {
    setPendingStatusChange({
      applicationId,
      newStatus,
      applicantName,
      oldStatus: applicants.find(app => app.id === applicationId)?.status
    });
    setShowConfirmDialog(true);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      const response = await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      
      if (response.data.success) {
        // Update local state
        setApplicants(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));

        // Update status history
        setStatusUpdateHistory(prev => ({
          ...prev,
          [applicationId]: [
            ...(prev[applicationId] || []),
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              action: 'Updated'
            }
          ]
        }));

        // Show success message
        showNotification(`Status updated to ${getStatusLabel(newStatus)}`, 'success');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update application status';
      showNotification(errorMessage, 'error');
    } finally {
      setUpdatingStatus(null);
      setShowConfirmDialog(false);
      setPendingStatusChange(null);
    }
  };

  const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `status-notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const downloadResume = async (resumeUrl, applicantName) => {
    try {
      const filename = resumeUrl.split('/').pop();
      const response = await uploadAPI.downloadResume(filename);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${applicantName}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showNotification('Resume downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading resume:', error);
      showNotification('Failed to download resume', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      reviewed: '#3498db',
      interview: '#9b59b6',
      accepted: '#27ae60',
      rejected: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      interview: 'Interview',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: 'Application received, waiting for review',
      reviewed: 'Application has been reviewed',
      interview: 'Candidate invited for interview',
      accepted: 'Application accepted',
      rejected: 'Application not selected'
    };
    return descriptions[status] || '';
  };

  const filteredApplicants = selectedStatus === 'all' 
    ? applicants 
    : applicants.filter(app => app.status === selectedStatus);

  if (loading) {
    return (
      <div className="applicants-overlay">
        <div className="applicants-modal">
          <div className="loading">Loading applicants...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applicants-overlay">
        <div className="applicants-modal">
          <div className="error">{error}</div>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="applicants-overlay">
      <div className="applicants-modal">
        <div className="applicants-header">
          <h2>Job Applicants</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="applicants-filters">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status ({applicants.length})</option>
            <option value="pending">Pending ({applicants.filter(app => app.status === 'pending').length})</option>
            <option value="reviewed">Reviewed ({applicants.filter(app => app.status === 'reviewed').length})</option>
            <option value="interview">Interview ({applicants.filter(app => app.status === 'interview').length})</option>
            <option value="accepted">Accepted ({applicants.filter(app => app.status === 'accepted').length})</option>
            <option value="rejected">Rejected ({applicants.filter(app => app.status === 'rejected').length})</option>
          </select>
        </div>
        
        <div className="applicants-content">
          {filteredApplicants.length === 0 ? (
            <div className="no-applicants">
              <p>No applicants found for this job.</p>
            </div>
          ) : (
            <div className="applicants-list">
              {filteredApplicants.map((applicant) => (
                <div key={applicant.id} className="applicant-card">
                  <div className="applicant-header">
                    <div className="applicant-info">
                      <h3>{applicant.student?.name || applicant.applicant_name || 'Unknown'}</h3>
                      <span className="applicant-email">
                        {applicant.student?.email || applicant.applicant_email}
                      </span>
                    </div>
                    <div className="applicant-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(applicant.status) }}
                        title={getStatusDescription(applicant.status)}
                      >
                        {getStatusLabel(applicant.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="applicant-details">
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">
                        {applicant.student?.phone || applicant.applicant_phone || 'Not provided'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Education:</span>
                      <span className="detail-value">
                        {applicant.student?.university || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Major:</span>
                      <span className="detail-value">
                        {applicant.student?.major || 'Not specified'}
                      </span>
                    </div>
                    
                    {applicant.cover_letter && (
                      <div className="detail-row">
                        <span className="detail-label">Cover Letter:</span>
                        <p className="cover-letter">{applicant.cover_letter}</p>
                      </div>
                    )}

                    {/* Status History */}
                    {statusUpdateHistory[applicant.id] && statusUpdateHistory[applicant.id].length > 1 && (
                      <div className="detail-row">
                        <span className="detail-label">Status History:</span>
                        <div className="status-history">
                          {statusUpdateHistory[applicant.id].slice(-3).map((entry, index) => (
                            <span key={index} className="status-history-item">
                              {getStatusLabel(entry.status)} ({new Date(entry.timestamp).toLocaleDateString()})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="applicant-actions">
                    {applicant.resume_url && (
                      <button 
                        onClick={() => downloadResume(applicant.resume_url, applicant.student?.name || applicant.applicant_name)}
                        className="btn-download"
                        title="Download resume"
                      >
                        📄 Download Resume
                      </button>
                    )}
                    
                    <div className="status-update-section">
                      <label className="status-update-label">Update Status:</label>
                      <select 
                        value={applicant.status}
                        onChange={(e) => confirmStatusChange(applicant.id, e.target.value, applicant.student?.name || applicant.applicant_name)}
                        className="status-select"
                        disabled={updatingStatus === applicant.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview">Interview</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {updatingStatus === applicant.id && (
                        <span className="updating-indicator">Updating...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingStatusChange && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Confirm Status Change</h3>
            <p>
              Are you sure you want to change the status of{' '}
              <strong>{pendingStatusChange.applicantName}</strong> from{' '}
              <span style={{ color: getStatusColor(pendingStatusChange.oldStatus) }}>
                {getStatusLabel(pendingStatusChange.oldStatus)}
              </span>{' '}
              to{' '}
              <span style={{ color: getStatusColor(pendingStatusChange.newStatus) }}>
                {getStatusLabel(pendingStatusChange.newStatus)}
              </span>?
            </p>
            <div className="confirm-dialog-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingStatusChange(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => updateApplicationStatus(pendingStatusChange.applicationId, pendingStatusChange.newStatus)}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
