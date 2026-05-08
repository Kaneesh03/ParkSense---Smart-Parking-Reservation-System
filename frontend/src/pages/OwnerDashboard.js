import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [myLots, setMyLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const role = localStorage.getItem("role");
        if (role !== "owner") {
          navigate("/");
          return;
        }
        
        // Example: Wait for backend routes to be built to fetch these accurately
        // For now, simulating structure
        // const profileRes = await axios.get("/owner/profile");
        // const lotsRes = await axios.get("/owner/lots");
        
        setOwnerProfile({ status: "pending", businessName: "Loading..." }); // Mocked
        setLoading(false);
      } catch (err) {
        console.error("Owner Access Error", err);
        navigate("/");
      }
    };
    fetchOwnerData();
  }, [navigate]);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading Owner Dashboard...</div>;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
          <div style={{ background: "var(--accent-primary)", color: "white", padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-briefcase fa-2x"></i>
          </div>
          <div>
              <h1 style={{ color: "var(--text-primary)", margin: 0, fontSize: "2.5rem", fontWeight: "800" }}>Partner Portal</h1>
              <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "1.05rem" }}>Manage your parking locations</p>
          </div>
      </div>

      {ownerProfile?.status === "pending" && (
          <div style={{ background: "var(--status-warning-bg)", color: "var(--status-warning)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid #fcd34d", marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
              <i className="fa-solid fa-hourglass-half fa-2x"></i>
              <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>Account Under Review</h3>
                  <p style={{ margin: 0, fontSize: "0.95rem" }}>Your parking owner account is currently pending admin approval. You will not be able to list parking spaces until approved.</p>
              </div>
          </div>
      )}

      {ownerProfile?.status === "approved" && (
          <div>
              {/* Future Implementation Phase: Manage Lots */}
              <button className="btn-primary" style={{ width: "auto" }}>+ Add New Parking Lot</button>
          </div>
      )}
    </div>
  );
}
