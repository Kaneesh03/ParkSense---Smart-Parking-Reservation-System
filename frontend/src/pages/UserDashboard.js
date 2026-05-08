import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeBookings: 0, totalLots: 0, recentBookings: [] });
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user's bookings
                const bookingsRes = await axios.get('/bookings/my');
                const active = bookingsRes.data.filter(b => b.status === 'Active' || b.status === 'Booked');
                
                // Fetch parking lots
                const lotsRes = await axios.get('/parking');
                
                setStats({
                    activeBookings: active.length,
                    totalLots: lotsRes.data.length,
                    recentBookings: bookingsRes.data.slice(0, 3) // Latest 3
                });
                
                setLots(lotsRes.data.slice(0, 3)); // Show 3 nearby lots
                setLoading(false);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            
            {/* QUICK STATS - Top Grid matching the two major blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1.5fr)', gap: '24px', marginBottom: '32px' }}>
                
                {/* Block 1: Real-time Stats */}
                <div 
                    className="dashboard-card"
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Reservations</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1px' }}>{stats.activeBookings}</div>
                    </div>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Available Locations</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1px' }}>{stats.totalLots}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                        <button 
                            className="btn-primary"
                            style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '700', color: 'white', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(55, 48, 163, 0.25)', fontSize: '1.05rem', letterSpacing: '0.5px' }} 
                            onClick={() => navigate('/parking')}
                            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(55, 48, 163, 0.35)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(55, 48, 163, 0.25)'; }}
                        >
                            + Book New Parking
                        </button>
                    </div>
                </div>

                {/* Block 2: Map to "Urgent Tasks" list */}
                <div 
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '24px' }}>Recent Activity</div>
                    {stats.recentBookings.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontWeight: '500' }}>No recent activity.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {stats.recentBookings.map((b, index) => (
                                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: index === stats.recentBookings.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: b.status === 'Active' ? 'var(--status-success)' : 'var(--text-muted)', border: '3px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                                        <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>{b.vehicleNumber} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>({b.slotId?.slotNumber || "Slot"})</span></span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '800', padding: '6px 14px', borderRadius: '12px', background: b.status === 'Active' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: b.status === 'Active' ? '#065f46' : 'var(--text-secondary)' }}>
                                        {b.status.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div> {/* End Top Grid */}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* NEARBY LOCATIONS (Matching "Project Directory") */}
                <div 
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                     <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '24px' }}>Available Locations Directory</h2>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {lots.map(lot => (
                            <div 
                                key={lot._id} 
                                style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                onClick={() => navigate(`/slots/${lot._id}`)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tag-lavender)', color: '#5b21b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                        <i className="fa-solid fa-location-dot"></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '2px' }}>{lot.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{lot.location}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', position: 'relative', width: '40px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', border: '2px solid white', position: 'absolute', right: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6ee7b7, #10b981)', border: '2px solid white', position: 'absolute', right: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={() => navigate('/parking')} 
                            style={{ background: 'white', border: '1px solid #cbd5e1', color: 'var(--text-primary)', padding: '16px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', marginTop: '12px', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                            + View All Locations
                        </button>
                     </div>
                </div>

                {/* NOTIFICATIONS/ALERTS (Matching "New Comments") */}
                <div 
                    style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-md)', alignSelf: 'start', transition: 'transform 0.3s, box-shadow 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <i className="fa-solid fa-bell" style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}></i>
                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>System Alerts</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(55,48,163,0.3)' }}><i className="fa-solid fa-robot"></i></div>
                                <div>
                                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '4px' }}>ParkSense AI Online</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.5' }}>You can now ask the chatbot to find parking!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Hashtags removed per user request */}
                </div>
            </div> {/* End Bottom Grid */}
            
        </div>
    );
}
