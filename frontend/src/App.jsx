import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://esakay-gensan-final.onrender.com/api';

console.log('🔗 API URL:', API_URL);

// ===== LOGIN COMPONENT =====
const Login = () => {
  const [email, setEmail] = useState('admin@esakay.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
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
      console.log('🔐 Login attempt...');
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
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📝 Registering user...');
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        mobile: registerData.mobile,
        userType: registerData.userType
      });

      alert('✅ Registration successful! Please wait for admin approval.');
      setIsRegistering(false);
      setRegisterData({ name: '', email: '', password: '', mobile: '', userType: 'user' });
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>🚗 eSakay Gensan</h1>
          <h2 style={styles.subtitle}>Register Account</h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleRegister}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile Number</label>
              <input
                type="tel"
                placeholder="09xxxxxxxxx"
                value={registerData.mobile}
                onChange={(e) => setRegisterData({ ...registerData, mobile: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Type</label>
              <select
                value={registerData.userType}
                onChange={(e) => setRegisterData({ ...registerData, userType: e.target.value })}
                style={styles.input}
              >
                <option value="user">Passenger</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? '⏳ Registering...' : '✨ Register'}
            </button>
          </form>

          <p style={styles.toggleText}>
            Already have account? {' '}
            <button
              onClick={() => setIsRegistering(false)}
              style={styles.toggleLink}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <h1 style={styles.title}>🚗 eSakay Gensan</h1>
        <h2 style={styles.subtitle}>Login</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="admin@esakay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="admin12345"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '🔄 Logging in...' : '✨ Login'}
          </button>
        </form>

        <div style={styles.demoBox}>
          <p style={styles.demoLabel}>📋 Demo Admin:</p>
          <p style={styles.demoText}>Email: <strong>admin@esakay.com</strong></p>
          <p style={styles.demoText}>Password: <strong>admin12345</strong></p>
        </div>

        <p style={styles.toggleText}>
          Don't have account? {' '}
          <button
            onClick={() => setIsRegistering(true)}
            style={styles.toggleLink}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

// ===== ADMIN DASHBOARD =====
const Admin = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('📊 Fetching users...');
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
      
      // Separate pending and approved
      setPendingUsers(response.data.filter(u => !u.isApproved));
      setApprovedUsers(response.data.filter(u => u.isApproved));
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
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

  if (loading) {
    return <div style={styles.loading}>⏳ Loading users...</div>;
  }

  const displayUsers = activeTab === 'pending' ? pendingUsers : approvedUsers;

  return (
    <div style={styles.adminContainer}>
      <div style={styles.adminHeader}>
        <div>
          <h1 style={styles.adminTitle}>👨‍💼 Admin Dashboard</h1>
          <p style={styles.adminSubtitle}>Welcome, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.tableContainer}>
        <div style={styles.tabButtons}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'pending' ? '#667eea' : '#e5e7eb',
              color: activeTab === 'pending' ? 'white' : 'black'
            }}
          >
            ⏳ Pending ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'approved' ? '#667eea' : '#e5e7eb',
              color: activeTab === 'approved' ? 'white' : 'black'
            }}
          >
            ✅ Approved ({approvedUsers.length})
          </button>
        </div>

        <h2 style={styles.sectionTitle}>
          {activeTab === 'pending' ? '⏳ Pending Approval' : '✅ Approved Users'}
        </h2>

        {displayUsers.length === 0 ? (
          <p style={styles.emptyMessage}>
            {activeTab === 'pending' ? 'No pending users' : 'No approved users'}
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((u) => (
                <tr key={u._id} style={styles.tableRow}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.mobile}</td>
                  <td style={styles.td}>
                    <span style={styles.roleBadge}>{u.role}</span>
                  </td>
                  <td style={styles.td}>
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(u._id)}
                          style={styles.approveButton}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          style={styles.rejectButton}
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(u._id)}
                        style={styles.deleteButton}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ===== USER HOME =====
const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div style={styles.homeContainer}>
      <div style={styles.homeHeader}>
        <div>
          <h1 style={styles.homeTitle}>🚀 Welcome, {user?.name}!</h1>
          <p style={styles.homeSubtitle}>eSakay Gensan Smart Mobility</p>
          {user && !user.isApproved && (
            <p style={styles.pendingNotice}>
              ⏳ Your account is pending admin approval. You'll be notified soon.
            </p>
          )}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>

      {user?.isApproved ? (
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3>📍 Track Vehicle</h3>
            <p>Real-time vehicle tracking</p>
            <a href="#" style={styles.link}>Track Now →</a>
          </div>
          <div style={styles.card}>
            <h3>💰 Calculate Fare</h3>
            <p>Instant fare estimates</p>
            <a href="#" style={styles.link}>Calculate →</a>
          </div>
          <div style={styles.card}>
            <h3>👤 My Profile</h3>
            <p>Manage your account</p>
            <a href="#" style={styles.link}>Edit Profile →</a>
          </div>
        </div>
      ) : (
        <div style={styles.waitingBox}>
          <h2>⏳ Account Under Review</h2>
          <p>Your registration is being reviewed by our admin team.</p>
          <p>This usually takes 24-48 hours. Thank you for your patience!</p>
        </div>
      )}
    </div>
  );
};

// ===== PROTECTED ROUTE =====
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return element;
};

// ===== STYLES =====
const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  loginCard: {
    background: 'white',
    padding: '50px',
    borderRadius: '15px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '32px',
    marginBottom: '5px',
    color: '#333'
  },
  subtitle: {
    fontSize: '24px',
    marginBottom: '30px',
    color: '#666'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  errorBox: {
    background: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  demoBox: {
    marginTop: '20px',
    padding: '15px',
    background: '#f0f0f0',
    borderRadius: '8px',
    textAlign: 'center'
  },
  demoLabel: {
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  demoText: {
    margin: '5px 0',
    fontSize: '14px'
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '15px'
  },
  toggleLink: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px'
  },

  adminContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eee'
  },
  adminTitle: {
    fontSize: '32px',
    margin: '0 0 5px 0'
  },
  adminSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0'
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  tabButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  },
  sectionTitle: {
    fontSize: '20px',
    marginTop: '0',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f3f4f6',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px'
  },
  roleBadge: {
    background: '#dbeafe',
    color: '#0c4a6e',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  approveButton: {
    marginRight: '5px',
    padding: '6px 12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  rejectButton: {
    marginRight: '5px',
    padding: '6px 12px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    padding: '20px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '20px'
  },

  homeContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  homeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eee'
  },
  homeTitle: {
    fontSize: '32px',
    margin: '0 0 5px 0'
  },
  homeSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0'
  },
  pendingNotice: {
    color: '#f59e0b',
    fontSize: '14px',
    marginTop: '10px',
    fontWeight: 'bold'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold'
  },
  waitingBox: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)',
    padding: '40px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '40px auto'
  }
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
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<Admin />} requiredRole="admin" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => (
  <Router>
    <App />
  </Router>
);