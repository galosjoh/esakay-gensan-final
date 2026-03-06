import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaCalculator, FaUser, FaBolt, FaCheck, FaTrash, FaMapMarkerAlt, 
  FaRoute, FaShieldAlt, FaSignOutAlt, FaUsers, FaCar, FaBell, FaCreditCard 
} from 'react-icons/fa';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// --- SIDEBAR COMPONENT (Professional Web Style) ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="web-sidebar">
      <div className="sidebar-brand">
         <div className="logo-circle"><FaBolt/></div>
         <div><b>eSakay Gensan</b><br/><small>{isAdmin ? 'Admin Panel' : 'User Terminal'}</small></div>
      </div>
      <div className="sidebar-links-container">
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className="nav-item-web"><FaHome/> Dashboard</NavLink>
            <NavLink to="/admin/users" className="nav-item-web"><FaUsers/> User Management</NavLink>
            <NavLink to="/admin/drivers" className="nav-item-web"><FaCar/> Drivers</NavLink>
            <NavLink to="/admin/routes" className="nav-item-web"><FaRoute/> Routes</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/home" end className="nav-item-web"><FaHome/> Dashboard</NavLink>
            <NavLink to="/fare" className="nav-item-web"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="nav-item-web"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/safety" className="nav-item-web"><FaShieldAlt/> Safety Center</NavLink>
          </>
        )}
        <NavLink to="/profile" className="nav-item-web"><FaUser/> My Profile</NavLink>
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
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      alert(`Welcome, ${res.data.user.name}!`);
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };

  return (
    <div className="web-auth-screen">
      <div className="web-auth-card">
        <FaBolt size={50} color="#2563eb" style={{marginBottom:'15px'}}/>
        <h1>eSakay Web Login</h1>
        {error && <div className="web-error-box">{error}</div>}
        <input className="web-input-field" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input-field" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-primary" onClick={handleLogin}>Log In to Portal</button>
        <p style={{marginTop:'20px', fontSize:'14px'}}>New? <span onClick={()=>navigate('/register')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold'}}>Register</span></p>
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
      alert("Registration Success! Wait for Admin approval.");
      navigate('/');
    } catch (err) { alert("Email already exists."); }
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
        <p onClick={()=>navigate('/')} style={{marginTop:'15px', color:'blue', cursor:'pointer'}}>Back to Login</p>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD (MATCHING FIGMA) ---
const AdminHome = () => {
  return (
    <div className="full-web-page">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <header className="web-header-bar"><h1>Dashboard</h1><p>System Overview & Monitoring</p></header>
        <div className="stats-grid-web">
          <div className="stat-card"> <div className="tag">+12%</div> <small>Total Commuters</small> <h2>12,458</h2> <FaUsers className="stat-icon"/> </div>
          <div className="stat-card"> <div className="tag">+8%</div> <small>Verified Drivers</small> <h2>342</h2> <FaCar className="stat-icon"/> </div>
          <div className="stat-card"> <div className="tag">Live</div> <small>Active Vehicles</small> <h2>289</h2> <FaMapMarkerAlt className="stat-icon"/> </div>
          <div className="stat-card"> <div className="tag" style={{color:'orange'}}>Review</div> <small>Pending Approval</small> <h2>18</h2> <FaCheck className="stat-icon"/> </div>
        </div>
        <div className="map-placeholder-web">
           <FaMapMarkerAlt size={50} color="#2563eb"/>
           <h3>Real-Time Map View</h3>
           <p>Showing active vehicles in General Santos City</p>
        </div>
      </main>
    </div>
  );
};

// --- ADMIN USERS (CRUD) ---
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_URL}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_URL}/admin/approve/${id}`); alert("User Approved!"); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete account?")) { await axios.delete(`${API_URL}/user/${id}`); fetchU(); } };

  return (
    <div className="full-web-page">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-main-content">
        <h1>User Management</h1>
        <div className="web-table-wrapper">
          <table className="web-full-table">
            <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td><td>{u.email}</td><td>{u.mobile}</td>
                  <td><span className={`badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-success" onClick={()=>approve(u._id)}><FaCheck/> Approve</button>}
                    <button onClick={()=>del(u._id)} className="btn-table delete"><FaTrash/></button>
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

// --- USER DASHBOARD (WIDE SCREEN) ---
const UserHome = () => {
  const navigate = useNavigate();
  const [u, setU] = useState({});
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
  return (
    <div className="full-web-page">
      <Sidebar user={u}/>
      <main className="web-main-content">
        <header className="web-header-bar">
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h1>Welcome, {u.name}!</h1>
            <FaBell size={24} color="#64748b"/>
          </div>
          <p>📍 Barangay Fatima Uhaw, Gen. Santos City</p>
        </header>
        <div className="user-web-grid">
           <div className="user-web-card" onClick={()=>navigate('/fare')}><div className="icon-circ bg-green"><FaCalculator/></div><h3>Fare Calculator</h3><p>Estimate trip cost instantly</p></div>
           <div className="user-web-card" onClick={()=>navigate('/track')}><div className="icon-circ bg-blue"><FaMapMarkerAlt/></div><h3>Live Tracking</h3><p>Locate vehicles in real-time</p></div>
           <div className="user-web-card" onClick={()=>navigate('/profile')}><div className="icon-circ bg-red"><FaUser/></div><h3>My Profile</h3><p>Update your information</p></div>
           <div className="user-web-card" onClick={()=>alert('Booking soon!')}><div className="icon-circ bg-orange"><FaCreditCard/></div><h3>Cashless Payment</h3><p>Pay via GCash/Maya</p></div>
        </div>
      </main>
    </div>
  );
};

// --- PROFILE CRUD ---
const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  useEffect(() => { const d = JSON.parse(localStorage.getItem('esakay_current')) || {}; setUser(d); setName(d.name); }, []);
  const update = async () => {
    const res = await axios.put(`${API_URL}/user/${user._id}`, { name });
    localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
    alert("Updated!");
  };
  return (
    <div className="full-web-page">
      <Sidebar user={user}/>
      <main className="web-content-body">
        <h1>Profile Settings</h1>
        <div className="web-table-wrapper" style={{maxWidth:'500px', padding:'30px'}}>
           <label>Edit Full Name</label>
           <input className="web-input-field" value={name} onChange={e=>setName(e.target.value)}/>
           <button className="web-btn-primary" onClick={update}>Save Changes</button>
        </div>
      </main>
    </div>
  );
};

// Route Placeholders
const Fare = () => ( <div className="full-web-page"><Sidebar user={{role:'user'}}/><main className="web-main-content"><h1>Fare Calculator</h1><button onClick={()=>window.history.back()}>Back</button></main></div> );
const Track = () => ( <div className="full-web-page"><Sidebar user={{role:'user'}}/><main className="web-main-content"><h1>Live Tracking</h1><button onClick={()=>window.history.back()}>Back</button></main></div> );

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

const AppWrapper = () => (<Router><App /></Router>);
export default AppWrapper;
