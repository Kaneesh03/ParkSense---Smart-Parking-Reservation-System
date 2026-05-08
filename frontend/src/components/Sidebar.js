import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotification } from "../context/NotificationContext";
import Logo from './Logo';


export default function Sidebar() {
    const { showNotification } = useNotification();
    const location = useLocation();
    const role = localStorage.getItem("role");
    
    const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 44, opacity: 0 });

    useEffect(() => {
        const activeLink = document.querySelector('.sidebar-menu .sidebar-link.active');
        if (activeLink) {
            setIndicatorStyle({
                top: activeLink.offsetTop,
                height: activeLink.offsetHeight,
                opacity: 1
            });
        }
    }, [location.pathname]);

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header" style={{ borderBottom: 'none', padding: '0 0 20px 0', justifyContent: 'center' }}>
                <Logo height={44} style={{ margin: '0 auto' }} />
            </div>

            <div className="sidebar-menu" style={{ position: 'relative' }}>
                {/* Smooth Moving Background Indicator */}
                <div 
                    className="sidebar-active-indicator"
                    style={{ 
                        position: 'absolute', 
                        left: '0px',
                        width: '100%',
                        top: `${indicatorStyle.top}px`, 
                        height: `${indicatorStyle.height}px`, 
                        opacity: indicatorStyle.opacity, 
                        background: 'linear-gradient(135deg, rgba(55, 48, 163, 0.4), rgba(13, 148, 136, 0.4))', 
                        borderRadius: '14px', 
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', 
                        zIndex: 0,
                        borderLeft: '3px solid var(--accent-secondary)',
                        boxShadow: '0 4px 15px rgba(13, 148, 136, 0.15)'
                    }} 
                />
                
                <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard')}`} title="Dashboard">
                    <i className="fa-solid fa-desktop"></i>
                </Link>
                <Link to="/parking" className={`sidebar-link ${isActive('/parking')}`} title="Find Parking">
                    <i className="fa-solid fa-square-parking"></i>
                </Link>
                <Link to="/map" className={`sidebar-link ${isActive('/map')}`} title="Map View">
                    <i className="fa-solid fa-map-location-dot"></i>
                </Link>
                <Link to="/bookings" className={`sidebar-link ${isActive('/bookings')}`} title="My Reservations">
                    <i className="fa-solid fa-ticket"></i>
                </Link>

                {role === "admin" && (
                    <>
                        <div style={{ width: "30%", height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 0" }}></div>
                        <Link to="/admin" className={`sidebar-link ${isActive('/admin')}`} title="Admin Panel">
                            <i className="fa-solid fa-shield-halved"></i>
                        </Link>
                    </>
                )}

                {role === "parkingLotAdmin" && (
                    <>
                        <div style={{ width: "30%", height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 0" }}></div>
                        <Link to="/lot-admin" className={`sidebar-link ${isActive('/lot-admin')}`} title="Lot Dashboard">
                            <i className="fa-solid fa-briefcase"></i>
                        </Link>
                    </>
                )}

                <div style={{ width: "30%", height: "1px", background: "rgba(255,255,255,0.1)", margin: "10px 0" }}></div>
                
                <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`} title="Profile">
                    <i className="fa-solid fa-user"></i>
                </Link>
                <Link to="/settings" className={`sidebar-link ${isActive('/settings')}`} title="Preferences">
                    <i className="fa-solid fa-gear"></i>
                </Link>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                <div onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="sidebar-link" title="Logout" style={{ cursor: 'pointer', color: '#64748b' }}>
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </div>
            </div>

        </div>
    );
}
