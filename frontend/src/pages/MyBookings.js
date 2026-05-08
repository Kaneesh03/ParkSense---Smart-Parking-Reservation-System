import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const load = () => {
    axios.get("/bookings/my").then(res => setBookings(res.data));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    await axios.delete(`/bookings/${id}`);
    load();
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
           <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "4px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              My Bookings
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>View and manage your parking reservations.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", border: "var(--border-subtle)" }}>
            <i className="fa-regular fa-calendar-xmark fa-3x" style={{ color: "var(--text-muted)", marginBottom: "16px" }}></i>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>You have no bookings yet.</p>
        </div>
      ) : (
        <>
          {/* ACTIVE BOOKINGS SECTION */}
          <h3 style={{ marginTop: '20px', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: '800' }}>
             <i className="fa-solid fa-circle-check" style={{ color: '#047857' }}></i> Active Reservations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {bookings.filter(b => b.status === "Active").length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No active reservations.</p> :
              bookings.filter(b => b.status === "Active").map(b => (
                <div key={b._id} style={{ background: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>REFERENCE NUMBER</div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '800' }}>#{b._id.slice(-6).toUpperCase()}</h3>
                      </div>
                      <span style={{ background: 'var(--tag-mint)', color: '#047857', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>ACTIVE</span>
                  </div>
                  
                  <div style={{ flexGrow: 1, background: '#f4f5f8', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                      <p style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}><i className="fa-solid fa-location-dot" style={{ color: 'var(--text-muted)', width: '24px' }}></i> {b.slotId?.slotNumber || "Unknown Slot"}</p>
                      <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><i className="fa-regular fa-calendar" style={{ color: 'var(--text-muted)', width: '24px' }}></i> {new Date(b.startTime).toLocaleDateString()}</p>
                      <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><i className="fa-regular fa-clock" style={{ color: 'var(--text-muted)', width: '24px' }}></i> {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  {/* Actions Link */}
                  <div style={{ display: "flex", gap: "12px" }}>
                      <a href={`/receipt/${b._id}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "14px", fontSize: "0.95rem", textDecoration: "none", background: "#0f172a", color: "white", borderRadius: "12px", textAlign: "center", fontWeight: "700", transition: "var(--transition)" }}>
                          <i className="fa-solid fa-qrcode" style={{ marginRight: '6px' }}></i> Digital Pass
                      </a>
                      <button
                        onClick={() => cancel(b._id)}
                        style={{ padding: "14px", width: "50px", background: "var(--tag-peach)", color: "#b45309", border: "none", borderRadius: "12px", cursor: "pointer", transition: "var(--transition)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Cancel Reservation"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* HISTORY SECTION */}
          <h3 style={{ marginTop: '48px', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: '800' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-muted)' }}></i> Booking History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.filter(b => b.status !== "Active").length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No past history.</p> :
              bookings.filter(b => b.status !== "Active").map(b => (
                <div key={b._id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: b.status === 'Completed' ? '#f1f5f9' : 'var(--tag-peach)', color: b.status === 'Completed' ? 'var(--text-muted)' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={b.status === 'Completed' ? "fa-solid fa-check" : "fa-solid fa-xmark"}></i>
                      </div>
                      <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>#{b._id.slice(-6).toUpperCase()} • {b.slotId?.slotNumber || "Slot"}</h3>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(b.startTime).toLocaleDateString()}</div>
                      </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: b.status === 'Completed' ? 'var(--bg-primary)' : 'var(--tag-peach)', color: b.status === 'Completed' ? 'var(--text-secondary)' : '#b45309', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      {b.status.toUpperCase()}
                  </span>
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  );
}
