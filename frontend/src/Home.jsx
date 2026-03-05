import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await axios.get(
                'https://esakay-gensan-final.onrender.com/api/vehicles',
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Welcome, {user?.name}! 🚀</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>📍 Track Vehicle</h3>
                    <p>Find nearby vehicles in real-time</p>
                    <a href="/track" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>Track Now →</a>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>🛣️ Find Route</h3>
                    <p>Discover the best routes</p>
                    <a href="/routes" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>View Routes →</a>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>💰 Fare Calculator</h3>
                    <p>Calculate your trip fare</p>
                    <a href="/calculator" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>Calculate →</a>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>🆘 Emergency SOS</h3>
                    <p>Quick emergency assistance</p>
                    <a href="/safety" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>SOS Help →</a>
                </div>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Available Vehicles</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '20px'
            }}>
                {vehicles.map(vehicle => (
                    <div key={vehicle._id} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h4>{vehicle.plateNumber}</h4>
                        <p><strong>Type:</strong> {vehicle.type}</p>
                        <p><strong>Driver:</strong> {vehicle.driverName}</p>
                        <p><strong>Status:</strong> {vehicle.status}</p>
                        <button style={{ width: '100%', padding: '8px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Book Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;