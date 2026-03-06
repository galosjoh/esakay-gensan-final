import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaUsers, FaCar, FaMapMarkerAlt, FaRoute, 
  FaCalculator, FaShieldAlt, FaSignOutAlt, FaUser, FaBell, FaCheck, FaTrash 
} from 'react-icons/fa';
import './App.css';

const API_BASE = 'https://esakay-gensan-final.onrender.com/api';

// --- SHARED SIDEBAR ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="web-sidebar">
      <div className="sidebar-brand">
         <div className="logo-circle"><FaBolt/></div>
         <div><b>eSakay Portal</b><br/><small>{isAdmin ? 'Admin Panel' : 'User Terminal'}</small></div>
      </div>
      <div className="sidebar-nav">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className="nav-item-web"><FaThLarge/> Dashboard</NavLink>
            <NavLink to="/admin/users" className="nav-item-web"><FaUsers/> User Management</NavLink>
            <NavLink to="/admin/drivers" className="nav-item-web"><FaCar/> Drivers</NavLink>
            <NavLink to="/admin/routes" className="nav-item-web"><FaRoute/> Routes</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" end className="nav-item-web"><FaThLarge/> Dashboard</NavLink>
            <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/safety" className="nav-item-web"><FaShieldAlt/> SOS Emergency</NavLink>
          </>
        )}
      </div>
      <button className="btn-logout-web" onClick={() => { localStorage.clear(); window.location.href='/'; }}><FaSignOutAlt/> Logout Portal</button>
    </div>
  );
};

// --- LOGIN PAGE ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt className="logo-main"/>
        <h1>eSakay Portal</h1>
        {error && <div className="web-error-box">{error}</div>}
        <input className="web-input-field" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-primary" onClick={handleLogin}>Login to System</button>
        <p style={{marginTop:'20px', fontSize:'14px'}}>New? <span onClick={()=>navigate('/register')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold'}}>Register here</span></p>
      </div>
    </div>
  );
};

// --- ADMIN HOME (FIGMA STYLE) ---
const AdminHome = ({ user }) => {
  return (
    <div className="full-web-page">
      <Sidebar user={user}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Dashboard</h1><p>System Overview & Monitoring</p></header>
        <div className="web-stats-grid">
          <div className="web-stat-card"><small>Total Commuters</small> <h2>12,458</h2><span className="tag">+12%</span></div>
          <div className="web-stat-card"><small>Verified Drivers</small> <h2>342</h2><span className="tag">+8%</span></div>
          <div className="web-stat-card"><small>Active Vehicles</small> <h2>289</h2><span className="tag">Live</span></div>
          <div className="web-stat-card"><small>Pending Approval</small> <h2>18</h2><span className="tag">Review</span></div>
        </div>
        <div className="web-map-section">
           <FaMapMarkerAlt size={50} color="#2563eb"/>
           <h3>Real-Time Map View</h3>
           <p>289 vehicles active in General Santos City</p>
        </div>
      </main>
    </div>
  );
};

// --- ADMIN USERS ---
const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_BASE}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_BASE}/admin/approve/${id}`); alert("Approved!"); fetchU(); };

  return (
    <div className="full-web-page">
      <Sidebar user={user}/>
      <main className="web-main-content">
        <h1>User Management</h1>
        <div className="web-table-wrapper">
          <table className="web-full-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td><td>{u.email}</td>
                  <td><span className={`web-badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td>{!u.isApproved && <button className="web-btn-success" onClick={()=>approve(u._id)}><FaCheck/> Approve</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// --- USER HOME ---
const UserHome = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className="full-web-page">
      <Sidebar user={user}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Welcome back, {user?.name}!</h1><p>📍 Barangay Fatima Uhaw</p></header>
        <div className="user-web-grid">
           <div className="user-web-card" onClick={()=>navigate('/fare')}><div className="icon-circ bg-green"><FaCalculator/></div><h3>Fare Calc</h3></div>
           <div className="user-web-card" onClick={()=>navigate('/track')}><div className="icon-circ bg-blue"><FaMapMarkerAlt/></div><h3>Live Tracking</h3></div>
           <div className="user-web-card" onClick={()=>navigate('/safety')}><div className="icon-circ bg-red"><FaShieldAlt/></div><h3>Safety SOS</h3></div>
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP WITH PROTECTION LOGIC ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('esakay_current');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, [location]);

  if (loading) return <div className="loading-screen">Loading eSakay...</div>;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* PROTECTED ROUTES */}
      <Route path="/home" element={user ? <UserHome user={user} /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminHome user={user} /> : <Navigate to="/" />} />
      <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers user={user} /> : <Navigate to="/" />} />
      
      {/* PLACEHOLDERS */}
      <Route path="/fare" element={user ? <UserHome user={user} /> : <Navigate to="/" />} />
      <Route path="/track" element={user ? <UserHome user={user} /> : <Navigate to="/" />} />
      <Route path="/safety" element={user ? <UserHome user={user} /> : <Navigate to="/" />} />
      <Route path="/profile" element={user ? <UserHome user={user} /> : <Navigate to="/" />} />
    </Routes>
  );
}

// REGISTER component
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const handleReg = async () => {
    try { await axios.post(`${API_BASE}/register`, form); alert("Wait for approval!"); navigate('/'); }
    catch (err) { alert("Error registering."); }
  };
  return (
    <div className="web-auth-screen"><div className="web-auth-card"><h2>Sign Up</h2><input className="web-input-field" placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})}/><input className="web-input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/><input className="web-input-field" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/><input className="web-input-field" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/><button className="web-btn-primary" onClick={handleReg}>Register</button></div></div>
  );
};

export default () => (<Router><App /></Router>);
