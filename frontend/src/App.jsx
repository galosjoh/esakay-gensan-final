import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// ===== LOGIN PAGE =====
const Login = () => {
  const [email, setEmail] = useState('admin@esakay.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    userType: 'user'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/home';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      alert('✅ Registration successful! Wait for admin approval.');
      setIsRegistering(false);
      setFormData({ name: '', email: '', password: '', mobile: '', userType: 'user' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <div className="logo">⚡</div>
              <h1>eSakay Gensan</h1>
              <p>Create your account</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  className="form-input"
                >
                  <option value="user">Passenger</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{width: '100%'}}>
                {loading ? '⏳ Registering...' : '✨ Register'}
              </button>
            </form>

            <div className="form-footer">
              <p>Already have account? <button onClick={() => setIsRegistering(false)} className="toggle-btn">Login here</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <div className="logo">⚡</div>
            <h1>eSakay Gensan</h1>
            <p>Welcome back! Login to continue</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@esakay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{width: '100%'}}>
              {loading ? '🔄 Logging in...' : '✨ Login'}
            </button>
          </form>

          <div className="demo-credentials">
            <h4>📋 Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin@esakay.com / admin12345</p>
          </div>

          <div className="form-footer">
            <p>Don't have account? <button onClick={() => setIsRegistering(true)} className="toggle-btn">Register here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== ADMIN DASHBOARD =====
const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('pending');
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
      
      const pending = response.data.filter(u => !u.isApproved).length;
      const approved = response.data.filter(u => u.isApproved).length;
      
      setStats({
        pending,
        approved,
        total: response.data.length
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/approve/${userId}`);
      alert('✅ User approved!');
      fetchUsers();
    } catch (err) {
      alert('❌ Error: ' + err.response?.data?.message);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Reject this user?')) {
      try {
        await axios.put(`${API_URL}/admin/reject/${userId}`);
        alert('✅ User rejected!');
        fetchUsers();
      } catch (err) {
        alert('❌ Error: ' + err.response?.data?.message);
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Delete this user?')) {
      try {
        await axios.delete(`${API_URL}/user/${userId}`);
        alert('✅ User deleted!');
        fetchUsers();
      } catch (err) {
        alert('❌ Error: ' + err.response?.data?.message);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) return <div className="loading">⏳ Loading dashboard...</div>;

  const pending = users.filter(u => !u.isApproved);
  const approved = users.filter(u => u.isApproved);
  const displayUsers = tab === 'pending' ? pending : approved;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>👨‍💼 Admin Dashboard</h1>
            <p>Manage users and approvals</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>👤 {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Approval</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.approved}</h3>
              <p>Approved Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Users</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              onClick={() => setTab('pending')}
              className={`tab-btn ${tab === 'pending' ? 'active' : ''}`}
            >
              ⏳ Pending ({pending.length})
            </button>
            <button
              onClick={() => setTab('approved')}
              className={`tab-btn ${tab === 'approved' ? 'active' : ''}`}
            >
              ✅ Approved ({approved.length})
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <h2>{tab === 'pending' ? '⏳ Pending Approval' : '✅ Approved Users'}</h2>

          {displayUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map(u => (
                    <tr key={u._id} className="table-row">
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.mobile}</td>
                      <td><span className="badge">{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="actions">
                        {tab === 'pending' ? (
                          <>
                            <button onClick={() => handleApprove(u._id)} className="btn-approve">✅ Approve</button>
                            <button onClick={() => handleReject(u._id)} className="btn-reject">❌ Reject</button>
                          </>
                        ) : (
                          <button onClick={() => handleDelete(u._id)} className="btn-delete">🗑️ Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== USER DASHBOARD =====
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
    <div className="user-page">
      {/* Header */}
      <div className="user-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🚀 Welcome, {user?.name}!</h1>
            <p>eSakay Gensan Smart Mobility Portal</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="user-container">
        {user?.isApproved ? (
          <>
            <div className="welcome-section">
              <h2>✅ Account Approved</h2>
              <p>Your account is active. Start using eSakay Gensan!</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Track Vehicle</h3>
                <p>Real-time vehicle tracking and location</p>
                <a href="#" className="feature-link">Get Started →</a>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Calculate Fare</h3>
                <p>Get instant fare estimates for your trip</p>
                <a href="#" className="feature-link">Calculate →</a>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🗺️</div>
                <h3>Route Planning</h3>
                <p>Plan your journey with optimal routes</p>
                <a href="#" className="feature-link">Plan Now →</a>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📞</div>
                <h3>Contact Support</h3>
                <p>Get help from our support team</p>
                <a href="#" className="feature-link">Contact →</a>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Payment History</h3>
                <p>View your transaction history</p>
                <a href="#" className="feature-link">View →</a>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>My Profile</h3>
                <p>Manage your account settings</p>
                <a href="#" className="feature-link">Edit →</a>
              </div>
            </div>
          </>
        ) : (
          <div className="pending-section">
            <div className="pending-icon">⏳</div>
            <h2>Account Under Review</h2>
            <p>Your registration is being reviewed by our admin team.</p>
            <p className="pending-info">This usually takes 24-48 hours. Thank you for your patience!</p>
            <div className="pending-details">
              <p><strong>Account Type:</strong> {user?.role === 'driver' ? '🚗 Driver' : '👤 Passenger'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Status:</strong> 🔄 Pending Approval</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== PROTECTED ROUTE =====
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;

  return element;
};

// ===== MAIN APP =====
function App() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsChecking(false), 100);
  }, []);

  if (isChecking) return null;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<Admin />} requiredRole="admin" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => <Router><App /></Router>;
