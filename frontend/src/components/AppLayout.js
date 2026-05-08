import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content-area">
                <Topbar />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
