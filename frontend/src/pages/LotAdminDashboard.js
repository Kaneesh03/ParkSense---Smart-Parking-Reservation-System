import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";

export default function LotAdminDashboard() {
    const { showNotification } = useNotification();
    const [stats, setStats] = useState({ lotName: "", totalSlots: 0, occupiedSlots: 0, availableSlots: 0, activeBookings: 0 });
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const [statsRes, slotsRes, bookingsRes] = await Promise.all([
                axios.get("/lot-admin/stats"),
                axios.get("/lot-admin/slots"),
                axios.get("/lot-admin/bookings")
            ]);
            setStats(statsRes.data);
            setSlots(slotsRes.data);
            setBookings(bookingsRes.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch dashboard data");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (bookingId, action) => {
        try {
            await axios.put(`/lot-admin/bookings/${bookingId}/${action}`);
            fetchData(); // Refresh data
        } catch (err) {
            showNotification("error", `Error marking ${action}`);
        }
    };

    if (loading) return <div className="p-40 text-center text-secondary">Loading Lot Admin Dashboard...</div>;
    if (error) return <div className="p-40 text-center text-danger">{error}</div>;

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "2.5rem", fontWeight: "800", margin: 0 }}>
                    {stats.lotName} Dashboard
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Manage slots and bookings for this parking lot</p>
            </div>

            {/* Lot Summary Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <div style={statCardStyle}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "bold" }}>TOTAL SLOTS</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800" }}>{stats.totalSlots}</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "bold" }}>AVAILABLE</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--status-success)" }}>{stats.availableSlots}</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "bold" }}>OCCUPIED</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--status-danger)" }}>{stats.occupiedSlots}</div>
                </div>
                <div style={statCardStyle}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "bold" }}>ACTIVE BOOKINGS</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-primary)" }}>{stats.activeBookings}</div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
                {/* Visual Layout Section */}
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Live Slot Map</h2>
                    <div style={{ 
                        background: "var(--bg-secondary)", 
                        padding: "24px", 
                        borderRadius: "var(--radius-md)", 
                        border: "1px solid var(--border-subtle)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                        gap: "12px"
                    }}>
                        {slots.map(slot => (
                            <div key={slot._id} style={{
                                height: "60px",
                                background: slot.isBooked ? "rgba(244, 63, 94, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                border: `2px solid ${slot.isBooked ? "var(--status-danger)" : "var(--status-success)"}`,
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: slot.isBooked ? "var(--status-danger)" : "var(--status-success)",
                                fontWeight: "bold",
                                fontSize: "0.9rem"
                            }}>
                                {slot.slotNumber}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Bookings Management */}
                <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>Booking Operations</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {bookings.filter(b => b.status === "Booked" || b.status === "Active").map(b => (
                            <div key={b._id} className="card" style={{ padding: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>{b.userId?.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{b.vehicleNumber} • {b.slotId?.slotNumber}</div>
                                    </div>
                                    <div>
                                        <span style={{ 
                                            background: b.status === "Active" ? "var(--status-success-bg)" : "var(--status-warning-bg)",
                                            color: b.status === "Active" ? "var(--status-success)" : "var(--status-warning)",
                                            padding: "4px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "bold"
                                        }}>{b.status.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {b.status === "Booked" && (
                                        <button onClick={() => handleAction(b._id, "entry")} className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: "0.85rem", background: "var(--status-success)" }}>Mark Entry</button>
                                    )}
                                    {b.status === "Active" && (
                                        <button onClick={() => handleAction(b._id, "exit")} className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: "0.85rem", background: "var(--status-danger)" }}>Mark Exit</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {bookings.filter(b => b.status === "Booked" || b.status === "Active").length === 0 && (
                            <div className="text-secondary text-center p-20" style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
                                No active vehicles at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const statCardStyle = {
    background: "var(--bg-secondary)",
    padding: "24px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-sm)"
};
