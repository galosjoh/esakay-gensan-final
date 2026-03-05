import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaUsers, FaCar, FaMapMarkerAlt, FaRoute, 
  FaCalculator, FaShieldAlt, FaFileAlt, FaCreditCard, FaSignOutAlt, FaUser, FaCheck, FaTrash, FaCog 
} from 'react-icons/fa';
import './App.css';

const API_BASE = 'https://esakay-gensan-final.onrender.com/api';

// --- SIDEBAR COMPONENT (MATCHING FIGMA) ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="sidebar-web">
      <div className="sidebar-brand">
         <div className="logo-circle"><FaBolt/></div>
         <div><b>eSakay Gensan</b><br/><small>{isAdmin ? 'Admin Panel' : 'User Portal'}</small></div>
      </div>
      <div className="nav-group-web">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className="nav-item-web"><FaThLarge/> Dashboard</NavLink>
            <NavLink to="/admin/users" className="nav-item-web"><FaUsers/> Users</NavLink>
            <NavLink to="/admin/drivers" className="nav-item-web"><FaCar/> Drivers</NavLink>
            <NavLink to="/admin/vehicles" className="nav-item-web"><FaCar/> Vehicles</NavLink>
            <NavLink to="/admin/routes" className="nav-item-web"><FaRoute/> Routes</NavLink>
            <NavLink to="/admin/fares" className="nav-item-web"><FaCalculator/> Fares</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" end className="nav-item-web"><FaHome/> My Dashboard</NavLink>
            <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/routes" className="nav-item-web"><FaRoute/> Route Finder</NavLink>
          </>
        )}
        <NavLink to="/profile" className="nav-item-web"><FaUser/> Profile Settings</NavLink>
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
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt className="logo-main"/>
        <h1>eSakay Portal</h1>
        <p style={{color:'#666', marginBottom:'25px'}}>Sign in to your web terminal</p>
        {error && <div style={{background:'#fee2e2', color:'red', padding:'12px', borderRadius:'10px', marginBottom:'20px'}}>{error}</div>}
        <input className="web-input-field" placeholder="Email Address" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-primary" onClick={handleLogin}>Log In to Dashboard</button>
        <p style={{marginTop:'25px', fontSize:'14px'}}>Commuter? <span onClick={()=>navigate('/register')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold'}}>Register Account</span></p>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD (MATCHING FIGMA) ---
const AdminHome = () => {
  const [stats, setStats] = useState({ totalCommuters: 0, pendingApprovals: 0 });
  useEffect(() => { axios.get(`${API_BASE}/admin/stats`).then(res => setStats(res.data)).catch(e=>console.log(e)); }, []);

  return (
    <div className="full-web-layout">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Dashboard</h1><p>Manage and monitor eSakay Gensan system</p></header>
        <div className="stats-grid-web">
          <StatCard label="Total Commuters" value={stats.totalCommuters} color="#2563eb" icon={<FaUsers/>} change="+12%"/>
          <StatCard label="Verified Drivers" value="342" color="#10b981" icon={<FaCar/>} change="+8%"/>
          <StatCard label="Active Vehicles" value="289" color="#8b5cf6" icon={<FaMapMarkerAlt/>} change="Live"/>
          <StatCard label="Pending Approval" value={stats.pendingApprovals} color="#f59e0b" icon={<FaCheck/>} change="Review"/>
        </div>
        <div className="map-placeholder-box">
           <FaMapMarkerAlt size={60} color="#2563eb"/>
           <h3 style={{marginTop:'15px'}}>Real-Time Map View</h3>
           <p style={{color:'#64748b'}}>289 vehicles currently active in General Santos City</p>
           <button className="web-btn-primary" style={{width:'220px', marginTop:'20px'}}>View Full Map</button>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color, icon, change }) => (
  <div className="stat-card-box">
    <div style={{display:'flex', justifyContent:'space-between'}}>
      <div className="icon-sq" style={{background:color, width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyCenter:'center', color:'white'}}>{icon}</div>
      <span className="tag-trend">{change}</span>
    </div>
    <div style={{marginTop:'15px'}}><small style={{color:'#64748b'}}>{label}</small><h3>{value}</h3></div>
  </div>
);

// --- ADMIN USERS CRUD ---
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_BASE}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_BASE}/admin/approve/${id}`); alert("User Approved!"); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete account?")) { await axios.delete(`${API_BASE}/user/${id}`); fetchU(); } };

  return (
    <div className="full-web-layout">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>User Management</h1><p>Handle commuter registrations</p></header>
        <div className="web-table-card">
          <table className="web-full-table">
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td><td>{u.email}</td>
                  <td><span className={`badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td style={{display:'flex', gap:'10px'}}>
                    {!u.isApproved && <button className="btn-approve" onClick={()=>approve(u._id)}>Approve</button>}
                    <button onClick={()=>del(u._id)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><FaTrash/></button>
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

// --- USER DASHBOARD (WIDE VIEW) ---
const Home = () => {
  const navigate = useNavigate();
  const [u, setU] = useState({});
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
  return (
    <div className="full-web-layout">
      <Sidebar user={u}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Welcome back, {u.name}!</h1><p>Access your eSakay Commuter Portal</p></header>
        <div className="user-action-grid">
           <div className="user-action-card" onClick={()=>navigate('/fare')}><div className="icon-box-large bg-green"><FaCalculator/></div><h3>Fare Calculator</h3><p>Estimate trip cost to Fatima Uhaw</p></div>
           <div className="user-action-card" onClick={()=>navigate('/track')}><div className="icon-box-large bg-blue"><FaMapMarkerAlt/></div><h3>Live Tracking</h3><p>Locate tricycles and jeepneys</p></div>
           <div className="user-action-card" onClick={()=>navigate('/profile')}><div className="icon-box-large bg-red"><FaUser/></div><h3>Profile & CRUD</h3><p>Update or delete your account</p></div>
        </div>
      </main>
    </div>
  );
};

// --- BOILERPLATE PAGES ---
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const handleReg = async () => {
    try { await axios.post(`${API_BASE}/register`, form); alert("Registered! Wait for Admin approval."); navigate('/'); }
    catch (err) { alert("Registration failed."); }
  };
  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <h2>Register Account</h2>
        <input className="web-input-field" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="web-input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="web-input-field" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="web-btn-primary" onClick={handleReg}>Sign Up</button>
      </div>
    </div>
  );
};

const Profile = () => ( <div className="full-web-layout"><Sidebar user={JSON.parse(localStorage.getItem('esakay_current'))}/><main className="web-main-content"><h1>Profile CRUD Page</h1></main></div> );
const Fare = () => ( <div className="full-web-layout"><Sidebar user={{role:'user'}}/><main className="web-main-content"><h1>Fare Calculator</h1></main></div> );
const Track = () => ( <div className="full-web-layout"><Sidebar user={{role:'user'}}/><main className="web-content"><h1>Live Vehicle Tracking</h1></main></div> );

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
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
