import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";

export default function Profile() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    createdAt: "",
    phone: "",
    vehicleNumber: "",
    preferredVehicleType: "Four-wheeler",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/users/me");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        role: res.data.role || "user",
        createdAt: res.data.createdAt || null,
        phone: res.data.phone || "",
        vehicleNumber: res.data.vehicleNumber || "",
        preferredVehicleType: res.data.preferredVehicleType || "Four-wheeler",
      });
      setLoading(false);
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      showNotification("error", "Failed to load profile parameters.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/users/me", {
        name: profile.name,
        phone: profile.phone,
        vehicleNumber: profile.vehicleNumber,
        preferredVehicleType: profile.preferredVehicleType,
      });
      showNotification("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      showNotification("error", "Failed to save profile changes.");
    }
  };

  if (loading) return <div style={{ padding: "24px" }}>Loading Profile...</div>;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
           <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "4px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              My Profile
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>Manage your personal details and vehicle setup.</p>
        </div>
      </div>

      <div style={{ background: "white", padding: "40px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", fontWeight: "800", boxShadow: "var(--shadow-sm)" }}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.5px" }}>{profile.name}</h3>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "8px" }}>{profile.email}</div>
              <div style={{ display: "inline-block", background: "var(--tag-mint)", color: "#047857", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {profile.role === "admin" ? "Admin" : profile.role === "parkingLotAdmin" ? "Lot Admin" : "Standard User"}
              </div>
            </div>
          </div>
          <div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ background: "#f4f5f8", border: "none", padding: "12px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "700", transition: "var(--transition)" }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#f4f5f8"; }}
              >
                <i className="fa-solid fa-pen" style={{ marginRight: "8px" }}></i> Edit Profile
              </button>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            
            {/* General Info */}
            <div style={{ gridColumn: "1 / -1", marginBottom: "8px" }}>
              <strong style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: "800" }}>Personal Information</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={profile.name} 
                onChange={handleChange} 
                disabled={!isEditing}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: isEditing ? "2px solid #e2e8f0" : "2px solid transparent", background: isEditing ? "white" : "var(--bg-primary)", color: "var(--text-primary)", outline: "none", transition: "var(--transition)", fontWeight: "600", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Email Address <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px", fontWeight: "500" }}>(Read Only)</span></label>
              <input 
                type="email" 
                value={profile.email} 
                disabled 
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid transparent", background: "var(--bg-primary)", color: "var(--text-muted)", outline: "none", cursor: "not-allowed", fontWeight: "600", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={profile.phone} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="Optional"
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: isEditing ? "2px solid #e2e8f0" : "2px solid transparent", background: isEditing ? "white" : "var(--bg-primary)", color: "var(--text-primary)", outline: "none", transition: "var(--transition)", fontWeight: "600", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Account Created</label>
              <div style={{ padding: "14px", background: "var(--bg-primary)", borderRadius: "12px", border: "2px solid transparent", color: "var(--text-muted)", fontSize: "1rem", fontWeight: "600" }}>
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>

            {/* Parking Defaults */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #f1f5f9", paddingTop: "24px", marginTop: "8px", marginBottom: "8px" }}>
              <strong style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: "800" }}>Vehicle Information</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Primary Vehicle Number</label>
              <input 
                type="text" 
                name="vehicleNumber" 
                value={profile.vehicleNumber} 
                onChange={handleChange} 
                disabled={!isEditing}
                placeholder="e.g., TN 45 XX 1234"
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: isEditing ? "2px solid #e2e8f0" : "2px solid transparent", background: isEditing ? "white" : "var(--bg-primary)", color: "var(--text-primary)", outline: "none", transition: "var(--transition)", fontWeight: "600", fontSize: "1rem", textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Preferred Vehicle Type</label>
              <div style={{ position: "relative" }}>
                 <select 
                   name="preferredVehicleType" 
                   value={profile.preferredVehicleType} 
                   onChange={handleChange} 
                   disabled={!isEditing}
                   style={{ width: "100%", padding: "14px", borderRadius: "12px", border: isEditing ? "2px solid #e2e8f0" : "2px solid transparent", background: isEditing ? "white" : "var(--bg-primary)", color: "var(--text-primary)", outline: "none", transition: "var(--transition)", fontWeight: "600", fontSize: "1rem", appearance: "none" }}
                 >
                   <option value="Four-wheeler">Four-wheeler (Car)</option>
                   <option value="Two-wheeler">Two-wheeler (Bike)</option>
                 </select>
                 <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: isEditing ? 'block' : 'none' }}></i>
              </div>
            </div>

          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "32px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <button 
                type="button" 
                onClick={() => { setIsEditing(false); fetchProfile(); }} 
                style={{ background: "white", border: "2px solid #e2e8f0", padding: "14px 28px", borderRadius: "16px", cursor: "pointer", fontWeight: "700", color: "var(--text-secondary)", fontSize: "1rem", transition: "var(--transition)" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--text-muted)"; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ background: "#0f172a", border: "none", color: "white", padding: "14px 32px", borderRadius: "16px", cursor: "pointer", fontWeight: "700", transition: "var(--transition)", fontSize: "1rem" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
