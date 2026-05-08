import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";


export default function ParkingList() {
  const [lots, setLots] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || "";

  const tamilNaduDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivagangai", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
  ];

  useEffect(() => {
    // If search query matches a district exactly, update the dropdown
    const matchedDistrict = tamilNaduDistricts.find(d => d.toLowerCase() === searchQuery.toLowerCase());
    if (matchedDistrict) {
        setSelectedDistrict(matchedDistrict);
    }
  }, [searchQuery]);

  useEffect(() => {
    console.log("Fetching parking lots...");
    axios.get("/parking")
      .then(res => {
        console.log("Got lots:", res.data);
        setLots(res.data);
      })
      .catch(err => {
        console.error("Error fetching lots:", err);
        showNotification("error", "Failed to fetch parking lots. Check console/backend.");
      });
  }, []);

  // Filter lots based on both District and Search Query
  const filteredLots = lots.filter(lot => {
    const matchesSearch = !searchQuery || 
        lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If we have a general search query, we show anything that matches it
    // But we still respect the selectedDistrict if no query is present
    if (searchQuery) return matchesSearch;
    
    return lot.district === selectedDistrict;
  });


  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
           <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "4px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Find Parking
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>Browse available smart parking locations in your district.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", padding: "8px 16px", borderRadius: "20px", boxShadow: "var(--shadow-sm)" }}>
                <i className="fa-solid fa-location-dot" style={{ color: "var(--text-muted)" }}></i>
                <select 
                    value={selectedDistrict} 
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                        padding: "6px",
                        border: "none",
                        fontSize: "0.95rem",
                        outline: "none",
                        minWidth: "200px",
                        background: "transparent",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "var(--text-primary)"
                    }}
                >
                    {tamilNaduDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={() => navigate('/map', { state: { selectedDistrict } })}
                style={{ 
                    background: "var(--accent-primary)", 
                    color: "white", 
                    border: "none", 
                    width: "44px", 
                    height: "44px", 
                    borderRadius: "14px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: "var(--shadow-md)",
                    transition: "var(--transition)"
                }}
                title="View on Map"
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <i className="fa-solid fa-map-location-dot"></i>
            </button>
        </div>
      </div>

      {filteredLots.length === 0 && lots.length > 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-subtle)", animation: "fadeIn 0.5s" }}>
            <i className="fa-solid fa-magnifying-glass fa-4x" style={{ color: "var(--text-muted)", marginBottom: "20px" }}></i>
            <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "12px" }}>
                {searchQuery ? `No results for "${searchQuery}"` : `Coming Soon to ${selectedDistrict}!`}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                {searchQuery 
                    ? "Try searching for a different location name or district."
                    : `ParkSense is rapidly expanding across Tamil Nadu. Operations in ${selectedDistrict} are currently being set up.`}
            </p>
            {searchQuery && (
                <button 
                    onClick={() => navigate('/parking')}
                    style={{ marginTop: "24px", padding: "12px 24px", borderRadius: "12px", border: "none", background: "var(--accent-primary)", color: "white", fontWeight: "700", cursor: "pointer" }}
                >
                    Clear Search
                </button>
            )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {lots.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
              <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "var(--accent-primary)" }}></i>
              <p style={{ marginTop: "16px", color: "var(--text-secondary)", fontWeight: "500" }}>Loading parking availability...</p>
            </div>
          )}
          {filteredLots.map(lot => (
            <div key={lot._id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)';}} onClick={() => navigate(`/slots/${lot._id}`)}>
              
              {/* Image Header */}
              <div style={{ width: '100%', height: '180px', backgroundColor: '#f8fafc', position: 'relative' }}>
                  <img src={lot.images && lot.images.length > 0 ? encodeURI(lot.images[0]) : '/Logo.png'} alt={lot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/Logo.png'; }} />
              </div>

              {/* Content Area */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Header / Badge Area */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "white", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    <i className="fa-solid fa-square-parking"></i>
                  </div>
                  <span style={{ background: "var(--tag-mint)", color: "#047857", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                     Fast Book
                  </span>
                </div>

              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 8px 0" }}>{lot.name}</h3>
                <p style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--text-muted)" }}></i> {lot.location}
                </p>
                <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase" }}>
                    {lot.district}
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>{lot.availableSlots} spaces left</span>
                  <div style={{ color: "var(--accent-primary)", fontWeight: "700", fontSize: "0.95rem" }}>
                      Reserve <i className="fa-solid fa-arrow-right" style={{ marginLeft: "4px" }}></i>
                  </div>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
