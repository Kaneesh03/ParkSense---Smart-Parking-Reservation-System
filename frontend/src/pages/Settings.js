import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNotification } from "../context/NotificationContext";

export default function Settings() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    bookingNotifications: true,
    reminders: true,
    cancellations: true,
    preferredDistrict: "Tiruchirappalli",
    defaultReservationDuration: 1
  });

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res = await axios.get("/users/preferences");
      setPrefs({
        bookingNotifications: res.data.bookingNotifications ?? true,
        reminders: res.data.reminders ?? true,
        cancellations: res.data.cancellations ?? true,
        preferredDistrict: res.data.preferredDistrict || "Tiruchirappalli",
        defaultReservationDuration: res.data.defaultReservationDuration || 1,
      });
      setLoading(false);
    } catch (error) {
      console.error("Preferences Fetch Error:", error);
      showNotification("error", "Failed to load preferences.");
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (e) => {
    setPrefs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await axios.put("/users/preferences", prefs);
      showNotification("success", "Preferences saved seamlessly.");
    } catch (error) {
      showNotification("error", "Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  if(loading) return <div style={{ padding: "24px" }}>Loading Settings...</div>;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
           <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "4px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Account Settings
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>Configure your app preferences and notification flows.</p>
        </div>
      </div>

      <div style={{ background: "white", padding: "40px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
        
        {/* Section 1: Notifications */}
        <div style={{ marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "1.2rem", fontWeight: "800" }}>Notifications</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>Manage how and when ParkSense contacts you regarding reservations.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ToggleOption 
              label="Booking Confirmations" 
              description="Receive emails when you successfully reserve a parking slot."
              checked={prefs.bookingNotifications} 
              onToggle={() => handleToggle("bookingNotifications")} 
            />
            <ToggleOption 
              label="Reservation Reminders" 
              description="Be notified 15 minutes before your parking reservation begins."
              checked={prefs.reminders} 
              onToggle={() => handleToggle("reminders")} 
            />
            <ToggleOption 
              label="Cancellation Alerts" 
              description="Receive notifications if you or a Lot Admin cancels your active slot."
              checked={prefs.cancellations} 
              onToggle={() => handleToggle("cancellations")} 
            />
          </div>
        </div>

        {/* Section 2: General Application Prefs */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "1.2rem", fontWeight: "800" }}>Parking Preferences</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>These metrics will be used organically to map quicker route suggestions.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Default Operating District</label>
              <div style={{ position: "relative" }}>
                 <select 
                   name="preferredDistrict" 
                   value={prefs.preferredDistrict} 
                   onChange={handleSelect}
                   style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", appearance: "none", fontSize: "1rem", fontWeight: "600" }}
                 >
                   <option value="Tiruchirappalli">Tiruchirappalli (Active)</option>
                   <option value="Chennai" disabled>Chennai (Coming Soon)</option>
                   <option value="Madurai" disabled>Madurai (Coming Soon)</option>
                   <option value="Coimbatore" disabled>Coimbatore (Coming Soon)</option>
                 </select>
                 <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "700" }}>Default Reservation Duration</label>
                <div style={{ position: "relative" }}>
                   <select 
                     name="defaultReservationDuration" 
                     value={prefs.defaultReservationDuration} 
                     onChange={handleSelect}
                     style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", appearance: "none", fontSize: "1rem", fontWeight: "600" }}
                   >
                     <option value={1}>1 Hour</option>
                     <option value={2}>2 Hours</option>
                     <option value={3}>3 Hours</option>
                     <option value={4}>4 Hours</option>
                     <option value={8}>Full Day (8 Hours)</option>
                   </select>
                   <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "4px" }}>This saves time during bookings instantly.</div>
              </div>

          </div>
        </div>
        
        {/* Save Bar */}
        <div style={{ paddingTop: "24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
            <button 
                onClick={savePreferences}
                disabled={saving}
                style={{ background: "#0f172a", border: "none", color: "white", padding: "14px 32px", borderRadius: "16px", cursor: "pointer", fontWeight: "700", transition: "var(--transition)", opacity: saving ? 0.7 : 1, fontSize: "1rem" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = saving ? "none" : "translateY(-2px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {saving ? "Saving changes..." : "Save Preferences"}
            </button>
        </div>

      </div>
    </div>
  );
}

// Internal reusable modular switch wrapper component
const ToggleOption = ({ label, description, checked, onToggle }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "var(--bg-primary)", borderRadius: "16px", border: "none" }}>
      <div>
        <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem" }}>{label}</div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>{description}</div>
      </div>
      <div 
        onClick={onToggle}
        style={{
          width: "50px", height: "28px", background: checked ? "#047857" : "#cbd5e1",
          borderRadius: "14px", position: "relative", cursor: "pointer", transition: "var(--transition)"
        }}
      >
        <div style={{
          width: "24px", height: "24px", background: "white", borderRadius: "50%",
          position: "absolute", top: "2px", left: checked ? "24px" : "2px",
          transition: "var(--transition)", boxShadow: "var(--shadow-sm)"
        }} />
      </div>
    </div>
  );
};
