import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TodoList from './components/TodoList';
import TestPage from './components/TestPage';
import JobShowcase from './components/JobShowcase';
import Login from './components/Login';
import MyApplications from './components/MyApplications';
import PostJobForm from './components/PostJobForm';
import ManageJobs from './components/ManageJobs';

function ProtectedRoute({ children, allowedUserType }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedUserType && userType !== allowedUserType) {
    return <Navigate to="/" />;
  }

  return children;
}

function StudentDashboard() {
 return (
   <div style={{ padding: '2rem' }}>
     <h1>Student Dashboard</h1>
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
       <div style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
         <h3>My Applications</h3>
         <p>View and track your job applications</p>
         <button 
           onClick={() => window.location.href = '/my-applications'}
           style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           View Applications
         </button>
       </div>
       <div style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
         <h3>Browse Jobs</h3>
         <p>Find new opportunities</p>
         <button 
           onClick={() => window.location.href = '/jobs'}
           style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           Browse Jobs
         </button>
       </div>
       {/* 
       <div style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
         <h3>My Tasks</h3>
         <p>Manage your job search tasks</p>
         <button 
           onClick={() => window.location.href = '/todo'}
           style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           View Tasks
         </button>
       </div>
       */}
     </div>
   </div>
 );
}

function EmployerDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Employer Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Post New Job</h3>
          <p>Create a new job listing</p>
          <button 
            onClick={() => window.location.href = '/post-job'} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Post Job
          </button>
        </div>

        <div style={{ backgroundColor: '#f0f0f0', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>My Job Postings</h3>
          <p>Manage your active job listings</p>
          <button 
            onClick={() => window.location.href = '/employer/manage-jobs'}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            View Jobs
          </button>
        </div>
      </div>
    </div>
  );
}


function HomePage() {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to JobMatch</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Connecting talented students with amazing opportunities
      </p>

      {!token ? (
        <div>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              padding: '1rem 2rem', 
              margin: '0 1rem',
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
            Login / Register
          </button>
          <button 
            onClick={() => window.location.href = '/jobs'}
            style={{ 
              padding: '1rem 2rem',
              margin: '0 1rem', 
              backgroundColor: '#27ae60', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '2rem' }}>Welcome back! You're logged in as a {userType}.</p>
          <button 
            onClick={() => window.location.href = userType === 'student' ? '/student-dashboard' : '/employer-dashboard'}
            style={{ 
              padding: '1rem 2rem', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test" element={<TestPage />} />
           {/* <Route path="/todo" element={<ProtectedRoute allowedUserType="student"><TodoList /></ProtectedRoute>} /> */}
            <Route path="/jobs" element={<JobShowcase />} />
            <Route path="/my-applications" element={<ProtectedRoute allowedUserType="student"><MyApplications /></ProtectedRoute>} />
            <Route path="/student-dashboard" element={<ProtectedRoute allowedUserType="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/employer-dashboard" element={<ProtectedRoute allowedUserType="employer"><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute allowedUserType="employer"><PostJobForm /></ProtectedRoute>} />
            <Route path="/employer/manage-jobs" element={<ProtectedRoute allowedUserType="employer"><ManageJobs /></ProtectedRoute>} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
