import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaUsers, FaCar, FaMapMarkerAlt, FaRoute, 
  FaCalculator, FaShieldAlt, FaFileAlt, FaCreditCard, FaCog, FaCheck, FaTrash, FaSignOutAlt, FaUser 
} from 'react-icons/fa';
import './App.css';

const API_BASE = 'https://esakay-gensan-final.onrender.com/api';

// --- SHARED SIDEBAR COMPONENT (Dynamic based on Role) ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  
  return (
    <div className="sidebar-web">
      <div className="sidebar-brand">
         <div className="logo-circle"><FaBolt/></div>
         <div><b>eSakay Gensan</b><br/><small>{isAdmin ? 'Admin Panel' : 'User Portal'}</small></div>
      </div>
      <div className="sidebar-nav">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className="nav-item-web"><FaThLarge/> Dashboard</NavLink>
            <NavLink to="/admin/users" className="nav-item-web"><FaUsers/> User Management</NavLink>
            <NavLink to="/admin/drivers" className="nav-item-web"><FaCar/> Drivers List</NavLink>
            <NavLink to="/admin/vehicles" className="nav-item-web"><FaCar/> Vehicles</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" end className="nav-item-web"><FaHome/> My Dashboard</NavLink>
            <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/routes" className="nav-item-web"><FaRoute/> Route Finder</NavLink>
          </>
        )}
        <NavLink to="/profile" className="nav-item-web"><FaUser/> My Profile</NavLink>
      </div>
      <button className="btn-logout-web" onClick={() => { localStorage.clear(); window.location.href='/'; }}>
        <FaSignOutAlt/> Logout Portal
      </button>
    </div>
  );
};

// --- LOGIN PAGE (Determines where to go) ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      const user = res.data.user;
      localStorage.setItem('esakay_current', JSON.stringify(user));
      
      alert(`Welcome, ${user.name}!`);
      
      // REDIRECTION LOGIC:
      if (user.role === 'admin') {
        navigate('/admin'); // Admin goes to Dashboard
      } else {
        navigate('/home'); // Regular user goes to Home
      }
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt className="logo-main"/>
        <h1>eSakay Web Login</h1>
        {error && <div className="web-error-box">{error}</div>}
        <input className="web-input-field" placeholder="Email Address" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-primary" onClick={handleLogin}>Log In</button>
        <p style={{marginTop:'20px', fontSize:'14px'}}>Commuter? <span onClick={()=>navigate('/register')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold'}}>Register here</span></p>
      </div>
    </div>
  );
};

// --- USER DASHBOARD (WIDE WEB STYLE) ---
const UserHome = () => {
  const navigate = useNavigate();
  const [u, setU] = useState({});
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);

  return (
    <div className="full-web-page">
      <Sidebar user={u}/>
      <main className="web-main-content">
        <header className="web-header-bar">
          <h1>Welcome, {u.name}!</h1>
          <p>Public Transport Portal - General Santos City</p>
        </header>
        <div className="web-dashboard-grid">
           <div className="web-action-card" onClick={()=>navigate('/fare')}><div className="web-icon-box bg-green"><FaCalculator/></div><h3>Fare Calculator</h3><p>Check standard tricycle/jeep rates</p></div>
           <div className="web-action-card" onClick={()=>navigate('/track')}><div className="web-icon-box bg-blue"><FaMapMarkerAlt/></div><h3>Live Tracking</h3><p>See vehicles in Fatima Uhaw</p></div>
           <div className="web-action-card" onClick={()=>navigate('/profile')}><div className="web-icon-box bg-red"><FaUser/></div><h3>Profile & Security</h3><p>Manage your account settings</p></div>
        </div>
      </main>
    </div>
  );
};

// --- ADMIN DASHBOARD (Yung Figma mo) ---
const AdminHome = () => {
  const [stats, setStats] = useState({ totalCommuters: 0, pendingApprovals: 0 });
  useEffect(() => { axios.get(`${API_BASE}/admin/stats`).then(res => setStats(res.data)); }, []);

  return (
    <div className="full-web-page">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Dashboard</h1><p>System Overview & Monitoring</p></header>
        <div className="web-dashboard-grid">
          <div className="web-stat-card"><small>Total Commuters</small> <h2>{stats.totalCommuters}</h2><span className="trend-tag">+12%</span></div>
          <div className="web-stat-card"><small>Verified Drivers</small> <h2>342</h2><span className="trend-tag">+8%</span></div>
          <div className="web-stat-card"><small>Active Vehicles</small> <h2>289</h2><span className="trend-tag">Live</span></div>
          <div className="web-stat-card"><small>Pending Approval</small> <h2>{stats.pendingApprovals}</h2><span className="trend-tag">Action</span></div>
        </div>
        <div className="map-placeholder-web">
           <FaMapMarkerAlt size={50} color="#2563eb"/>
           <h3>Live Vehicle Map</h3>
           <p>Showing active tricycles and jeepneys in Gensan</p>
        </div>
      </main>
    </div>
  );
};

// --- OTHER COMPONENTS ---
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', mobile:'', password:'' });
  const handleReg = async () => {
    try { await axios.post(`${API_BASE}/register`, form); alert("Success! Wait for Admin Approval."); navigate('/'); }
    catch (err) { alert("Registration error."); }
  };
  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <h2>Commuter Sign Up</h2>
        <input className="web-input-field" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="web-input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="web-input-field" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="web-btn-primary" onClick={handleReg}>Create Account</button>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<UserHome />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);
