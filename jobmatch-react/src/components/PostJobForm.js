import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 添加这一行
import { jobAPI } from '../services/api';
import '../styles/PostJobForm.css';

function PostJobForm() {
  const navigate = useNavigate(); // ✅ 添加这一行

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryMin: '',
    salaryMax: '',
    applicationDeadline: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 校验最大薪资必须大于最小薪资
    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMax) <= Number(formData.salaryMin)) {
      alert("Maximum salary must be greater than minimum salary.");
      return;
    }
  
    try {
      // 补充必填字段，并移除空字符串可选字段，避免后端 numeric 校验报错
      const raw = { ...formData, workType: 'On-site' };
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const res = await jobAPI.createJob(payload);
      console.log("Submitting Job:", res?.data || payload);
      alert("Job posted successfully!");
      navigate('/jobs'); // ✅ 成功后跳转
    } catch (error) {
      console.error("Error posting job:", error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to post job.';
      alert(`Failed to post job: ${msg}`);
    }
  };
  
  return (
    <div className="post-job-container">
      <h2 className="post-job-title">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="post-job-form">
        <input className="input-field" name="title" placeholder="Job Title" value={formData.title} onChange={handleChange} required />
        <textarea className="input-field" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input className="input-field" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        
        <select className="input-field" name="type" value={formData.type} onChange={handleChange}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
        </select>

        <select className="input-field" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior Level">Senior Level</option>
        </select>

        <input className="input-field" type="number" name="salaryMin" placeholder="Minimum Salary" value={formData.salaryMin} onChange={handleChange} />
        <input className="input-field" type="number" name="salaryMax" placeholder="Maximum Salary" value={formData.salaryMax} onChange={handleChange} />
        <input
          className="input-field"
          type="date"
          name="applicationDeadline"
          value={formData.applicationDeadline}
          onChange={handleChange}
          placeholder="Application Deadline"
          min={new Date().toISOString().split('T')[0]}
        />
        <button type="submit" className="submit-button">
          Post Job
        </button>
      </form>
    </div>
  );
}

export default PostJobForm;

