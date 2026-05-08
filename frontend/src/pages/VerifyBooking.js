import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function VerifyBooking() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get(`/bookings/${bookingId}`);
                setBooking(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Verification failed", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError("Unauthorized: Please Login as Admin or Owner");
                } else {
                    setError("Booking Not Found or Invalid");
                }
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Verifying Booking...</div>;

    if (error) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", color: "#c62828" }}>
                <h2>❌ Verification Failed</h2>
                <p>{error}</p>
                <button onClick={() => navigate("/login")} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>Login to Verify</button>
            </div>
        );
    }

    const isValid = booking.status === "Active" || booking.status === "Completed";
    const isPaid = booking.paymentStatus === "Paid";

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px", background: "var(--bg-primary)", minHeight: "85vh", alignItems: "center" }}>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-subtle)", maxWidth: "540px", width: "100%", overflow: "hidden", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>

                {/* Status Header */}
                <div style={{
                    background: isValid && isPaid ? "var(--status-success)" : "var(--status-danger)",
                    padding: "32px",
                    textAlign: "center",
                    color: "white"
                }}>
                    <i className={`fa-solid ${isValid && isPaid ? "fa-circle-check" : "fa-circle-xmark"} fa-4x`} style={{ marginBottom: "16px", textShadow: "0 4px 10px rgba(0,0,0,0.2)" }}></i>
                    <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "800", letterSpacing: "1px" }}>{isValid && isPaid ? "VALID" : "INVALID"}</h1>
                    <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "1.1rem", fontWeight: "500" }}>
                        {isPaid ? "Payment Verified & Authentic" : "Payment Pending/Failed"}
                    </p>
                </div>

                {/* Details */}
                <div style={{ padding: "32px" }}>
                    <h3 style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", color: "var(--text-primary)", fontSize: "1.2rem", marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: "var(--accent-primary)" }}></i> Booking Details
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px", marginTop: "20px" }}>
                        <div>
                            <div style={labelStyle}>Vehicle Number</div>
                            <div style={valueStyle}><i className="fa-solid fa-car-side" style={{ color: "var(--text-muted)", marginRight: "6px" }}></i> {booking.vehicleNumber}</div>
                        </div>
                        <div>
                            <div style={labelStyle}>Vehicle Type</div>
                            <div style={valueStyle}><i className="fa-solid fa-tags" style={{ color: "var(--text-muted)", marginRight: "6px" }}></i> {booking.vehicleType}</div>
                        </div>
                        <div>
                            <div style={labelStyle}>Parking Lot</div>
                            <div style={valueStyle}><i className="fa-solid fa-location-dot" style={{ color: "var(--text-muted)", marginRight: "6px" }}></i> {booking.slotId?.parkingLotId?.name || "Unknown"}</div>
                        </div>
                        <div>
                            <div style={labelStyle}>Slot Number</div>
                            <div style={valueStyle}><i className="fa-solid fa-square-parking" style={{ color: "var(--text-muted)", marginRight: "6px" }}></i> {booking.slotId?.slotNumber}</div>
                        </div>
                    </div>

                    <div style={{ background: "var(--bg-primary)", border: "1px dashed var(--border-subtle)", padding: "20px", borderRadius: "12px", marginBottom: "32px" }}>
                        <div style={{ ...labelStyle, marginBottom: "12px" }}>Reservation Duration</div>
                        <div style={{ color: "var(--text-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ flex: 1, textAlign: "right" }}>
                                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{new Date(booking.startTime).toLocaleDateString()}</div>
                                <div style={{ fontSize: "1.1rem" }}>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div style={{ color: "var(--accent-primary)", fontSize: "1.2rem" }}>
                                <i className="fa-solid fa-arrow-right"></i>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{new Date(booking.endTime).toLocaleDateString()}</div>
                                <div style={{ fontSize: "1.1rem" }}>{new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", color: "var(--text-primary)", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-user-check" style={{ color: "var(--accent-primary)" }}></i> User Details
                    </h3>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "20px" }}>
                        <div style={{ background: "var(--accent-primary)", color: "white", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(37,99,235,0.3)" }}>
                            {booking.userId?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "1.1rem" }}>{booking.userId?.name}</div>
                            <div style={{ fontSize: "0.95em", color: "var(--text-secondary)" }}>{booking.userId?.email}</div>
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div style={{ background: "var(--bg-tertiary)", padding: "24px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
                    <button onClick={() => navigate("/")} style={{ background: "white", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "1rem", transition: "var(--transition)", display: "inline-flex", alignItems: "center", gap: "8px" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-primary)"} onMouseOut={e => e.currentTarget.style.background = "white"}>
                        <i className="fa-solid fa-house"></i> Return Home
                    </button>
                </div>
            </div>
        </div>
    );
}

const labelStyle = { color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "8px", fontWeight: "700", letterSpacing: "0.5px" };
const valueStyle = { color: "var(--text-primary)", fontWeight: "700", fontSize: "1.1rem", display: "flex", alignItems: "center" };
