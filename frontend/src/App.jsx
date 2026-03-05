import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  FaHome, FaMapMarkerAlt, FaCalculator, FaRoute, FaShieldAlt, FaUsers, 
  FaBell, FaUser, FaGoogle, FaEnvelope, FaLock, FaEye, FaArrowLeft, 
  FaTicketAlt, FaBolt, FaSignOutAlt, FaThumbsUp, FaComment, FaPaperPlane,
  FaCreditCard, FaBus, FaMotorcycle, FaCar, FaExclamationTriangle, FaShareAlt, FaStar, FaFileAlt,
  FaPhone, FaMapPin, FaClock, FaChevronRight, FaExclamationCircle, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import './App.css';

// Palitan ang lines 13-15 nito:
const API_BASE = 'https://esakay-gensan-final.onrender.com/api';
  
// ==========================================
// 1. LOGIN PAGE
// ==========================================
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@esakay.com');
  const [password, setPassword] = useState('admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if(!email || !password) return alert("Please fill all fields");
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email: email,
        password: password
      });
      console.log("Login Success:", res.data);
      localStorage.setItem('esakay_token', res.data.token);
      localStorage.setItem('esakay_current', JSON.stringify(res.data.user));
      alert("Login Successful!");
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('esakay_current', JSON.stringify({
      _id: 'guest',
      name: 'Guest User',
      email: 'guest@esakay.com',
      role: 'user'
    }));
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-box"><FaBolt size={40}/></div>
      <div style={{textAlign:'center', marginBottom:'30px'}}>
        <h2 style={{fontSize:'20px', fontWeight:'700', color:'#333'}}>eSakay Gensan</h2>
        <p style={{color:'#888', fontSize:'12px'}}>Smart, Safe & Connected Transport</p>
      </div>
      {error && <div style={{background:'#ffebee', color:'#c33', padding:'10px', borderRadius:'8px', marginBottom:'15px', fontSize:'12px', textAlign:'center'}}>{error}</div>}
      
      <div className="input-wrap">
        <FaEnvelope className="input-icon"/>
        <input 
          className="auth-input" 
          type="email" 
          placeholder="youremail@example.com" 
          value={email}
          onChange={(e)=>setEmail(e.target.value)} 
        />
      </div>
      <div className="input-wrap">
        <FaLock className="input-icon"/>
        <input 
          className="auth-input" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e)=>setPassword(e.target.value)} 
        />
        <FaEye className="input-eye"/>
      </div>
      <div style={{textAlign:'right', fontSize:'11px', color:'#0056b3', fontWeight:'600', marginBottom:'20px', cursor:'pointer'}}>Forgot Password?</div>
      
      <button className="btn-auth" onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <div style={{textAlign:'center', margin:'15px 0', fontSize:'12px', color:'#aaa'}}>or</div>
      
      <button className="social-btn"><FaGoogle color="#EA4335"/> Continue with Google</button>
      
      <button 
        className="social-btn" 
        style={{background:'#f5f5f5', color:'#333', marginTop:'10px'}}
        onClick={handleGuestLogin}
      >
        👤 Continue as Guest
      </button>

      <div style={{textAlign:'center', marginTop:'25px', fontSize:'12px'}}>
        Don't have an account? <span style={{color:'#0056b3', fontWeight:'bold', cursor:'pointer'}} onClick={()=>navigate('/register')}>Create Account</span>
      </div>

      <div style={{marginTop:'20px', padding:'15px', background:'#e3f2fd', borderRadius:'8px', fontSize:'11px', color:'#1976d2'}}>
        <strong>Demo Accounts:</strong><br/>
        Admin: admin@esakay.com / admin12345<br/>
        User: user@esakay.com / password123
      </div>
    </div>
  );
};

// ==========================================
// 2. REGISTER PAGE
// ==========================================
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    userType: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if(!formData.name || !formData.email || !formData.password) {
      return alert("Please fill all required fields");
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        role: formData.userType
      });
      alert("Account Created Successfully! Please Login.");
      navigate('/'); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Email might be already used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-box" style={{background:'#00c853'}}>📝</div>
      <div style={{textAlign:'center', marginBottom:'30px'}}>
        <h2 style={{fontSize:'18px'}}>Create Account</h2>
        <p style={{color:'#888', fontSize:'12px'}}>Join eSakay Gensan today</p>
      </div>
      {error && <div style={{background:'#ffebee', color:'#c33', padding:'10px', borderRadius:'8px', marginBottom:'15px', fontSize:'12px'}}>{error}</div>}
      
      <div className="input-wrap">
        <FaUser className="input-icon"/>
        <input 
          className="auth-input" 
          type="text" 
          name="name"
          placeholder="Full Name" 
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="input-wrap">
        <FaEnvelope className="input-icon"/>
        <input 
          className="auth-input" 
          type="email" 
          name="email"
          placeholder="Email Address" 
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div className="input-wrap">
        <FaPhone className="input-icon"/>
        <input 
          className="auth-input" 
          type="tel"
          name="mobile"
          placeholder="Mobile Number" 
          value={formData.mobile}
          onChange={handleChange}
        />
      </div>
      <div className="input-wrap">
        <FaLock className="input-icon"/>
        <input 
          className="auth-input" 
          type="password" 
          name="password"
          placeholder="Password (min 6 chars)" 
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <label style={{fontSize:'12px', fontWeight:'600', color:'#333', marginTop:'15px', display:'block', marginBottom:'8px'}}>Account Type</label>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <button 
          className={`toggle-btn ${formData.userType === 'user' ? 'active' : ''}`}
          onClick={() => setFormData({...formData, userType: 'user'})}
          style={{flex:1}}
        >
          Commuter
        </button>
        <button 
          className={`toggle-btn ${formData.userType === 'driver' ? 'active' : ''}`}
          onClick={() => setFormData({...formData, userType: 'driver'})}
          style={{flex:1}}
        >
          Driver
        </button>
      </div>

      <button className="btn-auth" onClick={handleRegister} disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <div style={{textAlign:'center', marginTop:'20px', fontSize:'12px'}}>
        Already have an account? <span style={{color:'#0056b3', fontWeight:'bold', cursor:'pointer'}} onClick={()=>navigate('/')}>Login</span>
      </div>
    </div>
  );
};

// ==========================================
// 3. HOME PAGE
// ==========================================
const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('esakay_current'));
    if(user && user.name) {
      setUserName(user.name);
      setUserRole(user.role || 'user');
    }
  }, []);

  return (
    <div>
      <div className="page-header header-blue">
        <div className="header-nav">
          <div><div style={{fontWeight:'700'}}>eSakay Gensan</div><div style={{fontSize:'11px', opacity:0.8}}>v1.0.0</div></div>
          <div style={{display:'flex', gap:'10px', cursor:'pointer'}}><FaBell size={18}/><FaUser size={18} onClick={()=>navigate('/profile')}/></div>
        </div>
        <div className="welcome-card">
           <div style={{fontSize:'12px', opacity:0.9}}>Welcome back,</div>
           <div style={{fontSize:'20px', fontWeight:'700', marginBottom:'5px'}}>{userName}</div>
           <div style={{fontSize:'12px', opacity:0.9, display:'flex', alignItems:'center', gap:'5px'}}><FaMapMarkerAlt/> Brgy. Fatima Uhaw, Gen. Santos</div>
        </div>
      </div>

      <div style={{padding:'20px', fontSize:'14px', fontWeight:'600', color:'#444'}}>Quick Actions</div>
      <div className="quick-grid">
         <QuickBtn icon={<FaMapMarkerAlt/>} color="c-blue" label="Track Vehicle" onClick={()=>navigate('/track')}/>
         <QuickBtn icon={<FaCalculator/>} color="c-green" label="Fare Calc" onClick={()=>navigate('/fare')}/>
         <QuickBtn icon={<FaRoute/>} color="c-purple" label="Find Route" onClick={()=>navigate('/routes')}/>
         <QuickBtn icon={<FaCreditCard/>} color="c-orange" label="Payment" onClick={()=>navigate('/payment')}/>
         <QuickBtn icon={<FaShieldAlt/>} color="c-red" label="Safety" onClick={()=>navigate('/safety')}/>
         <QuickBtn icon={<FaUsers/>} color="c-teal" label="Community" onClick={()=>navigate('/community')}/>
      </div>
      
      <div style={{padding:'0 20px 20px'}}>
         <button className="btn-sos-wide" onClick={()=>navigate('/safety')}><FaShieldAlt size={18}/> 🆘 EMERGENCY SOS</button>
      </div>

      <div style={{padding:'0 20px 10px', fontSize:'14px', fontWeight:'600', color:'#444'}}>Recent Trips</div>
      <div style={{padding:'0 20px'}}>
         <TripItem from="Brgy. Fatima Uhaw" to="City Hall" time="2 hours ago" price="25.00" type="Tricycle" status="completed"/>
         <TripItem from="City Hall" to="Gaisano Mall" time="1 day ago" price="12.00" type="Jeepney" status="completed"/>
      </div>
    </div>
  );
};

const QuickBtn = ({icon, color, label, onClick}) => (
   <div className="q-card" onClick={onClick}>
      <div className={`q-icon ${color}`}>{icon}</div>
      <span style={{fontSize:'10px', fontWeight:'500'}}>{label}</span>
   </div>
);

const TripItem = ({from, to, time, price, type, status}) => (
   <div style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', display:'flex', justifyContent:'space-between', boxShadow:'0 2px 5px rgba(0,0,0,0.03)'}}>
      <div style={{display:'flex', gap:'10px'}}>
         <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'5px', gap:'2px'}}><div className="dot-green"></div><div style={{width:'1px', height:'15px', background:'#ddd'}}></div><div className="dot-red"></div></div>
         <div><div style={{fontSize:'12px', fontWeight:'600'}}>{from}</div><div style={{fontSize:'12px', fontWeight:'600'}}>{to}</div><div style={{fontSize:'10px', color:'#999'}}>{time}</div></div>
      </div>
      <div style={{textAlign:'right'}}><div style={{color:'#0056b3', fontWeight:'700'}}>₱{price}</div><div style={{fontSize:'10px', color:'#777'}}>{type}</div></div>
   </div>
);

// ==========================================
// 4. TRACK PAGE
// ==========================================
const Track = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vehicles`);
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header header-blue">
         <div className="header-nav"><FaArrowLeft onClick={()=>navigate('/home')}/> <div>Live Tracking</div><div></div></div>
      </div>
      <div className="map-box">
        <iframe className="map-iframe" src="https://www.openstreetmap.org/export/embed.html?bbox=125.1300,6.0900,125.1600,6.1200&layer=mapnik" title="GenSan Map"></iframe>
      </div>
      <div style={{padding:'20px'}}>
         <div style={{fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}>Nearby Vehicles ({vehicles.length})</div>
         {loading ? (
           <p style={{color:'#999'}}>Loading vehicles...</p>
         ) : vehicles.length > 0 ? (
           vehicles.map((v, i) => (
             <VehicleCard 
               key={i}
               plate={v.plateNumber || 'ABC-1234'} 
               route={v.route || 'City Hall - Bulaong'} 
               time={v.eta || '5 min'} 
               color={v.color || '#00c853'} 
               type={v.type || 'Jeepney'}
               driver={v.driver || 'Driver'}
               rating={v.rating || 4.5}
             />
           ))
         ) : (
           <p style={{color:'#999'}}>No vehicles available</p>
         )}
      </div>
    </div>
  );
};

const VehicleCard = ({plate, route, time, color, type, driver, rating}) => (
   <div className="vehicle-card">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div><div style={{fontWeight:'bold', fontSize:'14px'}}><span style={{background:color, color:'white', fontSize:'10px', padding:'2px 6px', borderRadius:'4px', marginRight:'5px'}}>{type}</span> {plate}</div><div style={{fontSize:'12px', color:'#666'}}>{route}</div></div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'#0056b3', fontWeight:'bold', fontSize:'12px'}}>{time}</div>
          <div style={{fontSize:'10px', color:'#f39c12'}}>⭐ {rating}</div>
        </div>
      </div>
   </div>
);

// ==========================================
// 5. FARE CALCULATOR PAGE
// ==========================================
const Fare = () => {
  const navigate = useNavigate();
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [vType, setVType] = useState('Tricycle');
  const [pType, setPType] = useState('Regular');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedFares, setSavedFares] = useState([]);

  useEffect(() => {
    fetchSavedFares();
  }, []);

  const fetchSavedFares = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('esakay_current'));
      const res = await axios.get(`${API_BASE}/fares/${currentUser._id}`);
      setSavedFares(res.data || []);
    } catch (err) {
      console.error('Error fetching fares:', err);
    }
  };

  const handleCalc = async () => {
    if (!startPoint || !destination) {
      return alert('Please enter Start Point and Destination');
    }

    setLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('esakay_current')) || {};
      
      const baseFare = vType === 'Tricycle' ? 25 : vType === 'Bus' ? 12 : 15;
      let fare = baseFare;
      
      if (pType === 'Student') fare = fare * 0.75; 
      if (pType === 'Senior') fare = fare * 0.80;

      const calculatedFare = Math.round(fare * 100) / 100;
      setResult(calculatedFare);

      // Save to backend
      const response = await axios.post(`${API_BASE}/fare`, {
        userId: currentUser._id || 'guest',
        userName: currentUser.name || 'Guest User',
        startPoint: startPoint,
        destination: destination,
        vehicleType: vType,
        passengerType: pType,
        calculatedFare: calculatedFare,
        timestamp: new Date()
      });

      console.log('Fare saved:', response.data);
      fetchSavedFares();

    } catch (err) {
      console.error('Error calculating fare:', err);
      alert('Error: Could not calculate fare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header header-green">
        <div className="header-nav">
          <FaArrowLeft onClick={() => navigate('/home')} /> 
          <div>Fare Calculator</div>
          <div></div>
        </div>
      </div>
      <div className="fare-container">
        <label className="f-label">📍 From</label>
        <input 
          className="f-input" 
          placeholder="Start Point (e.g., Fatima Uhaw)" 
          value={startPoint} 
          onChange={(e) => setStartPoint(e.target.value)} 
        />

        <label className="f-label">📍 To</label>
        <input 
          className="f-input" 
          placeholder="Destination (e.g., City Hall)" 
          value={destination} 
          onChange={(e) => setDestination(e.target.value)} 
        />

        <label className="f-label">🚗 Vehicle Type</label>
        <div className="toggle-group">
          {['Jeepney', 'Tricycle', 'Bus'].map(v => (
            <button key={v} className={`toggle-btn ${vType === v ? 'active' : ''}`} onClick={() => setVType(v)}>{v}</button>
          ))}
        </div>

        <label className="f-label">👤 Passenger Type</label>
        <div className="toggle-group">
          {['Regular', 'Student', 'Senior'].map(p => (
            <button key={p} className={`toggle-btn ${pType === p ? 'active' : ''}`} onClick={() => setPType(p)}>{p}</button>
          ))}
        </div>

        <button 
          className={`calc-btn ${result ? 'ready' : ''}`} 
          onClick={handleCalc} 
          disabled={loading}
        >
          {loading ? '⏳ Calculating...' : result ? `✅ Estimated Fare: ₱${result.toFixed(2)}` : '📊 Calculate Fare'}
        </button>

        {result && (
          <div style={{marginTop:'15px', padding:'15px', background:'#e8f5e9', borderRadius:'8px', fontSize:'12px'}}>
            <div style={{marginBottom:'10px'}}><strong>Trip Details:</strong></div>
            <div>From: {startPoint}</div>
            <div>To: {destination}</div>
            <div>Vehicle: {vType}</div>
            <div style={{marginTop:'10px', fontWeight:'bold', color:'#00c853'}}>Total Fare: ₱{result.toFixed(2)}</div>
          </div>
        )}
      </div>

      {savedFares.length > 0 && (
        <div style={{padding:'20px'}}>
          <h3 style={{fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}>Recent Calculations</h3>
          {savedFares.slice(0, 3).map((f, i) => (
            <div key={i} style={{background:'white', padding:'10px', borderRadius:'8px', marginBottom:'8px', fontSize:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
              <div>{f.startPoint} → {f.destination}</div>
              <div style={{color:'#0056b3', fontWeight:'bold'}}>₱{f.calculatedFare}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. ROUTES PAGE
// ==========================================
const RoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([
    { id: 1, name: 'Route 1', from: 'Fatima Uhaw', to: 'City Hall', vehicles: 5, time: '15 mins' },
    { id: 2, name: 'Route 2', from: 'Terminal', to: 'Gaisano', vehicles: 3, time: '20 mins' },
    { id: 3, name: 'Route 3', from: 'Airport', to: 'City Center', vehicles: 2, time: '25 mins' }
  ]);

  return (
    <div>
      <div className="page-header header-purple">
         <div className="header-nav"><FaArrowLeft onClick={()=>navigate('/home')}/> <div>Route Finder</div><div></div></div>
      </div>
      <div className="fare-container">
         <div className="route-input-group"><FaMapMarkerAlt color="#00c853" className="route-icon"/><input className="route-input" placeholder="Start Point"/></div>
         <div className="route-input-group"><FaMapMarkerAlt color="#d32f2f" className="route-icon"/><input className="route-input" placeholder="Destination"/></div>
         <button className="calc-btn">Find Routes</button>
      </div>

      <div className="traffic-alert">
         <FaExclamationTriangle color="#e65100"/><div style={{fontSize:'12px', color:'#e65100'}}><strong>⚠️ Heavy Traffic</strong> on Polomolok Highway - 30 min delay</div>
      </div>

      <div style={{padding:'20px'}}>
        <h3 style={{fontSize:'14px', fontWeight:'bold', marginBottom:'15px'}}>Available Routes</h3>
        {routes.map(route => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
};

const RouteCard = ({ route }) => (
  <div style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
    <div style={{fontWeight:'bold', fontSize:'13px', marginBottom:'8px'}}>{route.name}</div>
    <div style={{fontSize:'12px', color:'#666', marginBottom:'5px'}}><FaMapPin size={11}/> {route.from} → {route.to}</div>
    <div style={{fontSize:'12px', color:'#666', marginBottom:'10px'}}><FaClock size={11}/> ~{route.time}</div>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <span style={{fontSize:'11px', background:'#e8f5e9', padding:'4px 8px', borderRadius:'4px', color:'#2e7d32'}}>
        🚌 {route.vehicles} vehicles available
      </span>
      <FaChevronRight size={14} color='#0056b3' />
    </div>
  </div>
);

// ==========================================
// 7. PAYMENT PAGE
// ==========================================
const Payment = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [amount, setAmount] = useState('100.00');

  const handlePayment = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('esakay_current'));
      const res = await axios.post(`${API_BASE}/payment`, {
        userId: currentUser._id,
        userName: currentUser.name,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod,
        timestamp: new Date()
      });
      alert('Payment processed successfully!');
      navigate('/home');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed');
    }
  };

  return (
    <div>
      <div className="page-header header-orange">
        <div className="header-nav">
          <FaArrowLeft onClick={() => navigate('/home')} /> 
          <div>Payment</div>
          <div></div>
        </div>
      </div>
      <div className="fare-container">
        <label className="f-label">💰 Amount</label>
        <input 
          className="f-input" 
          type="number" 
          placeholder="100.00" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />

        <label className="f-label">💳 Payment Method</label>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {[
            { id: 'gcash', name: '₱ GCash', icon: '📱' },
            { id: 'maya', name: '₱ Maya', icon: '💳' },
            { id: 'beep', name: '🎫 Beep Card', icon: '🎫' },
            { id: 'cash', name: '💵 Cash on Boarding', icon: '💵' }
          ].map(method => (
            <button
              key={method.id}
              className={`payment-option ${paymentMethod === method.id ? 'active' : ''}`}
              onClick={() => setPaymentMethod(method.id)}
              style={{
                padding: '15px',
                border: paymentMethod === method.id ? '2px solid #0056b3' : '1px solid #ddd',
                borderRadius: '8px',
                background: paymentMethod === method.id ? '#e3f2fd' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {method.icon} {method.name}
            </button>
          ))}
        </div>

        <button 
          className="calc-btn" 
          onClick={handlePayment}
          style={{marginTop:'20px'}}
        >
          ✅ Complete Payment - ₱{amount}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. SAFETY PAGE
// ==========================================
const Safety = () => {
  const navigate = useNavigate();
  const [sosActive, setSosActive] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: 'unsafe-driving',
    vehicleNumber: '',
    location: '',
    description: ''
  });

  const handleSOS = async () => {
    setSosActive(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('esakay_current'));
      await axios.post(`${API_BASE}/sos`, {
        userId: currentUser._id,
        userName: currentUser.name,
        location: 'Current Location',
        timestamp: new Date()
      });
      alert('🚨 SOS Alert Sent! Help is on the way!');
      setTimeout(() => setSosActive(false), 3000);
    } catch (err) {
      alert('Failed to send SOS');
    }
  };

  const handleReport = async () => {
    if (!reportForm.location || !reportForm.description) {
      return alert('Please fill all fields');
    }
    try {
      const currentUser = JSON.parse(localStorage.getItem('esakay_current'));
      await axios.post(`${API_BASE}/report`, {
        userId: currentUser._id,
        userName: currentUser.name,
        ...reportForm,
        timestamp: new Date()
      });
      alert('Report submitted successfully');
      setReportForm({ type: 'unsafe-driving', vehicleNumber: '', location: '', description: '' });
    } catch (err) {
      alert('Error submitting report');
    }
  };

  return (
    <div>
      <div className="page-header header-red">
         <div className="header-nav"><FaArrowLeft onClick={()=>navigate('/home')}/> <div>Safety Center</div><div></div></div>
      </div>

      <div className="sos-big-card">
         <div className={`sos-btn-circle ${sosActive ? 'active' : ''}`} onClick={handleSOS}>
           <FaExclamationTriangle size={30}/><span style={{fontWeight:'bold', marginTop:'5px'}}>SOS</span>
         </div>
         <p>{sosActive ? '✅ Alert Sent!' : 'Press for Emergency'}</p>
      </div>

      <div className="hotline-grid">
         <HotlineBox icon={<FaCar/>} title="PNP" num="911" />
         <HotlineBox icon={<FaBus/>} title="Fire" num="552-3143" />
         <HotlineBox icon={<FaPhone/>} title="Ambulance" num="161" />
         <HotlineBox icon={<FaUsers/>} title="DSWD" num="1343" />
      </div>

      <div style={{padding:'20px'}}>
         <SafetyRow icon={<FaShareAlt/>} text="Share Location" onClick={()=>alert('Location shared with emergency contacts')}/>
         <SafetyRow icon={<FaStar/>} text="Rate Driver" onClick={()=>alert('Rate Driver dialog would open')}/>
         <SafetyRow icon={<FaFileAlt/>} text="Report Incident" onClick={()=>alert('Report form expanded below')}/>
      </div>

      <div style={{padding:'0 20px 20px'}}>
        <h3 style={{fontSize:'13px', fontWeight:'bold', marginBottom:'10px'}}>📋 Report Incident</h3>
        <div style={{background:'white', padding:'15px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
          <select 
            className="f-input" 
            value={reportForm.type}
            onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
            style={{marginBottom:'10px'}}
          >
            <option value="unsafe-driving">🚗 Unsafe Driving</option>
            <option value="overpricing">💰 Fare Overpricing</option>
            <option value="harassment">⚠️ Harassment</option>
            <option value="accident">🚨 Accident</option>
            <option value="lost-item">📦 Lost Item</option>
          </select>

          <input 
            className="f-input" 
            placeholder="Vehicle Number" 
            value={reportForm.vehicleNumber}
            onChange={(e) => setReportForm({...reportForm, vehicleNumber: e.target.value})}
            style={{marginBottom:'10px'}}
          />

          <input 
            className="f-input" 
            placeholder="Location" 
            value={reportForm.location}
            onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
            style={{marginBottom:'10px'}}
          />

          <textarea 
            className="f-input" 
            placeholder="Describe what happened..." 
            rows="3"
            value={reportForm.description}
            onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
            style={{marginBottom:'10px'}}
          ></textarea>

          <button className="calc-btn" onClick={handleReport}>Submit Report</button>
        </div>
      </div>
    </div>
  );
};

const HotlineBox = ({icon, title, num}) => (
   <div className="hotline-box"><div style={{fontSize:'20px'}}>{icon}</div><div style={{fontWeight:'bold', fontSize:'12px'}}>{title}</div><div style={{color:'#0056b3', fontSize:'11px', fontWeight:'bold'}}>{num}</div></div>
);

const SafetyRow = ({icon, text, onClick}) => (
   <div onClick={onClick} style={{background:'white', padding:'15px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'15px', marginBottom:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', cursor:'pointer'}}>
      <div style={{color:'#0056b3', fontSize:'18px'}}>{icon}</div> <span style={{fontSize:'13px', fontWeight:'600'}}>{text}</span>
   </div>
);

// ==========================================
// 9. COMMUNITY PAGE
// ==========================================
const Community = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([
     {id:1, user:'Maria Santos', type:'💡 Tip', content:'New jeepney route from Fatima to City Mall is faster! Takes only 10 minutes', likes:24, liked:false, timestamp: '2 hours ago'},
     {id:2, user:'Juan Dela Cruz', type:'⭐ Praise', content:'Driver of ABC-1234 was very helpful and courteous. 5 stars! Highly recommended', likes:45, liked:false, timestamp: '5 hours ago'},
     {id:3, user:'Rosa Garcia', type:'⚠️ Alert', content:'Heavy traffic on Polomolok Highway. Avoid this route during peak hours (4-6 PM)', likes:12, liked:false, timestamp: '1 day ago'}
  ]);

  const handlePost = async () => {
     if(!text.trim()) return;
     const currentUser = JSON.parse(localStorage.getItem('esakay_current')) || { name: 'Guest' };
     
     try {
       const res = await axios.post(`${API_BASE}/post`, {
         userId: currentUser._id || 'guest',
         user: currentUser.name,
         type: '📝 Post',
         content: text,
         timestamp: new Date()
       });

       const newPost = { 
         id: Date.now(), 
         user: currentUser.name, 
         type:'📝 Post', 
         content:text, 
         likes:0, 
         liked:false,
         timestamp: 'just now'
       };
       setPosts([newPost, ...posts]);
       setText('');
     } catch (err) {
       console.error(err);
       alert('Error posting');
     }
  };

  const toggleLike = (id) => {
     setPosts(posts.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  return (
    <div>
      <div className="page-header header-teal">
         <div className="header-nav"><FaArrowLeft onClick={()=>navigate('/home')}/> <div>Community Forum</div><div></div></div>
      </div>
      <div className="comm-input-box">
         <textarea 
           className="comm-textarea" 
           rows="3" 
           placeholder="Share a tip, update, or concern..." 
           value={text} 
           onChange={(e)=>setText(e.target.value)}
         ></textarea>
         <div className="post-actions">
            <div></div>
            <button className="post-btn" onClick={handlePost}>Post</button>
         </div>
      </div>
      <div className="feed-container">
         {posts.map(post => (
            <div key={post.id} className="feed-post">
               <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <div style={{fontWeight:'bold', fontSize:'13px'}}>{post.user}</div>
                  <span style={{fontSize:'10px', background:'#eee', padding:'2px 8px', borderRadius:'4px'}}>{post.timestamp}</span>
               </div>
               <div style={{fontSize:'10px', background:'#f0f0f0', padding:'3px 6px', borderRadius:'4px', display:'inline-block', marginBottom:'8px'}}>{post.type}</div>
               <div style={{fontSize:'13px', color:'#444', marginBottom:'15px'}}>{post.content}</div>
               <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <span 
                    className={`like-btn ${post.liked?'liked':''}`} 
                    onClick={()=>toggleLike(post.id)}
                    style={{cursor:'pointer'}}
                  >
                     <FaThumbsUp/> {post.likes}
                  </span>
                  <span className="like-btn" style={{cursor:'pointer'}}><FaComment/> Reply</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// ==========================================
// 10. PROFILE PAGE (CRUD)
// ==========================================
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'User', email: 'email@example.com', mobile: '', _id: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '' });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('esakay_current'));
    if (u) {
      setUser(u);
      setFormData({ name: u.name || '', email: u.email || '', mobile: u.mobile || '' });
    }
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API_BASE}/user/${user._id}`, formData);
      if (res.data.success || res.data.user) {
        const updatedUser = res.data.user || { ...user, ...formData };
        localStorage.setItem('esakay_current', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert("✅ Information updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating information: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (window.confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.")) {
      try {
        await axios.delete(`${API_BASE}/user/${user._id}`);
        localStorage.removeItem('esakay_current');
        alert("❌ Account deleted.");
        navigate('/');
      } catch (err) {
        console.error(err);
        alert("Error deleting account: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('esakay_current');
    localStorage.removeItem('esakay_token');
    navigate('/');
  };

  return (
    <div style={{ padding: '30px 20px', textAlign: 'center', paddingBottom: '100px' }}>
      <div className="auth-logo-box" style={{ background: '#667eea', borderRadius: '50%', margin: '0 auto' }}>
        <FaUser size={30} color="white" />
      </div>

      {isEditing ? (
        <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto' }}>
          <h3 style={{marginBottom:'20px', fontSize:'16px'}}>✏️ Edit Profile</h3>
          
          <div className="input-wrap">
            <FaUser className="input-icon" />
            <input 
              className="auth-input" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Full Name"
            />
          </div>

          <div className="input-wrap">
            <FaEnvelope className="input-icon" />
            <input 
              className="auth-input" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              placeholder="Email"
            />
          </div>

          <div className="input-wrap">
            <FaPhone className="input-icon" />
            <input 
              className="auth-input" 
              placeholder="Mobile Number" 
              value={formData.mobile} 
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} 
            />
          </div>

          <button className="btn-auth" onClick={handleUpdate}>✅ Save Changes</button>
          <p 
            style={{ marginTop: '15px', color: '#888', cursor: 'pointer', fontSize:'12px' }} 
            onClick={() => setIsEditing(false)}
          >
            ❌ Cancel
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{marginBottom:'5px'}}>{user.name}</h2>
          <p style={{ color: '#777', fontSize: '14px', marginBottom:'10px' }}>👤 User Account</p>
          <p style={{ color: '#777', fontSize: '13px', marginBottom:'5px' }}>{user.email}</p>
          <p style={{ color: '#777', fontSize: '13px', marginBottom: '30px' }}>📱 {user.mobile || 'Not set'}</p>
          
          <button 
            className="social-btn" 
            onClick={() => setIsEditing(true)}
            style={{marginBottom:'10px'}}
          >
            ✏️ Edit Profile
          </button>
          
          <button 
            className="social-btn" 
            onClick={handleLogout}
            style={{marginBottom:'20px'}}
          >
            🚪 Logout
          </button>

          <div style={{marginTop:'50px', padding:'15px', background:'#fff3cd', borderRadius:'8px', fontSize:'12px', color:'#856404', marginBottom:'20px'}}>
            <p style={{marginBottom:'10px'}}><strong>ℹ️ Account Info</strong></p>
            <p>Member since: {new Date().toLocaleDateString()}</p>
          </div>

          <div style={{marginTop:'30px', paddingTop:'20px', borderTop:'1px solid #eee'}}>
            <p 
              style={{ color: '#d32f2f', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} 
              onClick={handleDelete}
            >
              🗑️ Delete My Account
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// BOTTOM NAVIGATION
// ==========================================
const BottomNav = () => (
  <div className="bottom-nav">
    <NavLink to="/home" className={({isActive})=>isActive?"nav-link active":"nav-link"}><FaHome size={20}/>Home</NavLink>
    <NavLink to="/track" className={({isActive})=>isActive?"nav-link active":"nav-link"}><FaMapMarkerAlt size={20}/>Track</NavLink>
    <NavLink to="/fare" className={({isActive})=>isActive?"nav-link active":"nav-link"}><FaCalculator size={20}/>Fare</NavLink>
    <NavLink to="/community" className={({isActive})=>isActive?"nav-link active":"nav-link"}><FaUsers size={20}/>Chat</NavLink>
    <NavLink to="/profile" className={({isActive})=>isActive?"nav-link active":"nav-link"}><FaUser size={20}/>Me</NavLink>
  </div>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const location = useLocation();
  const showNav = location.pathname !== '/' && location.pathname !== '/register';

  return (
    <div className="mobile-wrapper">
      <div className="mobile-notch"></div> 
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/track" element={<Track />} />
          <Route path="/fare" element={<Fare />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

const AppWrapper = () => (<Router><App /></Router>);
export default AppWrapper;
