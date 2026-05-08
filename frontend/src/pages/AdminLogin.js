import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/auth/login", { email, password });
            if (res.data.role === "admin") {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role); // Store role
                navigate("/admin");
            } else {
                setError("Access Denied: Admins Only");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ borderTop: "4px solid var(--status-danger)", animation: "slideUp 0.5s ease-out" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{ display: "inline-block", background: "var(--status-danger-bg)", color: "var(--status-danger)", width: "56px", height: "56px", borderRadius: "16px", lineHeight: "56px", fontSize: "1.5rem", marginBottom: "12px", boxShadow: "0 4px 15px rgba(220, 38, 38, 0.2)" }}>
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h2 className="auth-title">Admin Portal</h2>
                    <p className="auth-subtitle">Secure system access</p>
                </div>

                {error && <p style={{ color: "var(--status-danger)", background: "var(--status-danger-bg)", padding: "12px", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px", fontWeight: "500" }}><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label>Admin Email</label>
                        <div style={{ position: "relative" }}>
                            <i className="fa-solid fa-envelope" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                            <input
                                type="email"
                                placeholder="admin@parksense.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: "44px" }}
                            />
                        </div>
                    </div>
                    
                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                            <i className="fa-solid fa-lock" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingLeft: "44px" }}
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', background: "var(--status-danger)" }} onMouseOver={e => e.target.style.filter = "brightness(0.9)"} onMouseOut={e => e.target.style.filter = "none"}>
                        Authorize <i className="fa-solid fa-arrow-right-to-bracket"></i>
                    </button>
                </form>

                <p className="auth-link" style={{ marginTop: "24px" }}>
                    <span onClick={() => navigate("/login")}><i className="fa-solid fa-arrow-left"></i> Back to User Login</span>
                </p>
            </div>
        </div>
    );
}
