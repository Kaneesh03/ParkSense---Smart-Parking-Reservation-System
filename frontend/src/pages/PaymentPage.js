import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";

export default function PaymentPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("UPI");

    useEffect(() => {
        // Fetch booking details (optional, or pass via state)
        // For now, we'll trust the ID and just show a generic amount or fetch if needed.
        // Let's mock the amount for simplicity or fetch it.
        // Real implementation would fetch /api/bookings/:id
    }, [bookingId]);

    const handlePayment = async () => {
        setLoading(true);

        // Simulate Gateway Delay
        setTimeout(async () => {
            try {
                // Generate Mock Transaction ID
                const transactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);
                const qrCodeData = `PARKSENSE:${bookingId}:${transactionId}:PAID`; // Simple data for QR

                await axios.post("/bookings/confirm-payment", {
                    bookingId,
                    paymentDetails: {
                        method: paymentMethod,
                        transactionId
                    },
                    qrCode: qrCodeData
                });

                setLoading(false);
                navigate(`/receipt/${bookingId}`);
            } catch (err) {
                console.error("Payment Failed", err);
                setLoading(false);
                showNotification("error", "Payment Verification Failed");
            }
        }, 2000); // 2 second delay for realism
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "20px" }}>
            <div style={{ background: "var(--bg-secondary)", padding: "40px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", border: "var(--border-subtle)", textAlign: "center", maxWidth: "440px", width: "100%", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                
                <div style={{ marginBottom: "24px", color: "var(--accent-primary)" }}>
                    <i className="fa-solid fa-shield-check fa-3x" style={{ textShadow: "0 4px 10px rgba(37,99,235,0.3)" }}></i>
                </div>
                
                <h2 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "1.8rem", fontWeight: "800", letterSpacing: "-0.5px" }}>Secure Checkout</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem" }}>Complete your reservation payment securely.</p>

                <div style={{ background: "var(--bg-primary)", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px dashed var(--accent-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "left" }}>
                        <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Booking Ref</span>
                        <span style={{ display: "block", color: "var(--text-primary)", fontWeight: "800", fontSize: "1.2rem", letterSpacing: "1px" }}>{bookingId.slice(-6).toUpperCase()}</span>
                    </div>
                    {/* Placeholder amount, would normally come from state/backend */}
                    <div style={{ textAlign: "right" }}>
                        <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Total</span>
                        <span style={{ display: "block", color: "var(--status-success)", fontWeight: "800", fontSize: "1.2rem" }}>$10.00</span>
                    </div>
                </div>

                <p style={{ textAlign: "left", marginBottom: "12px", fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>Payment Method</p>
                <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
                    <button
                        onClick={() => setPaymentMethod("UPI")}
                        style={{ ...methodStyle, background: paymentMethod === "UPI" ? "var(--bg-primary)" : "transparent", borderColor: paymentMethod === "UPI" ? "var(--accent-primary)" : "var(--border-subtle)", color: paymentMethod === "UPI" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                    >
                        <i className="fa-solid fa-qrcode" style={{ marginBottom: "4px", fontSize: "1.2rem" }}></i><br/>UPI / QR
                    </button>
                    <button
                        onClick={() => setPaymentMethod("Card")}
                        style={{ ...methodStyle, background: paymentMethod === "Card" ? "var(--bg-primary)" : "transparent", borderColor: paymentMethod === "Card" ? "var(--accent-primary)" : "var(--border-subtle)", color: paymentMethod === "Card" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                    >
                        <i className="fa-solid fa-credit-card" style={{ marginBottom: "4px", fontSize: "1.2rem" }}></i><br/>Card
                    </button>
                </div>

                <button
                    className="btn-primary"
                    onClick={handlePayment}
                    disabled={loading}
                    style={{
                        padding: "16px", fontSize: "1.1rem", 
                        opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? (
                        <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                    ) : (
                        <><i className="fa-solid fa-lock" style={{ fontSize: "0.9em" }}></i> Pay Now</>
                    )}
                </button>

                <p style={{ marginTop: "24px", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <i className="fa-solid fa-shield-halved"></i> 256-bit Secure SSL Connection
                </p>
            </div>
        </div>
    );
}

const methodStyle = {
    flex: 1, padding: "16px 12px", border: "2px solid", borderRadius: "12px", cursor: "pointer", fontWeight: "600", transition: "var(--transition)"
};
