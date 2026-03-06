import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaCalculator, FaUser, FaBolt, FaCheck, FaTrash, FaMapMarkerAlt, 
  FaRoute, FaShieldAlt, FaSignOutAlt, FaUsers, FaCar, FaBell 
} from 'react-icons/fa';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// --- SHARED SIDEBAR COMPONENT ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="web-sidebar">
      <div className="sidebar-logo"><FaBolt/> eSakay Portal</div>
      <div className="sidebar-nav-group">
        <NavLink to={isAdmin ? "/admin" : "/home"} end className="web-nav-item"><FaHome/> Dashboard</NavLink>
        {isAdmin ? (
          <>
            <NavLink to="/admin/users" className="web-nav-item"><FaUsers/> User Management</NavLink>
            <NavLink to="/admin/drivers" className="web-nav-item"><FaCar/> Drivers</NavLink>
            <NavLink to="/admin/routes" className="web-nav-item"><FaRoute/> Routes</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/fare" className="web-nav-item"><FaCalculator/> Fare Calculator</NavLink>
            <NavLink to="/track" className="web-nav-item"><FaMapMarkerAlt/> Live Tracking</NavLink>
            <NavLink to="/safety" className="web-nav-item"><FaShieldAlt/> Safety Center</NavLink>
          </>
        )}
        <NavLink to="/profile" className="web-nav-item"><FaUser/> My Profile</NavLink>
      </div>
      <button className="btn-logout-web" onClick={() => { localStorage.clear(); window.location.href='/'; }}><FaSignOutAlt/> Logout Portal</button>
    </div>
  );
};

// --- 1. LOGIN PAGE ---
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
      <div className="auth-card-web">
        <FaBolt size={40} color="#2563eb" style={{marginBottom:'15px'}}/>
        <h2>eSakay Portal Login</h2>
        {error && <div className="err-box-web">{error}</div>}
        <input className="web-input" type="email" placeholder="Email Address" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="web-btn-blue" onClick={handleLogin}>Login to System</button>
        <p style={{marginTop:'20px', fontSize:'14px'}}>New user? <span style={{color:'blue', cursor:'pointer'}} onClick={()=>navigate('/register')}>Register here</span></p>
      </div>
    </div>
  );
};

// --- 2. REGISTER PAGE ---
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const handleReg = async () => {
    try {
      await axios.post(`${API_URL}/register`, form);
      alert("Registration Success! Wait for admin approval.");
      navigate('/');
    } catch (err) { alert("Registration failed."); }
  };
  return (
    <div className="auth-full-page">
      <div className="auth-card-web">
        <h2>Create Account</h2>
        <input className="web-input" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="web-input" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="web-input" placeholder="Mobile" onChange={e=>setForm({...form, mobile:e.target.value})}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/>
        <button className="web-btn-blue" onClick={handleReg}>Sign Up</button>
        <p className="auth-toggle" style={{marginTop:'15px', color:'blue', cursor:'pointer'}} onClick={()=>navigate('/')}>Back to Login</p>
      </div>
    </div>
  );
};

// --- 3. ADMIN DASHBOARD ---
const Admin = () => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => { const res = await axios.get(`${API_URL}/admin/users`); setUsers(res.data); };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_URL}/admin/approve/${id}`); alert("User Approved!"); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete account?")) { await axios.delete(`${API_URL}/user/${id}`); fetchU(); } };

  return (
    <div className="web-layout-main">
      <Sidebar user={{role:'admin'}}/>
      <main className="web-body">
        <header className="web-header"><h1>Admin: User Management</h1></header>
        <div className="web-table-card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.isApproved ? 'approved' : 'pending'}`}>{u.isApproved ? 'Approved' : 'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-success" onClick={()=>approve(u._id)}><FaCheck/> Approve</button>}
                    <button className="btn-danger" onClick={()=>del(u._id)} style={{marginLeft:'10px'}}><FaTrash/></button>
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

// --- 4. USER DASHBOARD ---
const Home = () => {
  const [u, setU] = useState({});
  const navigate = useNavigate();
  useEffect(() => { setU(JSON.parse(localStorage.getItem('esakay_current')) || {}); }, []);
  return (
    <div className="web-layout-main">
      <Sidebar user={{role:'user'}}/>
      <main className="web-body">
        <header className="web-header">
           <div style={{display:'flex', justifyContent:'space-between'}}>
              <h1>Welcome, {u.name}!</h1>
              <FaBell size={24} color="#666"/>
           </div>
           <p>📍 Barangay Fatima Uhaw, General Santos City</p>
        </header>
        <div className="stats-grid">
           <div className="stat-card-web" onClick={()=>navigate('/fare')}><h3>Fare Calculator</h3><p>Estimate trip cost</p></div>
           <div className="stat-card-web" onClick={()=>navigate('/track')} style={{background:'#3b82f6'}}><h3>Live Tracking</h3><p>Locate vehicles</p></div>
        </div>
      </main>
    </div>
  );
};

// --- 5. PROFILE PAGE (CRUD) ---
const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState('');
  useEffect(() => { 
    const d = JSON.parse(localStorage.getItem('esakay_current')) || {}; 
    setUser(d); setName(d.name); 
  }, []);

  const update = async () => {
    const res = await axios.put(`${API_URL}/user/${user._id}`, { name });
    localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
    setUser(res.data.user);
    alert("Profile Updated!");
  };

  return (
    <div className="web-layout-main">
      <Sidebar user={user}/>
      <main className="web-body">
        <h1>Account Settings</h1>
        <div className="web-table-card" style={{maxWidth:'500px', padding:'30px'}}>
           <label style={{display:'block', marginBottom:'10px', fontWeight:'bold'}}>Edit Full Name</label>
           <input className="web-input" value={name} onChange={e=>setName(e.target.value)}/>
           <button className="web-btn-blue" onClick={update}>Save Changes</button>
        </div>
      </main>
    </div>
  );
};

// Placeholders para sa routes
const Fare = () => ( <div className="web-layout-main"><Sidebar user={{role:'user'}}/><main className="web-body"><h1>Fare Calculator Feature</h1></main></div> );
const Track = () => ( <div className="web-layout-main"><Sidebar user={{role:'user'}}/><main className="web-body"><h1>Live Tracking Feature</h1></main></div> );

function App() {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/fare" element={<Fare />} />
      <Route path="/track" element={<Track />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

const AppWrapper = () => (<Router><App /></Router>);
export default AppWrapper;
