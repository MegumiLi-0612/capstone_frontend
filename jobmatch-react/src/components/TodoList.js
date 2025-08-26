import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { taskAPI } from '../services/api';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);  // 添加这行
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, highPriority: 0 });  // 添加这行

  // Initial job search tasks
  

  // Load initial tasks on component mount
  // 替换现有的 useEffect
useEffect(() => {
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await taskAPI.getTasks();
      
      if (response.data.success) {
        setTodos(response.data.data.tasks || []);
        setStats(response.data.data.stats || { total: 0, completed: 0, pending: 0, highPriority: 0 });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  loadTasks();
}, []);

  // Add new todo
const addTodo = async () => {
  if (newTodo.trim() === '') return;
  
  try {
    setSubmitting(true);
    const response = await taskAPI.createTask({
      text: newTodo,
      category: 'custom',
      priority: 'medium'
    });
    
    if (response.data.success) {
      // 重新加载任务
      const tasksResponse = await taskAPI.getTasks();
      setTodos(tasksResponse.data.data.tasks || []);
      setStats(tasksResponse.data.data.stats || {});
      setNewTodo('');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create task');
  } finally {
    setSubmitting(false);
  }
};

  const toggleTodo = async (id) => {
  try {
    await taskAPI.toggleTask(id);
    const response = await taskAPI.getTasks();
    setTodos(response.data.data.tasks || []);
    setStats(response.data.data.stats || {});
  } catch (err) {
    setError('Failed to update task');
  }
};

const deleteTodo = async (id) => {
  if (!window.confirm('Are you sure?')) return;
  
  try {
    await taskAPI.deleteTask(id);
    const response = await taskAPI.getTasks();
    setTodos(response.data.data.tasks || []);
    setStats(response.data.data.stats || {});
  } catch (err) {
    setError('Failed to delete task');
  }
};
  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  // Get category emoji
  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'resume': return '📄';
      case 'application': return '📝';
      case 'interview': return '🎯';
      case 'research': return '🔍';
      case 'networking': return '🤝';
      case 'portfolio': return '💼';
      case 'follow-up': return '📞';
      default: return '✓';
    }
  };

  // Filter todos by completion status
  const completedTodos = todos.filter(t => t.completed);
  const pendingTodos = todos.filter(t => !t.completed);
  const highPriorityPending = pendingTodos.filter(t => t.priority === 'high');

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2rem', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Job Search Task Manager</h2>
      
      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          backgroundColor: '#3498db', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{todos.length}</div>
          <div style={{ fontSize: '0.9rem' }}>Total Tasks</div>
        </div>
        <div style={{ 
          backgroundColor: '#27ae60', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{completedTodos.length}</div>
          <div style={{ fontSize: '0.9rem' }}>Completed</div>
        </div>
        <div style={{ 
          backgroundColor: '#e74c3c', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{highPriorityPending.length}</div>
          <div style={{ fontSize: '0.9rem' }}>High Priority</div>
        </div>
        <div style={{ 
          backgroundColor: '#f39c12', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: '6px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pendingTodos.length}</div>
          <div style={{ fontSize: '0.9rem' }}>Remaining</div>
        </div>
      </div>

      {/* Add new todo */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new job search task (e.g., 'Apply to Google internship')"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            fontSize: '1rem' 
          }}
        />
        <button 
          onClick={addTodo}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Add Task
        </button>
      </div>

      {/* Error message */}
      {error && <div style={{ 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        padding: '1rem', 
        borderRadius: '4px', 
        marginBottom: '1rem' 
      }}>{error}</div>}

      {/* Loading state */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading your job search tasks...</div>}

      {/* High Priority Tasks Section */}
      {highPriorityPending.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>🚨 High Priority Tasks</h3>
          {highPriorityPending.map(todo => (
            <div key={todo.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1rem', 
              border: '2px solid #e74c3c',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              backgroundColor: '#fdf2f2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{getCategoryEmoji(todo.category)}</span>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>{todo.text}</span>
              </div>
              <button 
                onClick={() => deleteTodo(todo.id)}
                style={{ 
                  backgroundColor: '#e74c3c', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '0.9rem' 
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* All Tasks Section */}
      <div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📋 All Tasks</h3>
        {todos.map(todo => (
          <div key={todo.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem', 
            border: '1px solid #eee',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            backgroundColor: todo.completed ? '#f8f9fa' : 'white',
            opacity: todo.completed ? 0.8 : 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{getCategoryEmoji(todo.category)}</span>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ 
                fontSize: '1rem',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#666' : '#333'
              }}>{todo.text}</span>
              <span style={{ 
                fontSize: '0.8rem', 
                backgroundColor: getPriorityColor(todo.priority), 
                color: 'white', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {todo.priority.toUpperCase()}
              </span>
            </div>
            <button 
              onClick={() => deleteTodo(todo.id)}
              style={{ 
                backgroundColor: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '0.9rem' 
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Motivational Progress */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          🎯 Your Job Search Progress
        </h4>
        <div style={{ 
          width: '100%', 
          height: '20px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            width: `${todos.length > 0 ? (completedTodos.length / todos.length) * 100 : 0}%`, 
            height: '100%', 
            backgroundColor: '#27ae60',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          {completedTodos.length} of {todos.length} tasks completed ({Math.round(todos.length > 0 ? (completedTodos.length / todos.length) * 100 : 0)}%)
        </p>
        {completedTodos.length === todos.length && todos.length > 0 && (
          <p style={{ color: '#27ae60', fontWeight: 'bold', marginTop: '0.5rem' }}>
            🎉 Congratulations! You've completed all your job search tasks!
          </p>
        )}
      </div>
    </div>
  );
}


export default TodoList;




