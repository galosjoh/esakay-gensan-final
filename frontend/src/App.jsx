import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  FaBolt, FaThLarge, FaUsers, FaCar, FaMapMarkerAlt, FaRoute, 
  FaCalculator, FaShieldAlt, FaFileAlt, FaCreditCard, FaCog, FaCheck, FaTrash, FaSignOutAlt 
} from 'react-icons/fa';
import './App.css';

const API_BASE = 'https://esakay-gensan-final.onrender.com/api';

// --- SIDEBAR COMPONENT (MATCHING FIGMA) ---
const WebSidebar = ({ isAdmin }) => (
  <div className="sidebar-web">
    <div className="sidebar-brand">
       <div className="logo-circle"><FaBolt/></div>
       <div><b>eSakay Gensan</b><br/><small>Admin Panel</small></div>
    </div>
    <div className="sidebar-nav">
      <NavLink to={isAdmin ? "/admin" : "/home"} end className="nav-item-web"><FaThLarge/> Dashboard</NavLink>
      {isAdmin ? (
        <>
          <NavLink to="/admin/users" className="nav-item-web"><FaUsers/> Users</NavLink>
          <NavLink to="/admin/drivers" className="nav-item-web"><FaCar/> Drivers</NavLink>
          <NavLink to="/admin/routes" className="nav-item-web"><FaRoute/> Routes</NavLink>
          <NavLink to="/admin/fares" className="nav-item-web"><FaCalculator/> Fares</NavLink>
        </>
      ) : (
        <>
          <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calc</NavLink>
          <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Track</NavLink>
        </>
      )}
    </div>
    <button className="btn-logout-web" onClick={() => { localStorage.clear(); window.location.href='/'; }}>
      <FaSignOutAlt/> Logout Portal
    </button>
  </div>
);

// --- ADMIN DASHBOARD (FIGMA STYLE) ---
const AdminHome = () => {
  const [stats, setStats] = useState({});
  useEffect(() => { axios.get(`${API_BASE}/admin/stats`).then(res => setStats(res.data)); }, []);

  return (
    <div className="web-layout">
      <WebSidebar isAdmin={true}/>
      <main className="web-content">
        <header className="content-header"><h1>Dashboard</h1><p>Manage and monitor eSakay Gensan system</p></header>
        <div className="stats-grid-web">
          <StatCard label="Total Commuters" value={stats.totalCommuters} color="#2563eb" icon={<FaUsers/>} change="+12%"/>
          <StatCard label="Verified Drivers" value="342" color="#10b981" icon={<FaCar/>} change="+8%"/>
          <StatCard label="Active Vehicles" value="289" color="#8b5cf6" icon={<FaMapMarkerAlt/>} change="Live"/>
          <StatCard label="Pending Approval" value={stats.pendingApprovals} color="#f59e0b" icon={<FaCheck/>} change="Review"/>
        </div>
        <div className="map-placeholder-web">
           <FaMapMarkerAlt size={50} color="#2563eb"/>
           <h3>Real-Time Map View</h3>
           <p>289 vehicles currently active in General Santos City</p>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color, icon, change }) => (
  <div className="web-stat-card">
    <div className="stat-row">
      <div className="icon-sq" style={{background:color}}>{icon}</div>
      <span className="trend-tag">{change}</span>
    </div>
    <small>{label}</small>
    <h2>{value}</h2>
  </div>
);

// --- USER MANAGEMENT (CRUD) ---
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_BASE}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_BASE}/admin/approve/${id}`); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete user?")) { await axios.delete(`${API_BASE}/user/${id}`); fetchU(); } };

  return (
    <div className="web-layout">
      <WebSidebar isAdmin={true}/>
      <main className="web-content">
        <h1>User Management</h1>
        <div className="table-card-web">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td><span className={`badge-web ${u.isApproved ? 'active' : 'pending'}`}>{u.isApproved ? 'Approved' : 'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-table approve" onClick={()=>approve(u._id)}>Approve</button>}
                    <button className="btn-table delete" onClick={()=>del(u._id)}><FaTrash/></button>
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

// --- AUTH PAGES ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (err) { alert(err.response?.data?.message || "Login failed"); }
  };
  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt className="logo-main"/>
        <h1>eSakay Portal</h1>
        <input className="web-input" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="btn-primary-web" onClick={handleLogin}>Log In</button>
        <p onClick={()=>navigate('/register')} style={{marginTop:'20px', cursor:'pointer', color:'blue'}}>Register Account</p>
      </div>
    </div>
  );
};

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name:'', email:'', mobile:'', password:'' });
    const handleReg = async () => {
      try { await axios.post(`${API_BASE}/register`, form); alert("Registered! Wait for Admin approval."); navigate('/'); }
      catch (err) { alert("Email already exists."); }
    };
    return (
      <div className="web-auth-screen">
        <div className="web-auth-card">
          <h2>Create Account</h2>
          <input className="web-input" placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})}/>
          <input className="web-input" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="web-input" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/>
          <input className="web-input" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
          <button className="btn-primary-web" onClick={handleReg}>Register</button>
        </div>
      </div>
    );
};

// --- USER DASHBOARD ---
const Home = () => {
    const [u, setU] = useState({});
    useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
    return (
      <div className="web-layout">
        <WebSidebar isAdmin={false}/>
        <main className="web-content">
          <h1>Welcome, {u.name}!</h1>
          <div className="web-grid-user">
             <div className="user-card-web"><h3>Fare Calculator</h3><p>Estimate trip cost</p></div>
             <div className="user-card-web"><h3>Live Tracking</h3><p>Locate vehicles</p></div>
          </div>
        </main>
      </div>
    );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);
