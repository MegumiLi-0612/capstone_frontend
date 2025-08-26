import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { applicationAPI } from '../services/api';
import '../styles/JobApplicationForm.css';

const JobApplicationForm = ({ job, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    educationLevel: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Add body class when modal opens
  React.useEffect(() => {
    document.body.classList.add('application-form-open');
    return () => {
      document.body.classList.remove('application-form-open');
    };
  }, []);

  const educationLevels = [
    { value: 'high_school', label: 'High School' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: 'Bachelor Degree' },
    { value: 'master', label: 'Master Degree' },
    { value: 'phd', label: 'PhD' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type by extension (more reliable than MIME type)
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please select a valid file type (PDF, DOC, DOCX, or TXT)'
        }));
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setResumeFile(file);
      console.log('File selected:', file);
      console.log('File type:', file.type);
      console.log('File name:', file.name);
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Name is required';
    }
    
    if (!formData.applicantPhone.trim()) {
      newErrors.applicantPhone = 'Phone number is required';
    }
    
    if (!formData.applicantEmail.trim()) {
      newErrors.applicantEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.applicantEmail)) {
      newErrors.applicantEmail = 'Please enter a valid email';
    }
    
    if (!formData.educationLevel) {
      newErrors.educationLevel = 'Education level is required';
    }
    
    if (!resumeFile) {
      newErrors.resume = 'Resume file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', job.id);
      formDataToSend.append('applicantName', formData.applicantName);
      formDataToSend.append('applicantPhone', formData.applicantPhone);
      formDataToSend.append('applicantEmail', formData.applicantEmail);
      formDataToSend.append('educationLevel', formData.educationLevel);
      formDataToSend.append('coverLetter', formData.coverLetter);
      formDataToSend.append('resume', resumeFile);
      
      // 调试信息
      console.log('=== 文件上传调试信息 ===');
      console.log('Resume file:', resumeFile);
      console.log('Resume file type:', resumeFile?.type);
      console.log('Resume file name:', resumeFile?.name);
      console.log('Resume file size:', resumeFile?.size);
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      console.log('=== 调试信息结束 ===');
      







      const response = await applicationAPI.submitApplication(formDataToSend);
      
      if (response.data.success) {
        onSuccess(response.data.message);
        onClose();
      }
    } catch (error) {
      console.error('Application submission error:', error);
      if (error.response?.data?.message) {
        setErrors(prev => ({
          ...prev,
          submit: error.response.data.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to submit application. Please try again.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    // Create portal to render modal at body level
  const modalContent = (
    <div className="application-form-overlay">
      <div className="application-form-modal">
        <div className="application-form-header">
          <h2>Apply for {job.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="applicantName">Full Name *</label>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              className={errors.applicantName ? 'error' : ''}
            />
            {errors.applicantName && <span className="error-message">{errors.applicantName}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="applicantPhone">Phone Number *</label>
            <input
              type="tel"
              id="applicantPhone"
              name="applicantPhone"
              value={formData.applicantPhone}
              onChange={handleInputChange}
              className={errors.applicantPhone ? 'error' : ''}
            />
            {errors.applicantPhone && <span className="error-message">{errors.applicantPhone}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="applicantEmail">Email *</label>
            <input
              type="email"
              id="applicantEmail"
              name="applicantEmail"
              value={formData.applicantEmail}
              onChange={handleInputChange}
              className={errors.applicantEmail ? 'error' : ''}
            />
            {errors.applicantEmail && <span className="error-message">{errors.applicantEmail}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="educationLevel">Education Level *</label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleInputChange}
              className={errors.educationLevel ? 'error' : ''}
            >
              <option value="">Select Education Level</option>
              {educationLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.educationLevel && <span className="error-message">{errors.educationLevel}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="resume">Resume *</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className={errors.resume ? 'error' : ''}
              />
              <div className="file-upload-info">
                {resumeFile ? (
                  <span className="file-selected">✓ {resumeFile.name}</span>
                ) : (
                  <span className="file-placeholder">Choose File</span>
                )}
              </div>
            </div>
            <small>Accepted formats: PDF, DOC, DOCX, TXT (Max 5MB)</small>
            {errors.resume && <span className="error-message">{errors.resume}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter (Optional)</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows="4"
              placeholder="Tell us why you're interested in this position..."
            />
          </div>
          
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body);
};

export default JobApplicationForm;
