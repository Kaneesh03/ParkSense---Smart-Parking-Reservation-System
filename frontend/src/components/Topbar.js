import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from "../context/NotificationContext";

export default function Topbar() {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    
    // Handle Global Search
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/parking?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="topbar">
            {/* Left Header - Replaces old search location */}
            <div className="topbar-welcome">
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                    Welcome to ParkSense!
                </h1>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    Here is your parking overview for today
                </div>
            </div>

            {/* Right Actions */}
            <div className="topbar-actions">
                {/* Search Bar matching reference */}
                <div className="topbar-search" style={{ marginRight: '16px' }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder="Search specific location, district..." 
                        style={{ height: '30px' }} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div className="user-profile-menu" onClick={() => setShowMenu(!showMenu)} style={{ background: 'white', padding: '6px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="user-avatar" style={{ borderRadius: '8px' }}>
                            {localStorage.getItem('role') === 'admin' ? 'A' : 'U'}
                        </div>
                        <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingRight: '6px' }}></i>
                    </div>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-sm)', width: '200px', zIndex: 100, animation: 'fadeIn 0.2s', overflow: 'hidden' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Account</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{localStorage.getItem('role') === 'admin' ? 'Admin Access' : 'User Access'}</div>
                            </div>
                            <div style={{ padding: '8px' }}>
                                <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/profile"); }} style={dropdownBtnStyle}>
                                    <i className="fa-regular fa-user" style={{ width: '20px' }}></i> Profile
                                </button>
                                <button className="dropdown-item" onClick={() => { setShowMenu(false); navigate("/settings"); }} style={dropdownBtnStyle}>
                                    <i className="fa-solid fa-gear" style={{ width: '20px' }}></i> Settings
                                </button>
                            </div>
                            <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                                <button className="dropdown-item" onClick={logout} style={{ ...dropdownBtnStyle, color: 'var(--status-danger)' }}>
                                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '20px' }}></i> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const dropdownBtnStyle = {
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '0.95rem',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s, color 0.2s'
};
