import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function Register() {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const validate = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(data.email)) {
      showNotification("error", "Invalid Email: Must be a valid @gmail.com address.");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(data.password)) {
      showNotification("error", "Invalid Password: Must be at least 6 chars, include uppercase, lowercase, number, and special character.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      await axios.post("/auth/register", data);
      showNotification("success", "Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      showNotification("error", err.response?.data?.message || "Registration failed. Try a different email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ animation: "slideUp 0.5s ease-out" }}>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join ParkSense today</p>

        <form onSubmit={e => { e.preventDefault(); submit(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-user" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                  <input
                    type="text"
                    placeholder="John Doe"
                    onChange={e => setData({ ...data, name: e.target.value })}
                    style={{ paddingLeft: "44px" }}
                    required
                  />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
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
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>Must include uppercase, number & symbol</p>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "8px" }}>
                Sign Up <i className="fa-solid fa-user-plus"></i>
            </button>
        </form>

        <p className="auth-link" style={{ marginTop: "24px" }}>
          Already have an account? <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>
    </div>
  );
}
