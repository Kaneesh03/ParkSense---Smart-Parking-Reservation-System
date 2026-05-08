import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAuthenticated = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Brand linking to Landing Page or Parking depending on auth */}
      <h2 onClick={() => navigate(isAuthenticated ? "/parking" : "/")} style={{ margin: 0, cursor: 'pointer', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.opacity = 0.8} onMouseOut={e => e.currentTarget.style.opacity = 1}>
        <i className="fa-solid fa-square-parking" style={{ color: "var(--accent-primary)" }}></i> 
        ParkSense
      </h2>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAuthenticated ? (
            <>
                <Link className="nav-link" to="/parking">
                  <i className="fa-solid fa-map-location-dot"></i> Parking
                </Link>
                <Link className="nav-link" to="/bookings">
                  <i className="fa-solid fa-ticket"></i> Bookings
                </Link>
                {role === "admin" && (
                  <Link className="nav-link" to="/admin">
                    <i className="fa-solid fa-shield-halved"></i> Admin
                  </Link>
                )}
                <button className="btn-logout" onClick={logout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                </button>
            </>
        ) : (
            <>
                <Link className="nav-link" to="/">
                  <i className="fa-solid fa-house"></i> Home
                </Link>
                <a className="nav-link" href="/#features">
                  <i className="fa-solid fa-star"></i> Features
                </a>
                <Link className="nav-link" to="/login" style={{ background: 'var(--accent-primary)', color: 'white', padding: '8px 16px', borderRadius: '20px', marginLeft: '10px' }}>
                  <i className="fa-solid fa-user"></i> Login
                </Link>
            </>
        )}
      </div>
    </div>
  );
}
