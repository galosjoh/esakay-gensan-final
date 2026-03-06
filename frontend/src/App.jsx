import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// LOGIN & REGISTER COMPONENT
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
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>🚗 eSakay Gensan</h1>
          <h2>Register</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              required
              style={styles.input}
            />
            <select
              value={formData.userType}
              onChange={(e) => setFormData({...formData, userType: e.target.value})}
              style={styles.input}
            >
              <option value="user">Passenger</option>
              <option value="driver">Driver</option>
            </select>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p style={styles.link}>
            Have account? <button onClick={() => setIsRegistering(false)} style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer'}}>Login</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🚗 eSakay Gensan</h1>
        <h2>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={styles.demo}>
          <p><strong>Demo Admin:</strong></p>
          <p>Email: admin@esakay.com</p>
          <p>Password: admin12345</p>
        </div>
        <p style={styles.link}>
          No account? <button onClick={() => setIsRegistering(true)} style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer'}}>Register</button>
        </p>
      </div>
    </div>
  );
};

// ADMIN DASHBOARD
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
    if (window.confirm('Reject user?')) {
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
    if (window.confirm('Delete user?')) {
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

  if (loading) return <div style={styles.container}>Loading...</div>;

  const pending = users.filter(u => !u.isApproved);
  const approved = users.filter(u => u.isApproved);
  const displayUsers = tab === 'pending' ? pending : approved;

  return (
    <div style={styles.adminContainer}>
      <div style={styles.header}>
        <div>
          <h1>👨‍💼 Admin Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.admin}>
        <div style={styles.tabs}>
          <button
            onClick={() => setTab('pending')}
            style={{...styles.tab, backgroundColor: tab === 'pending' ? '#667eea' : '#e5e7eb', color: tab === 'pending' ? 'white' : 'black'}}
          >
            ⏳ Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab('approved')}
            style={{...styles.tab, backgroundColor: tab === 'approved' ? '#667eea' : '#e5e7eb', color: tab === 'approved' ? 'white' : 'black'}}
          >
            ✅ Approved ({approved.length})
          </button>
        </div>

        {displayUsers.length === 0 ? (
          <p>No users</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map(u => (
                <tr key={u._id} style={styles.row}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.mobile}</td>
                  <td style={styles.td}>{u.role}</td>
                  <td style={styles.td}>
                    {tab === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(u._id)} style={styles.btnApprove}>✅ Approve</button>
                        <button onClick={() => handleReject(u._id)} style={styles.btnReject}>❌ Reject</button>
                      </>
                    ) : (
                      <button onClick={() => handleDelete(u._id)} style={styles.btnDelete}>🗑️ Delete</button>
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

// USER HOME
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
    <div style={styles.homeContainer}>
      <div style={styles.header}>
        <div>
          <h1>🚀 Welcome, {user?.name}!</h1>
          <p>eSakay Gensan Smart Mobility</p>
          {!user?.isApproved && <p style={{color: '#f59e0b'}}>⏳ Awaiting approval...</p>}
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {user?.isApproved ? (
        <div style={styles.cardGrid}>
          <div style={styles.card2}>
            <h3>📍 Track Vehicle</h3>
            <p>Real-time tracking</p>
          </div>
          <div style={styles.card2}>
            <h3>💰 Calculate Fare</h3>
            <p>Get fare estimates</p>
          </div>
          <div style={styles.card2}>
            <h3>👤 My Profile</h3>
            <p>Manage account</p>
          </div>
        </div>
      ) : (
        <div style={{padding: '40px', textAlign: 'center', background: '#fef3c7', borderRadius: '10px', margin: '40px auto', maxWidth: '500px'}}>
          <h2>⏳ Under Review</h2>
          <p>Your account is being reviewed. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

// PROTECTED ROUTE
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;

  return element;
};

// STYLES
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontSize: '14px'
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '20px 0 10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  demo: {
    background: '#f0f0f0',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px'
  },
  link: {
    textAlign: 'center',
    fontSize: '12px',
    marginTop: '10px'
  },

  adminContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eee'
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  admin: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerRow: {
    background: '#f3f4f6',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600'
  },
  row: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px'
  },
  btnApprove: {
    marginRight: '5px',
    padding: '6px 12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  btnReject: {
    marginRight: '5px',
    padding: '6px 12px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  btnDelete: {
    padding: '6px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },

  homeContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  },
  card2: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
};

// MAIN APP
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