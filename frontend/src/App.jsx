import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// --- LOGIN ---
const Login = () => {
  const [email, setEmail] = useState('admin@esakay.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password }
      );
      
      // Store user data and token in localStorage
      localStorage.setItem('token', response.data.token || response.data.user._id);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate based on role
      const userRole = response.data.user.role;
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/home';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>eSakay Gensan Login</h2>
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '12px', textAlign: 'center' }}>
        <strong>Demo Admin Credentials:</strong><br/>
        Email: admin@esakay.com<br/>
        Password: admin12345
      </p>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/users`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/approve/${userId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('User approved!');
      fetchUsers();
    } catch (error) {
      alert('Error approving user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_URL}/user/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert('User deleted!');
        fetchUsers();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Admin Control Panel</h1>
          <p>Welcome, {user?.name}! 👋</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{u.name}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>{u.role}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: u.isApproved ? '#d1fae5' : '#fef3c7',
                    color: u.isApproved ? '#065f46' : '#92400e'
                  }}>
                    {u.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {!u.isApproved && (
                    <button 
                      onClick={() => handleApprove(u._id)}
                      style={{ marginRight: '10px', padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(u._id)}
                    style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280' }}>No users found.</p>}
    </div>
  );
};

// --- USER HOME ---
const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Welcome, {user?.name}! 🚀</h1>
          <p>eSakay Gensan Smart Mobility Dashboard</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>📍 Track Vehicle</h3>
          <p>Find nearby vehicles in real-time</p>
          <a href="#" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>Track Now →</a>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>💰 Calculate Fare</h3>
          <p>Get instant fare estimates</p>
          <a href="#" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>Calculate →</a>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>👤 My Profile</h3>
          <p>Manage your account</p>
          <a href="#" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>Edit Profile →</a>
        </div>
      </div>
    </div>
  );
};

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return element;
};

// --- MAIN APP ---
function App() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user exists on mount
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) return null;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<Admin />} requiredRole="admin" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);
