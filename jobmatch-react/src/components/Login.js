import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        const { token, userType } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        
        // 根据用户类型跳转
        if (userType === 'student') {
          navigate('/student-dashboard');
        } else {
          navigate('/employer-dashboard');
        }
      } else {
        // 注册
        const registerData = {
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          firstName: formData.firstName,
          lastName: formData.lastName
        };

        if (formData.userType === 'student') {
          registerData.studentDetails = {
            university: 'University Name',
            major: 'Computer Science',
            graduationDate: '2025-05-15',
            gpa: 3.5
          };
        } else {
          registerData.employerDetails = {
            companyName: 'Company Name'
          };
        }

        const response = await authAPI.register(registerData);
        const { token, userType } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType);
        
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isLogin ? 'Login' : 'Register'}
      </h2>

      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#c00', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />

            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />

            <select
              value={formData.userType}
              onChange={(e) => setFormData({...formData, userType: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="student">Student</option>
              <option value="employer">Employer</option>
            </select>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.75rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ 
            background: 'none',
            border: 'none',
            color: '#3498db',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export default Login;