import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function ReceiptPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // Determine API endpoint based on role? 
                // Regular users can use /bookings/my but it returns an array.
                // Admin can use /admin/bookings.
                // We might need a specific endpoint for a single booking or filter from "myBookings".
                // For now, let's try to filter from myBookings or add a getBookingById endpoint.
                // Actually, let's add specific endpoint logic or just filter for now to be safe.
                const res = await axios.get("/bookings/my");
                const found = res.data.find(b => b._id === bookingId);

                if (found) {
                    setBooking(found);
                } else {
                    // Fallback or error
                    console.error("Booking not found in user history");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching receipt", err);
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading Receipt...</div>;
    if (!booking) return <div style={{ textAlign: "center", marginTop: "50px" }}>Receipt Not Found</div>;

    // QR Data: URL for Verification
    const verificationUrl = `${window.location.origin}/verify/${bookingId}`;

    // Using a public API for QR Code generation to avoid dependencies
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px", minHeight: "85vh", alignItems: "center" }}>
            <div style={{ background: "var(--bg-secondary)", padding: "0", borderRadius: "16px", boxShadow: "var(--shadow-hover)", maxWidth: "420px", width: "100%", overflow: "hidden", position: "relative", border: "1px solid var(--border-subtle)", animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                
                {/* Ticket Header */}
                <div style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-hover))", padding: "24px", textAlign: "center", color: "white" }}>
                    <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "50%", marginBottom: "12px", backdropFilter: "blur(4px)" }}>
                        <i className="fa-solid fa-ticket fa-2x"></i>
                    </div>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "800", letterSpacing: "1px" }}>Boarding Pass</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: "0.95rem" }}>ParkSense Verified Booking</p>
                </div>

                {/* Ticket Content */}
                <div style={{ padding: "32px", textAlign: "center", position: "relative" }}>
                    
                    {/* Cutout effects for ticket */}
                    <div style={{ position: "absolute", top: "-15px", left: "-15px", width: "30px", height: "30px", background: "var(--bg-primary)", borderRadius: "50%", borderRight: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}></div>
                    <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "30px", height: "30px", background: "var(--bg-primary)", borderRadius: "50%", borderLeft: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}></div>

                    <div style={{ background: "white", padding: "12px", display: "inline-block", borderRadius: "12px", border: "2px dashed var(--accent-secondary)", marginBottom: "8px" }}>
                        <img src={qrUrl} alt="Booking QR" style={{ borderRadius: "8px", display: "block", width: "160px", height: "160px" }} />
                    </div>
                    <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>
                        <i className="fa-solid fa-expand"></i> Scan at Entry/Exit
                    </p>

                    <div style={{ textAlign: "left", paddingTop: "24px", borderTop: "2px dashed var(--border-subtle)" }}>
                        <DetailRow icon="fa-car" label="Vehicle No" value={booking.vehicleNumber} />
                        <DetailRow icon="fa-location-dot" label="Location" value={booking.slotId?.parkingLotId?.name || "ParkSense Lot"} />
                        <DetailRow icon="fa-arrow-down-9-1" label="Slot" value={`#${booking.slotId?.slotNumber}`} />
                        <DetailRow icon="fa-calendar-check" label="Start Time" value={new Date(booking.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} />
                        <DetailRow icon="fa-calendar-xmark" label="End Time" value={new Date(booking.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} />
                        
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.95rem" }}>Total Amount</span>
                            <span style={{ color: "var(--status-success)", fontWeight: "800", fontSize: "1.4rem" }}>${booking.amount || 10}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ background: "var(--bg-tertiary)", padding: "20px", display: "flex", gap: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                    <button
                        onClick={() => window.print()}
                        className="btn-primary"
                        style={{ flex: 1, padding: "12px", fontSize: "0.95rem" }}
                    >
                        <i className="fa-solid fa-print"></i> Print
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", background: "white", color: "var(--text-primary)", cursor: "pointer", fontWeight: "600", fontSize: "0.95rem", transition: "var(--transition)" }}
                        onMouseOver={(e) => { e.target.style.background = "var(--bg-primary)"; }}
                        onMouseOut={(e) => { e.target.style.background = "white"; }}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}

const DetailRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", fontSize: "0.95rem" }}>
        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className={`fa-solid ${icon}`} style={{ color: "var(--text-muted)", width: "16px", textAlign: "center" }}></i> {label}
        </span>
        <span style={{ color: "var(--text-primary)", fontWeight: "700", textAlign: "right" }}>{value}</span>
    </div>
);
