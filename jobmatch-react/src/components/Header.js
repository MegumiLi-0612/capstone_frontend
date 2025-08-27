import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // 监听存储变化
    const handleStorageChange = () => {
      setUserType(localStorage.getItem('userType'));
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUserType(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header style={{ 
      backgroundColor: '#2c3e50', 
      color: 'white', 
      padding: '1rem 0', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    }}>
      <nav style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 2rem' 
      }}>
        <div>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            JobMatch
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {isLoggedIn && userType && (
            <span style={{ color: '#ecf0f1' }}>
              Logged in as: <strong>{userType}</strong>
            </span>
          )}
          
          <Link to="/jobs" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px' 
          }}>
            View Jobs
          </Link>

          {isLoggedIn ? (
            <>
              {userType === 'student' && (
                <>
                  <Link to="/student-dashboard" style={{ 
                    color: 'white', 
                    textDecoration: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px' 
                  }}>
                    Dashboard
                  </Link>
                  <Link to="/todo" style={{ 
                    color: 'white', 
                    textDecoration: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px' 
                  }}>
                    My Tasks
                  </Link>
                </>
              )}
              
              {userType === 'employer' && (
                <Link to="/employer-dashboard" style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px' 
                }}>
                  Dashboard
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                style={{ 
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ 
              backgroundColor: '#3498db',
              color: 'white', 
              textDecoration: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px' 
            }}>
              Login / Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}


export default Header;

