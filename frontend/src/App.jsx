import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, Navigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalculator, FaUser, FaBolt, FaCheck, FaTrash, FaMapMarkerAlt, FaSignOutAlt, FaBell } from 'react-icons/fa';
import './App.css';

const API_URL = 'https://esakay-gensan-final.onrender.com/api';

// --- SIDEBAR ---
const Sidebar = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  return (
    <div className="web-sidebar">
      <div className="web-logo"><FaBolt/> eSakay Web</div>
      <div className="nav-group">
        <NavLink to={isAdmin ? "/admin" : "/home"} className="web-nav-item"><FaHome/> Dashboard</NavLink>
        {!isAdmin && (
          <>
            <NavLink to="/fare" className="web-nav-item"><FaCalculator/> Fare Calc</NavLink>
            <NavLink to="/track" className="web-nav-item"><FaMapMarkerAlt/> Tracking</NavLink>
          </>
        )}
        <NavLink to="/profile" className="web-nav-item"><FaUser/> My Profile</NavLink>
      </div>
      <button className="btn-logout" onClick={() => { localStorage.clear(); window.location.href='/'; }}>Logout</button>
    </div>
  );
};

// --- LOGIN ---
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      res.data.user.role === 'admin' ? navigate('/admin') : navigate('/home');
    } catch (e) { setErr(e.response?.data?.message || "Login Failed"); }
  };

  return (
    <div className="full-auth-page">
      <div className="auth-card">
        <h2>Sign In</h2>
        {err && <p style={{color:'red', fontSize:'12px'}}>{err}</p>}
        <input className="web-input" placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
        <input className="web-input" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
        <button className="btn-primary" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const Admin = ({ user }) => {
  const [users, setUsers] = useState([]);
  const fetchU = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data);
    } catch (e) { console.log("Error loading users"); }
  };
  useEffect(() => { fetchU(); }, []);
  const approve = async (id) => { await axios.put(`${API_URL}/admin/approve/${id}`); alert("Approved!"); fetchU(); };
  const del = async (id) => { if(window.confirm("Delete?")) { await axios.delete(`${API_URL}/user/${id}`); fetchU(); } };

  return (
    <div className="web-layout">
      <Sidebar user={user}/>
      <main className="web-main">
        <h1>Admin Control Panel</h1>
        <div className="table-card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td>
                  <td><span className={`badge ${u.isApproved?'approved':'pending'}`}>{u.isApproved?'Approved':'Pending'}</span></td>
                  <td>
                    {!u.isApproved && <button className="btn-success" onClick={()=>approve(u._id)}><FaCheck/></button>}
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

// --- USER HOME ---
const Home = ({ user }) => {
  return (
    <div className="web-layout">
      <Sidebar user={user}/>
      <main className="web-main">
        <h1>Welcome, {user?.name}!</h1>
        <p>Gensan Smart Mobility Dashboard</p>
      </main>
    </div>
  );
};

// --- WRAPPER PARA SA LOOP FIX ---
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const data = localStorage.getItem('esakay_current');
    if (data) setUser(JSON.parse(data));
    setLoading(false);
  }, [location]);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={user ? <Home user={user} /> : <Navigate to="/" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <Admin user={user} /> : <Navigate to="/" />} />
      <Route path="/register" element={<Login />} /> {/* Placeholder */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default () => (<Router><App /></Router>);
