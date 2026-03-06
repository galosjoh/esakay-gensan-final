import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// ===== LOGIN PAGE WITH REGISTER =====
const Login = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('admin@esakay.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regType, setRegType] = useState('user');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/home';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!regName || !regEmail || !regPassword || !regMobile) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: regName,
        email: regEmail,
        password: regPassword,
        mobile: regMobile,
        userType: regType
      });

      alert('✅ Registration successful!\nWait for admin approval. Check your email for updates.');
      setShowRegister(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegMobile('');
      setLoading(false);
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (showRegister) {
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
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="form-input"
                >
                  <option value="user">👤 Passenger</option>
                  <option value="driver">🚗 Driver</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? '⏳ Registering...' : '✨ Create Account'}
              </button>
            </form>

            <div className="form-footer">
              <p>Already have account? <button type="button" onClick={() => setShowRegister(false)} className="toggle-btn">Login</button></p>
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
            <p>Welcome! Login to continue</p>
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
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '🔄 Logging in...' : '✨ Login'}
            </button>
          </form>

          <div className="demo-credentials">
            <h4>📋 Demo Admin:</h4>
            <p><strong>admin@esakay.com</strong></p>
            <p><strong>admin12345</strong></p>
          </div>

          <div className="form-footer">
            <p>No account? <button type="button" onClick={() => setShowRegister(true)} className="toggle-btn">Register now</button></p>
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
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
      alert('Error: ' + err.response?.data?.message);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Reject this user?')) {
      try {
        await axios.put(`${API_URL}/admin/reject/${userId}`);
        alert('✅ User rejected!');
        fetchUsers();
      } catch (err) {
        alert('Error: ' + err.response?.data?.message);
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
        alert('Error: ' + err.response?.data?.message);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) return <div className="loading">⏳ Loading...</div>;

  const pending = users.filter(u => !u.isApproved);
  const approved = users.filter(u => u.isApproved);
  const display = tab === 'pending' ? pending : approved;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>👨‍💼 Admin Dashboard</h1>
            <p>User Management System</p>
          </div>
          <div className="header-right">
            <span>👤 {user?.name}</span>
            <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <h3>{pending.length}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <h3>{approved.length}</h3>
            <p>Approved</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="users-section">
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

          <h2>{tab === 'pending' ? '⏳ Pending Approval' : '✅ Approved Users'}</h2>

          {display.length === 0 ? (
            <div className="empty-state">No users</div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map(u => (
                    <tr key={u._id}>
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
      <div className="user-header">
        <div className="header-content">
          <div>
            <h1>🚀 Welcome, {user?.name}!</h1>
            <p>eSakay Gensan Smart Mobility</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
        </div>
      </div>

      <div className="user-container">
        {user?.isApproved ? (
          <>
            <h2 style={{marginBottom: '30px', color: '#333'}}>✅ Your Account is Active</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Track Vehicle</h3>
                <p>Real-time vehicle tracking</p>
                <a href="#" className="feature-link">Get Started →</a>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Calculate Fare</h3>
                <p>Instant fare estimates</p>
                <a href="#" className="feature-link">Calculate →</a>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗺️</div>
                <h3>Route Planning</h3>
                <p>Optimal travel routes</p>
                <a href="#" className="feature-link">Plan Now →</a>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📞</div>
                <h3>Support</h3>
                <p>24/7 customer support</p>
                <a href="#" className="feature-link">Contact →</a>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Payment History</h3>
                <p>View all transactions</p>
                <a href="#" className="feature-link">View →</a>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>My Profile</h3>
                <p>Manage your account</p>
                <a href="#" className="feature-link">Edit →</a>
              </div>
            </div>
          </>
        ) : (
          <div className="pending-section">
            <div className="pending-icon">⏳</div>
            <h2>Your Account is Under Review</h2>
            <p>Thank you for registering! Your account is being reviewed by our admin team.</p>
            <p className="pending-time">⏱️ This usually takes 24-48 hours</p>
            <div className="user-details">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Type:</strong> {user?.role === 'driver' ? '🚗 Driver' : '👤 Passenger'}</p>
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

// ===== APP =====
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
