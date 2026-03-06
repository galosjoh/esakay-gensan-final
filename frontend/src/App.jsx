import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, useLocation, Navigate } from 'react-router-dom';
import { 
  FaHome, FaCalculator, FaUser, FaBolt, FaCheck, FaTrash, FaMapMarkerAlt, 
  FaRoute, FaShieldAlt, FaSignOutAlt, FaUsers, FaCar, FaBell, FaFileAlt, FaCreditCard 
} from 'react-icons/fa';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// --- SIDEBAR COMPONENT ---
const WebSidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="sidebar-web">
      <div className="sidebar-logo"><FaBolt/> eSakay Portal</div>
      <nav className="nav-container">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className="nav-item"><FaHome/> Dashboard</NavLink>
            <NavLink to="/admin/users" className="nav-item"><FaUsers/> User Approval</NavLink>
            <NavLink to="/admin/drivers" className="nav-item"><FaCar/> Drivers List</NavLink>
            <NavLink to="/admin/routes" className="nav-item"><FaRoute/> Routes</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" className="nav-item"><FaHome/> My Home</NavLink>
            <NavLink to="/fare" className="nav-item"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item"><FaMapMarkerAlt/> Live Tracking</NavLink>
          </>
        )}
        <NavLink to="/profile" className="nav-item"><FaUser/> My Profile</NavLink>
      </nav>
      <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href='/'; }}>
        <FaSignOutAlt/> Logout
      </button>
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
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="auth-full-page">
      <div className="auth-card">
        <FaBolt className="brand-logo"/>
        <h2>Web Portal Login</h2>
        {error && <p className="err-msg">{error}</p>}
        <input className="web-input" type="email" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="btn-main" onClick={handleLogin}>Login to Dashboard</button>
        <div style={{marginTop:'20px', fontSize:'14px'}}>No account? <span onClick={()=>navigate('/register')} style={{color:'blue', cursor:'pointer', fontWeight:'bold'}}>Register here</span></div>
      </div>
    </div>
  );
};

// --- REGISTER PAGE ---
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const handleReg = async () => {
    try {
      await axios.post(`${API_URL}/register`, form);
      alert("Registration Success! Wait for Admin Approval.");
      navigate('/');
    } catch (err) { alert("Registration failed."); }
  };
  return (
    <div className="auth-full-page">
      <div className="auth-card">
        <h2>Create Web Account</h2>
        <input className="web-input" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="web-input" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="web-input" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="btn-main" onClick={handleReg}>Sign Up</button>
        <p onClick={()=>navigate('/')} style={{marginTop:'15px', cursor:'pointer'}}>Back to Login</p>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD (FIGMA STYLE) ---
const AdminHome = () => {
  return (
    <div className="web-layout">
      <WebSidebar user={{role:'admin'}}/>
      <main className="main-content">
        <h1>Dashboard Overview</h1>
        <div className="stats-grid">
           <div className="stat-card"><span>Total Commuters</span> <h2>12,458</h2> <small style={{color:'green'}}>+12%</small></div>
           <div className="stat-card"><span>Verified Drivers</span> <h2>342</h2> <small style={{color:'green'}}>+8%</small></div>
           <div className="stat-card"><span>Active Vehicles</span> <h2>289</h2> <small style={{color:'blue'}}>Live</small></div>
           <div className="stat-card"><span>SOS Alerts</span> <h2>3</h2> <small style={{color:'red'}}>Critical</small></div>
        </div>
        <div className="map-placeholder">
           <FaMapMarkerAlt size={40} color="#2563eb"/>
           <h3>Live Vehicle Map View</h3>
           <p>Gensan Transportation Monitoring</p>
        </div>
      </main>
    </div>
  );
};

// --- ADMIN USER MANAGEMENT ---
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => { const res = await axios.get(`${API_URL}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchUsers(); }, []);

  const approve = async (id) => { await axios.put(`${API_URL}/admin/approve/${id}`); fetchUsers(); };
  const del = async (id) => { if(window.confirm("Delete account?")) { await axios.delete(`${API_URL}/user/${id}`); fetchUsers(); } };

  return (
    <div className="web-layout">
      <WebSidebar user={{role:'admin'}}/>
      <main className="main-content">
        <h1>User Management</h1>
        <div className="table-card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td><td>{u.email}</td>
                  <td><span className={`badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-approve" onClick={()=>approve(u._id)}><FaCheck/> Approve</button>}
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

// --- USER DASHBOARD ---
const Home = () => {
  const [u, setU] = useState({});
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
  return (
    <div className="web-layout">
      <WebSidebar user={u}/>
      <main className="main-content">
        <header style={{display:'flex', justifyContent:'space-between'}}>
           <h1>Welcome, {u.name}!</h1>
           <FaBell size={24} color="#666"/>
        </header>
        <div className="stats-grid" style={{marginTop:'30px'}}>
           <div className="stat-card" style={{background:'#10b981', color:'white'}}><h3>Fare Calc</h3><p>Estimate trip cost</p></div>
           <div className="stat-card" style={{background:'#3b82f6', color:'white'}}><h3>Tracking</h3><p>Locate vehicles</p></div>
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/profile" element={<Home />} />
      <Route path="/fare" element={<Home />} />
      <Route path="/track" element={<Home />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);