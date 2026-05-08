import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import Logo from "../components/Logo";


export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const submit = async () => {
    try {
      const res = await axios.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      showNotification("error", err.response?.data?.message || "Login failed. Please check your credentials or register.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ animation: "slideUp 0.5s ease-out" }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Logo height={80} />
        </div>
        <h2 className="auth-title">Welcome Back</h2>

        <p className="auth-subtitle">Login to access your parking</p>

        <form onSubmit={e => { e.preventDefault(); submit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    onChange={e => setData({ ...data, email: e.target.value })}
                    style={{ paddingLeft: "44px" }}
                    required
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
                    onChange={e => setData({ ...data, password: e.target.value })}
                    style={{ paddingLeft: "44px" }}
                    required
                  />
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: "-8px" }}>
              <span
                onClick={() => navigate("/forgot-password")}
                style={{ color: "var(--accent-primary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "var(--transition)" }}
                onMouseOver={e => e.target.style.color = "var(--accent-hover)"}
                onMouseOut={e => e.target.style.color = "var(--accent-primary)"}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "8px" }}>
                Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </button>
        </form>

        <p className="auth-link" style={{ marginTop: "24px" }}>
          Don't have an account? <span onClick={() => navigate("/register")}>Register here</span>
        </p>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
            <span onClick={() => navigate("/admin/login")} style={{ color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "var(--transition)" }} onMouseOver={e => e.target.style.color = "var(--text-primary)"} onMouseOut={e => e.target.style.color = "var(--text-muted)"}>
                 <i className="fa-solid fa-shield-halved"></i> Admin Login
            </span>
        </div>
      </div>
    </div>
  );
}
