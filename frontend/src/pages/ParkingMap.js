import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix react-leaflet default icon loading issue
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// Create a Crowded Icon (Red/Orange)
let CrowdedIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: var(--brand-orange); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-fire" style="transform: rotate(45deg); color: white; font-size: 14px;"></i>
          </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map controller to automatically pan/zoom map on data change
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
     if (center) {
         map.flyTo(center, zoom, {
             animate: true,
             duration: 1.5
         });
     }
  }, [center, zoom, map]);
  return null;
}

export default function ParkingMap() {
    const location = useLocation();
    const [parkingLots, setParkingLots] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // Tamil Nadu default center
    const defaultCenter = [11.1271, 78.6569];
    const defaultZoom = 7;
    
    // Exact mapping for known Tiruchirappalli parking lots
    const lotCoordinateFallback = {
        // Tiruchirappalli
        "Thillai Nagar Parking": [10.8285, 78.6835],
        "Gandhi Market Parking": [10.8166, 78.6947],
        "Chathiram Bus Stand Parking": [10.8267, 78.6974],
        "Trichy Junction Parking": [10.7963, 78.6826],
        "Airport Parking": [10.7656, 78.7186],
        "Srirangam Temple Parking": [10.8655, 78.6811],
        "Samayapuram Temple Parking": [10.9238, 78.7303],
        "NSB Road Parking": [10.8242, 78.6943],
        "Main Guard Gate Parking": [10.8277, 78.6961],
        "Bishop Heber College Area Parking": [10.8175, 78.6820],

        // Chennai
        "Chennai Central Parking": [13.0827, 80.2707],
        "Marina Beach Parking": [13.0500, 80.2824],
        "Chennai Airport Parking": [12.9941, 80.1709],
        "Chepauk Stadium Parking": [13.0628, 80.2793],
        "TNagar Commercial Parking": [13.0418, 80.2341],
        "Parrys Corner Parking": [13.0891, 80.2885],
        "Phoenix Marketcity Parking": [12.9915, 80.2173],
        "Express Avenue Parking": [13.0587, 80.2641],
        "Kapaleeshwarar Temple Parking": [13.0335, 80.2698],
        "Kilambakkam Bus Terminus Parking": [12.8711, 80.0760],

        // Namakkal
        "Namakkal Bazaar Parking": [11.2189, 78.1678],
        "Anjaneyar Temple Parking": [11.2185, 78.1666],
        "New Bus Stand Parking": [11.2120, 78.1764],
        "Salem Road Parking": [11.2294, 78.1633],
        "Agaya Gangai Falls Parking": [11.2825, 78.3411]
    };

    // Fallback coordinates for districts (used if lot doesn't match specific mapping)
    const districtCenterMap = {
        "Tiruchirappalli": [10.7905, 78.7047],
        "Chennai": [13.0827, 80.2707],
        "Madurai": [9.9252, 78.1198],
        "Coimbatore": [11.0168, 76.9558],
        "Salem": [11.6643, 78.1460],
        "Vellore": [12.9165, 79.1325],
        "Erode": [11.3410, 77.7172],
        "Thoothukudi": [8.8052, 78.1452],
        "Tirunelveli": [8.7139, 77.7567],
        "Kanchipuram": [12.8342, 79.7037],
        "Thanjavur": [10.7870, 79.1378],
        "Dindigul": [10.3673, 77.9803],
    };

    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [mapZoom, setMapZoom] = useState(defaultZoom);

    // Initial load: districts and incoming state
    useEffect(() => {
        // Fetch active districts from API
        axios.get("/districts")
             .then(res => {
                 setDistricts(res.data.map(d => d.name));
                 
                 // Handle incoming district from ParkingList navigation
                 if (location.state && location.state.selectedDistrict) {
                     setSelectedDistrict(location.state.selectedDistrict);
                 } else {
                     setSelectedDistrict("");
                 }
             })
             .catch(err => console.error("Error fetching districts:", err));
    }, [location.state]);

    // Fetch lots whenever the selected district changes
    useEffect(() => {
        setIsLoading(true);
        // Using the shared axios instance with base URL /api
        const query = selectedDistrict ? `?district=${selectedDistrict}` : "";
        axios.get(`/parking${query}`)
             .then(res => {
                 setParkingLots(res.data);
                 
                 // Map Centering Logic
                 if (selectedDistrict) {
                     // 1. Try average of markers with real or fallback coords
                     const activeMarkers = res.data.map(lot => {
                         if (lot.lat && lot.lng) return [lot.lat, lot.lng];
                         if (lotCoordinateFallback[lot.name]) return lotCoordinateFallback[lot.name];
                         return null;
                     }).filter(Boolean);

                     if (activeMarkers.length > 0) {
                        const avgLat = activeMarkers.reduce((sum, m) => sum + m[0], 0) / activeMarkers.length;
                        const avgLng = activeMarkers.reduce((sum, m) => sum + m[1], 0) / activeMarkers.length;
                        setMapCenter([avgLat, avgLng]);
                        setMapZoom(13);
                     } else if (districtCenterMap[selectedDistrict]) {
                        // 2. Fallback to district center
                        setMapCenter(districtCenterMap[selectedDistrict]);
                        setMapZoom(12);
                     }
                 } else {
                     setMapCenter(defaultCenter);
                     setMapZoom(defaultZoom);
                 }
                 setIsLoading(false);
             })
             .catch(err => {
                 console.error("Error fetching parking lots:", err);
                 setIsLoading(false);
             });
    }, [selectedDistrict]);

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
    };

    const isCrowded = (lot) => {
        if (!lot.totalSlots) return false;
        return (lot.bookedSlots / lot.totalSlots) >= 0.75;
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                <div>
                    <h1 className="dashboard-title" style={{ fontSize: '1.8rem' }}>District Parking Map</h1>
                    <p className="dashboard-subtitle">Real-time availability across Tamil Nadu</p>
                </div>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <select 
                            className="form-input" 
                            style={{ 
                                maxWidth: '300px', padding: '10px 15px', border: '2px solid #eef2f6', borderRadius: '12px',
                                fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', outline: 'none'
                            }}
                            value={selectedDistrict}
                            onChange={handleDistrictChange}
                        >
                            <option value="">All Districts (Tamil Nadu)</option>
                            {districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', background: '#2563eb', borderRadius: '4px' }}></div>
                            <span style={{ color: 'var(--text-secondary)' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', background: 'var(--brand-orange)', borderRadius: '4px' }}></div>
                            <span style={{ color: 'var(--text-secondary)' }}>High Demand</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ flex: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', position: 'relative' }}>
                    
                    {isLoading && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(4px)', zIndex: 1001, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                             <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '15px' }}></i>
                             <p style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Updating view...</p>
                        </div>
                    )}

                    {!isLoading && selectedDistrict && parkingLots.length === 0 && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px'
                        }}>
                            <div style={{ background: 'var(--bg-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <i className="fa-solid fa-map-pin" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '800' }}>No Smart Parking in {selectedDistrict}</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.95rem' }}>Stay tuned! We are expanding to new areas every week.</p>
                            <button 
                                onClick={() => setSelectedDistrict("")}
                                style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                View All Tamil Nadu
                            </button>
                        </div>
                    )}

                    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapController center={mapCenter} zoom={mapZoom} />
                        
                        {!isLoading && parkingLots.map(lot => {
                            // Coordinate Priority: DB Coords > Custom Fallback > District Center
                            let position = null;
                            if (lot.lat && lot.lng) {
                                position = [lot.lat, lot.lng];
                            } else if (lotCoordinateFallback[lot.name]) {
                                position = lotCoordinateFallback[lot.name];
                            } else if (districtCenterMap[lot.district]) {
                                position = districtCenterMap[lot.district];
                            }
                            
                            if (!position) return null;

                            return (
                                <Marker 
                                    key={lot._id} 
                                    position={position}
                                    icon={isCrowded(lot) ? CrowdedIcon : DefaultIcon}
                                >
                                    <Popup>
                                        <div style={{ padding: '8px', textAlign: 'center', minWidth: '180px' }}>
                                            {isCrowded(lot) && (
                                                <div style={{ color: 'var(--brand-orange)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <i className="fa-solid fa-fire"></i> High Demand
                                                </div>
                                            )}
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{lot.name}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>{lot.location}</p>
                                            
                                            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '12px', marginBottom: '14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Live Slots</span>
                                                    <span style={{ color: isCrowded(lot) ? 'var(--status-danger)' : 'var(--status-success)', fontWeight: '800' }}>
                                                        {lot.availableSlots} / {lot.totalSlots}
                                                    </span>
                                                </div>
                                                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', 
                                                        width: `${(lot.availableSlots / (lot.totalSlots || 1)) * 100}%`, 
                                                        background: isCrowded(lot) ? 'var(--status-danger)' : 'var(--status-success)',
                                                        transition: 'width 0.8s'
                                                    }}></div>
                                                </div>
                                            </div>

                                            <Link 
                                                to={`/slots/${lot._id}`} 
                                                className="btn-primary" 
                                                style={{ display: 'inline-flex', padding: '10px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', color: 'white', background: 'var(--accent-primary)', fontWeight: '700' }}
                                            >
                                                Book Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}


