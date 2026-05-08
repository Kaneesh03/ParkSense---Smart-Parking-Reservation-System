import React from 'react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationContainer() {
    const { notifications } = useNotification();

    return (
        <div className="notification-container">
            {notifications.map((n) => (
                <div key={n.id} className={`notification-toast toast-${n.type}`}>
                    <div className="toast-icon">
                        {n.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
                        {n.type === 'error' && <i className="fa-solid fa-circle-xmark"></i>}
                        {n.type === 'warning' && <i className="fa-solid fa-triangle-exclamation"></i>}
                        {n.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
                    </div>
                    <div className="toast-message">{n.message}</div>
                </div>
            ))}
        </div>
    );
}
