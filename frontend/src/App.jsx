import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaUsers, FaCar, FaMapMarkerAlt, FaRoute, 
  FaCalculator, FaShieldAlt, FaFileAlt, FaCreditCard, FaCog, FaCheck, FaTrash, FaSignOutAlt, FaUser, FaBell, FaThumbsUp, FaComment 
} from 'react-icons/fa';
import './App.css';

const API_BASE = 'https://esakay-gensan-final.onrender.com/api';

// --- SHARED SIDEBAR COMPONENT ---
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
            <NavLink to="/home" end className="nav-item-web"><FaHome/> Home Dashboard</NavLink>
            <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/safety" className="nav-item-web"><FaShieldAlt/> Safety Center</NavLink>
            <NavLink to="/community" className="nav-item-web"><FaUsers/> Community</NavLink>
          </>
        )}
      </div>
      <button className="btn-logout-web" onClick={() => { localStorage.clear(); window.location.href='/'; }}><FaSignOutAlt/> Logout</button>
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
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt className="logo-main"/>
        <h1>eSakay Gensan</h1>
        <p style={{color:'#666', marginBottom:'20px'}}>Sign in to Web Portal</p>
        {error && <div className="web-error-box">{error}</div>}
        <input className="web-input-field" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-primary" onClick={handleLogin}>Log In</button>
        <p style={{marginTop:'20px', fontSize:'14px'}}>New? <span onClick={()=>navigate('/register')} style={{color:'#2563eb', cursor:'pointer'}}>Register here</span></p>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD (FIGMA STYLE) ---
const AdminHome = () => {
  return (
    <div className="full-web-page">
      <Sidebar user={{role:'admin'}}/>
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
           <p>289 vehicles currently active in General Santos City</p>
           <button className="web-btn-primary" style={{width:'200px', marginTop:'20px'}}>View Full Map</button>
        </div>
      </main>
    </div>
  );
};

// --- ADMIN USERS (CRUD) ---
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_BASE}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_BASE}/admin/approve/${id}`); alert("Approved!"); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete?")) { await axios.delete(`${API_BASE}/user/${id}`); fetchU(); } };

  return (
    <div className="full-web-page">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <h1>User Management</h1>
        <div className="web-table-wrapper">
          <table className="web-full-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td><td>{u.email}</td>
                  <td><span className={`web-badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-approve" onClick={()=>approve(u._id)}><FaCheck/></button>}
                    <button className="btn-delete" onClick={()=>del(u._id)}><FaTrash/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// --- USER DASHBOARD (WIDE SCREEN FEATURES) ---
const UserHome = () => {
  const [u, setU] = useState({});
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
  return (
    <div className="full-web-page">
      <Sidebar user={{role:'user'}}/>
      <main className="web-main-content">
        <header className="web-header-bar">
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h1>Welcome back, {u.name}!</h1>
            <FaBell size={24} color="#64748b"/>
          </div>
          <p>📍 Barangay Fatima Uhaw, Gen. Santos City</p>
        </header>
        <div className="user-web-grid">
           <div className="user-web-card"><div className="icon-circ bg-green"><FaCalculator/></div><h3>Calculate Fare</h3><p>Estimate trip cost to any point in Gensan</p></div>
           <div className="user-web-card"><div className="icon-circ bg-blue"><FaMapMarkerAlt/></div><h3>Track Vehicle</h3><p>Locate tricycles and jeepneys in real-time</p></div>
           <div className="user-web-card"><div className="icon-circ bg-purple"><FaRoute/></div><h3>Find Route</h3><p>Search best travel paths</p></div>
           <div className="user-web-card"><div className="icon-circ bg-red"><FaShieldAlt/></div><h3>Safety SOS</h3><p>Emergency assistance and reporting</p></div>
        </div>
        <div className="web-table-wrapper" style={{marginTop:'30px'}}>
           <h3>Recent Trips</h3>
           <table className="web-full-table">
             <thead><tr><th>From</th><th>To</th><th>Fare</th><th>Vehicle</th></tr></thead>
             <tbody>
               <tr><td>Brgy. Fatima Uhaw</td><td>City Hall</td><td>₱25.00</td><td>Tricycle</td></tr>
               <tr><td>City Hall</td><td>Gaisano Mall</td><td>₱12.00</td><td>Jeepney</td></tr>
             </tbody>
           </table>
        </div>
      </main>
    </div>
  );
};

// --- BOILERPLATE ---
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const handleReg = async () => {
    try { await axios.post(`${API_BASE}/register`, form); alert("Wait for Admin approval."); navigate('/'); }
    catch (err) { alert("Registration error."); }
  };
  return (
    <div className="web-auth-screen"><div className="web-auth-card"><h2>Sign Up</h2><input className="web-input-field" placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})}/><input className="web-input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/><input className="web-input-field" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/><input className="web-input-field" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/><button className="web-btn-primary" onClick={handleReg}>Register Account</button></div></div>
  );
};

const Profile = () => (<div className="full-web-page"><Sidebar user={{role:'user'}}/><main className="web-main-content"><h1>Profile CRUD Page</h1></main></div>);
const Fare = () => (<div className="full-web-page"><Sidebar user={{role:'user'}}/><main className="web-main-content"><h1>Fare Calculator</h1></main></div>);
const Track = () => (<div className="full-web-page"><Sidebar user={{role:'user'}}/><main className="web-content"><h1>Vehicle Tracking</h1></main></div>);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<UserHome />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/fare" element={<Fare />} />
      <Route path="/track" element={<Track />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);
