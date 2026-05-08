import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, totalSlots: 0, revenue: 0, totalUsers: 0 });
  const [bookings, setBookings] = useState([]);
  const [lotAdmins, setLotAdmins] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview | management
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Create Admin Form State
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [assignment, setAssignment] = useState({ lotId: "", adminId: "" });

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchAdminData = async () => {
    try {
      const role = localStorage.getItem("role");
      if (role !== "admin") {
        navigate("/");
        return;
      }

      const [statsRes, bookingsRes, adminsRes, lotsRes] = await Promise.all([
        axios.get("/admin/stats"),
        axios.get("/admin/bookings"),
        axios.get("/admin/lot-admins"),
        axios.get("/admin/lots")
      ]);

      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setLotAdmins(adminsRes.data);
      setLots(lotsRes.data);
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Error fetching admin data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate]);

  const handleCreateAdmin = async (e) => {
      e.preventDefault();
      try {
          await axios.post("/admin/lot-admins", newAdmin);
          showNotification("success", "Lot Admin created successfully!");
          setNewAdmin({ name: "", email: "", password: "" });
          fetchAdminData();
      } catch (err) {
          showNotification("error", "Error creating admin");
      }
  };

  const handleAssignLot = async (e) => {
      e.preventDefault();
      try {
          await axios.post("/admin/assign-admin", assignment);
          showNotification("success", "Admin assigned to lot successfully!");
          fetchAdminData();
      } catch (err) {
          showNotification("error", "Error assigning admin");
      }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading Admin Dashboard...</div>;

  if (errorMsg) return (
      <div style={{ padding: "40px", textAlign: "center", background: "var(--status-danger-bg)", color: "var(--status-danger)", margin: "40px", borderRadius: "12px", border: "1px solid var(--status-danger)" }}>
          <h2>Admin Dashboard Error</h2>
          <p>{errorMsg}</p>
          <button onClick={() => navigate("/")} className="btn-primary">Return to Home</button>
      </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
          <div>
              <h1 style={{ color: "var(--text-primary)", margin: 0, fontSize: "2.5rem", fontWeight: "800" }}>Super Admin Dashboard</h1>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>System-wide management and analytics</p>
          </div>
          
          <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "var(--border-subtle)", padding: "4px" }}>
              <button 
                onClick={() => setActiveTab("overview")} 
                style={{ padding: "8px 16px", background: activeTab === "overview" ? "var(--accent-primary)" : "transparent", color: activeTab === "overview" ? "white" : "var(--text-secondary)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "600" }}>
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("management")} 
                style={{ padding: "8px 16px", background: activeTab === "management" ? "var(--accent-primary)" : "transparent", color: activeTab === "management" ? "white" : "var(--text-secondary)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "600" }}>
                Admin Management
              </button>
          </div>
      </div>

      {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <StatCard title="Total Users" value={stats.totalUsers} icon="fa-users" color="var(--accent-primary)" />
                <StatCard title="Active Bookings" value={stats.activeBookings} icon="fa-car" color="var(--status-success)" />
                <StatCard title="Total Slots" value={stats.totalSlots} icon="fa-square-parking" color="var(--status-warning)" />
                <StatCard title="Revenue" value={`$${stats.revenue}`} icon="fa-sack-dollar" color="var(--status-danger)" />
            </div>

            <h2 style={{ marginBottom: "16px" }}>Global Recent Bookings</h2>
            <div style={{ overflowX: "auto", background: "white", borderRadius: "var(--radius-md)", border: "var(--border-subtle)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "var(--bg-tertiary)", textAlign: "left" }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Slot</th>
                    <th style={thStyle}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                    <tr key={b._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={tdStyle}>{b.userId?.name}</td>
                        <td style={tdStyle}>{b.slotId?.parkingLotId?.name}</td>
                        <td style={tdStyle}>{b.slotId?.slotNumber}</td>
                        <td style={tdStyle}>{b.status}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </>
      )}

      {activeTab === "management" && (
          <div className="grid">
              {/* Create Admin Form */}
              <div className="card" style={{ padding: "24px" }}>
                  <h2 style={{ marginBottom: "20px" }}>Create Lot Admin</h2>
                  <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <input 
                        type="text" placeholder="Full Name" className="form-input" required 
                        value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                      />
                      <input 
                        type="email" placeholder="Email Address" className="form-input" required 
                        value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                      />
                      <input 
                        type="password" placeholder="Password" className="form-input" required 
                        value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                      />
                      <button type="submit" className="btn-primary">Create Administrator</button>
                  </form>
              </div>

              {/* Assignment Form */}
              <div className="card" style={{ padding: "24px" }}>
                  <h2 style={{ marginBottom: "20px" }}>Assign Admin to Lot</h2>
                  <form onSubmit={handleAssignLot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <select 
                        className="form-input" required 
                        value={assignment.lotId} onChange={e => setAssignment({...assignment, lotId: e.target.value})}>
                          <option value="">Select Parking Lot</option>
                          {lots.map(l => (
                              <option key={l._id} value={l._id}>{l.name} ({l.district})</option>
                          ))}
                      </select>
                      <select 
                        className="form-input" required 
                        value={assignment.adminId} onChange={e => setAssignment({...assignment, adminId: e.target.value})}>
                          <option value="">Select Administrator</option>
                          {lotAdmins.map(a => (
                              <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                          ))}
                      </select>
                      <button type="submit" className="btn-primary" style={{ background: "var(--status-success)" }}>Assign Lot Admin</button>
                  </form>
                  
                  <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                      <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Current Assignments</h3>
                      {lots.map(l => (
                          <div key={l._id} style={{ fontSize: "0.9rem", marginBottom: "8px", color: "var(--text-secondary)" }}>
                              <strong>{l.name}:</strong> {l.parkingLotAdminId?.name || <span style={{ color: "var(--status-danger)" }}>Unassigned</span>}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ background: "var(--bg-secondary)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)", position: "relative" }}>
    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px" }}>{title}</div>
    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{value}</div>
    <div style={{ position: "absolute", right: "20px", top: "20px", color: color, opacity: 0.2 }}>
        <i className={`fa-solid ${icon} fa-2x`}></i>
    </div>
  </div>
);

const thStyle = { padding: "16px 20px", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700" };
const tdStyle = { padding: "16px 20px", color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)" };
