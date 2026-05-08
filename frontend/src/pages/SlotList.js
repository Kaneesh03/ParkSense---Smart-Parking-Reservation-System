import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import AirportParkingBlueprintLayout from "../components/AirportParkingBlueprintLayout";

export default function SlotList() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [slots, setSlots] = useState([]);
    const [parkingLot, setParkingLot] = useState(null);
    const [userBookingCount, setUserBookingCount] = useState(0);

    // Reservation Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [bookingData, setBookingData] = useState({
        vehicleNumber: "",
        vehicleType: "Four-wheeler",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: ""
    });
    const [validationError, setValidationError] = useState("");

    const load = async () => {
        try {
            // Fetch Slots
            const slotRes = await axios.get(`/slots/${id}`);
            setSlots(slotRes.data);

            // Fetch Parking Lot Details (to get Name)
            const lotsRes = await axios.get("/parking");
            const currentLot = lotsRes.data.find(l => l._id === id);
            setParkingLot(currentLot);

            // Fetch user's bookings to count them for this lot
            const bookingRes = await axios.get("/bookings/my");
            // Count active/valid bookings for limit
            const count = bookingRes.data.filter(b => b.slotId && b.slotId.parkingLotId === id && b.status === "Active").length;
            setUserBookingCount(count);

        } catch (e) {
            console.error("Failed to load data", e);
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    const openBookingModal = (slotId) => {
        if (userBookingCount >= 2) {
            showNotification("warning", "A user can book only 2 slots in a lot");
            return;
        }
        setSelectedSlotId(slotId);
        // Default to today for dates
        const today = new Date().toISOString().split('T')[0];
        setBookingData({
            vehicleNumber: "",
            vehicleType: "Four-wheeler",
            startDate: today,
            startTime: "",
            endDate: today,
            endTime: ""
        });
        setValidationError("");
        setShowModal(true);
    };

    const handleConfirmBooking = async () => {
        // Indian Vehicle Regex: XX NN AA NNNN (Allowing flexible spaces/dashes)
        // e.g. KA 01 AB 1234, MH-12-CD-5678, DL01EF9012
        const vehicleRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/;

        if (!bookingData.vehicleNumber) {
            setValidationError("Please enter a vehicle number");
            return;
        }

        if (!vehicleRegex.test(bookingData.vehicleNumber.toUpperCase())) {
            setValidationError("Invalid Format. Use: XX 00 AA 0000 (e.g., MH 12 AB 1234)");
            return;
        }

        if (!bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime) {
            showNotification("warning", "Please select both Start and End Date/Time");
            return;
        }

        // Construct Date Objects
        const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}:00`);
        const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}:00`);

        if (startDateTime >= endDateTime) {
            showNotification("error", "End time must be after Start time");
            return;
        }

        try {
            const res = await axios.post("/bookings", {
                slotId: selectedSlotId,
                vehicleNumber: bookingData.vehicleNumber,
                vehicleType: bookingData.vehicleType,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString()
            });

            // Close modal and redirect to payment
            setShowModal(false); // Corrected from setShowBookingModal
            navigate(`/payment/${res.data.bookingId}`);

        } catch (err) {
            console.error(err);
            showNotification("error", err.response?.data?.message || "Booking failed");
        }
    };

    const SlotItem = ({ s, userBookingCount, book }) => {
        const isFree = !s.isBooked && userBookingCount < 2;
        return (
            <div
                onClick={() => !s.isBooked && (userBookingCount < 2 ? book(s._id) : showNotification("warning", "A user can book only 2 slots in a lot"))}
                style={{
                    ...(userBookingCount >= 2 && !s.isBooked ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                    minWidth: '80px',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '16px',
                    cursor: isFree ? 'pointer' : 'default',
                    transition: 'var(--transition)',
                    background: s.isBooked ? '#f1f5f9' : 'white',
                    border: isFree ? '2px solid var(--tag-mint)' : (s.isBooked ? '2px solid #e2e8f0' : '2px solid transparent'),
                    boxShadow: isFree ? 'var(--shadow-sm)' : 'none',
                }}
                onMouseOver={(e) => { if(isFree) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
                onMouseOut={(e) => { if(isFree) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
            >
                <h4 style={{ fontSize: s.slotNumber.length > 5 ? '0.85rem' : '1.1rem', margin: '0 0 4px 0', wordBreak: 'break-word', color: s.isBooked ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: '800' }}>{s.slotNumber}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: s.isBooked ? 'transparent' : 'var(--tag-mint)', color: s.isBooked ? 'var(--text-muted)' : '#047857', padding: '4px 8px', borderRadius: '8px' }}>
                    {s.isBooked ? (
                       <><i className="fa-solid fa-lock" style={{marginRight: '2px'}}></i> Reserved</>
                    ) : (
                       <><i className="fa-solid fa-check" style={{marginRight: '2px'}}></i> Free</>
                    )}
                </span>
            </div>
        );
    };

    // --- NEW REALISTIC LAYOUTS ---

    const TechLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', padding: '0', background: 'transparent' }}>
            {/* Logic to group by Block (A, B, C) or Zones */}
            {["A", "B", "C"].map(block => {
                const relevantSlots = slots.filter(s => s.slotNumber.startsWith(block)); // e.g. "A-1"
                if (relevantSlots.length === 0) return null;

                return (
                    <div key={block} style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>🏢 Block {block}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {relevantSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>
                );
            })}
            {/* Slots that don't match A/B/C, grouped by Row letter */}
            {Object.entries(slots.reduce((acc, s) => {
                const row = s.slotNumber.split('-')[0];
                if (!['A', 'B', 'C'].includes(row)) {
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(s);
                }
                return acc;
            }, {})).map(([row, rowSlots]) => (
                <div key={row} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minWidth: '150px', borderTop: '5px solid #95a5a6' }}>
                    <h3 style={{ marginTop: 0, color: '#7f8c8d' }}>Zone {row}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                    </div>
                </div>
            ))}
        </div>
    );

    // 2. Cinema & Convention Layout (Basement/Event Parking)
    // Used for: Multiplex Cinema, Convention Center
    const CinemaLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ background: '#263238', padding: '30px', borderRadius: '15px', color: 'white' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #546e7a', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#eceff1' }}>🅿️ Basement Parking Zones</h3>
                <span style={{ fontSize: '0.8em', color: '#b0bec5' }}>24/7 Surveillance • Valet Available</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
                {Object.entries(slots.reduce((acc, s) => {
                    const row = s.slotNumber.split('-')[0];
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(s);
                    return acc;
                }, {})).sort().map(([row, rowSlots]) => (
                    <div key={row} style={{ background: '#37474f', padding: '15px', borderRadius: '8px', minWidth: '140px', border: '1px solid #455a64' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: '#80cbc4' }}>Zone {row}</span>
                            <span style={{ fontSize: '0.7em', background: '#546e7a', padding: '2px 6px', borderRadius: '4px' }}>Level B1</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em', color: '#cfd8dc', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <span>⬅️ Elevators</span>
                <span>⬇️ Exit</span>
                <span>Escalators ➡️</span>
            </div>
        </div>
    );

    // 3. Market Layout (Dense, Aisle)
    // Used for: Central Market Bazaar, Textile Bazaar Zone, City Food Court
    const MarketLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '15px', border: '2px solid #ffb74d' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: '#e65100', textTransform: 'uppercase', letterSpacing: '2px' }}>🚧 MARKET ENTRANCE 🚧</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                {Object.entries(slots.reduce((acc, s) => {
                    const row = s.slotNumber.split('-')[0];
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(s);
                    return acc;
                }, {})).sort().map(([row, rowSlots]) => (
                    <div key={row} style={{ background: '#fff', border: '1px dashed #ff9800', padding: '10px', borderRadius: '8px', minWidth: '120px' }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#f57c00', marginBottom: '5px' }}>🛒 Stall Row {row}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 4. Transit/Metro Layout (Linear)
    // Used for: Metro Station Parking
    const TransitLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ background: '#eceff1', padding: '30px', borderRadius: '10px' }}>
            <div style={{ height: '15px', background: '#37474f', borderRadius: '5px', marginBottom: '20px' }}></div>
            <div style={{ height: '15px', background: '#37474f', borderRadius: '5px', marginBottom: '20px', opacity: 0.5 }}></div>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '30px', paddingBottom: '20px' }}>
                {/* Single Long Row for visual linear effect, grouping logic */}
                {Object.entries(slots.reduce((acc, s) => {
                    const row = s.slotNumber.split('-')[0];
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(s);
                    return acc;
                }, {})).sort().map(([row, rowSlots]) => (
                    <div key={row} style={{ display: 'flex', gap: '5px', background: '#cfd8dc', padding: '10px', borderRadius: '5px' }}>
                        <div style={{ writingMode: 'vertical-rl', fontWeight: 'bold', color: '#455a64', transform: 'rotate(180deg)', textAlign: 'center' }}>ZONE {row}</div>
                        {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#546e7a', marginTop: '10px' }}>🚅 RAILWAY / ROAD TRACKS</div>
        </div>
    );

    // 5. Nature / Park Layout (Organic/Green)
    // Used for: Riverside Park
    const NatureLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ background: '#e8f5e9', padding: '30px', borderRadius: '25px', border: '5px solid #81c784' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px', color: '#2e7d32' }}>
                <h2 style={{ margin: 0 }}>🌳 Riverside Green Zone 🌳</h2>
                <span style={{ fontSize: '0.9em', color: '#558b2f' }}>Eco-Friendly Parking • Scenic View</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px' }}>
                {Object.entries(slots.reduce((acc, s) => {
                    const row = s.slotNumber.split('-')[0];
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(s);
                    return acc;
                }, {})).sort().map(([row, rowSlots]) => (
                    <div key={row} style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', color: '#388e3c', borderBottom: '2px dashed #a5d6a7', paddingBottom: '5px' }}>
                            🍃 Section {row}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#1b5e20', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                <span>🌊 River Viewpoint</span>
                <div style={{ height: '2px', width: '50px', background: '#81c784' }}></div>
                <span>🚴 Cycling Path</span>
            </div>
        </div>
    );

    // Custom Logic for Trichy Junction Visual Wireframe Reproduction
    const BlueprintSlotItem = ({ s, type="car", openSide="bottom" }) => {
        if (!s) return null;
        const isFree = !s.isBooked && userBookingCount < 2;
        const label = s.slotNumber.split('-').pop().replace(/A$|B$|C$/, '');
        
        let bgStyle = "#737373";
        if (s.isBooked) bgStyle = "#d32f2f";
        else if (type === "accessible") bgStyle = "#1976d2";
        
        const isVert = openSide === "top" || openSide === "bottom";
        const borderStyle = "2px solid white";
        
        return (
            <div onClick={() => !s.isBooked && (userBookingCount < 2 ? openBookingModal(s._id) : showNotification("warning", "A user can book only 2 slots in a lot"))}
                 style={{
                    width: isVert ? (type === 'bike' ? '30px' : (label === 'SUV' ? '65px' : '40px')) : '90px',
                    height: isVert ? '80px' : (type === 'bike' ? '30px' : '45px'),
                    borderTop: openSide === 'top' ? 'none' : borderStyle,
                    borderBottom: openSide === 'bottom' ? 'none' : borderStyle,
                    borderLeft: openSide === 'left' ? 'none' : borderStyle,
                    borderRight: openSide === 'right' ? 'none' : borderStyle,
                    backgroundColor: bgStyle,
                    color: 'white',
                    display: 'flex',
                    flexDirection: isVert ? 'column' : 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFree ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box',
                    position: 'relative'
                 }}>
                 <div style={{
                    position: 'absolute',
                    [openSide === 'bottom' ? 'top' : openSide === 'top' ? 'bottom' : openSide === 'right' ? 'left' : 'right']: '4px',
                    width: isVert ? '14px' : '6px',
                    height: isVert ? '6px' : '14px',
                    backgroundColor: s.isBooked ? '#ff5252' : '#69f0ae',
                    borderRadius: '8px',
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                 }}></div>
                 {type === 'accessible' && <i className="fa-solid fa-wheelchair" style={{ fontSize: '16px', marginBottom: '4px' }}></i>}
                 {type === 'bike' && <i className="fa-solid fa-motorcycle" style={{ fontSize: '10px', opacity: 0.8, position: 'absolute', bottom: isVert ? '4px' : 'auto', right: isVert? 'auto' : '4px' }}></i>}
                 <span style={{ fontSize: '12px', fontWeight: 'bold', zIndex: 1, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{label}</span>
            </div>
        )
    };

    const SlotGroup = ({ slots, type="car", openSide="bottom" }) => (
        <div style={{ display: 'flex', flexDirection: openSide === 'left' || openSide === 'right' ? 'column' : 'row', border: '2px solid white', borderTop: openSide === 'top' ? 'none' : '2px solid white', borderBottom: openSide === 'bottom' ? 'none' : '2px solid white', borderLeft: openSide === 'left' ? 'none' : '2px solid white', borderRight: openSide === 'right' ? 'none' : '2px solid white', backgroundColor: '#757575', padding: openSide === 'left' ? '0 2px 0 0' : openSide === 'top' ? '0 0 2px 0' : openSide === 'bottom' ? '2px 0 0 0' : '0 0 0 2px' }}>
           {slots.map((s, i) => <BlueprintSlotItem key={s?._id || i} s={s} type={type} openSide={openSide} />)}
        </div>
    );

    const TrichyJunctionLayout = ({ slots, userBookingCount, book }) => {
        const s_TopRowCars = slots.filter(s => s.slotNumber.startsWith("TJ-TR-S"));
        const s_TopRowBikes = slots.filter(s => s.slotNumber.startsWith("TJ-TR-T"));
        const s_LeftBikes = slots.filter(s => s.slotNumber.startsWith("TJ-LV-T"));
        const s_CenterLeftTop = slots.filter(s => s.slotNumber.startsWith("TJ-CLT-S"));
        const s_CenterLeftBottom = slots.filter(s => s.slotNumber.startsWith("TJ-CLB-"));
        const s_BottomLeftRow = slots.filter(s => s.slotNumber.startsWith("TJ-BL-"));
        const s_CenterRightTop = slots.filter(s => s.slotNumber.startsWith("TJ-CRT-"));
        const s_CenterRightBottom = slots.filter(s => s.slotNumber.startsWith("TJ-CRB-"));
        const s_Accessible = slots.filter(s => s.slotNumber.startsWith("TJ-ACC-"));
        const s_VIP = slots.filter(s => s.slotNumber.startsWith("TJ-VIP-"));
        const rightTopIds = ["TJ-RV-T20", "TJ-RV-T19", "TJ-RV-T18", "TJ-RV-T17", "TJ-RV-T15", "TJ-RV-T10A"];
        const s_RightBikesTop = rightTopIds.map(id => slots.find(s => s.slotNumber === id)).filter(Boolean);
        const rightBotIds = ["TJ-RV-T10B", "TJ-RV-T19B", "TJ-RV-T18B", "TJ-RV-T17B", "TJ-RV-T16", "TJ-RV-T19C", "TJ-RV-T20B"];
        const s_RightBikesBottom = rightBotIds.map(id => slots.find(s => s.slotNumber === id)).filter(Boolean);

        return (
            <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
                <div style={{ width: '1240px', minWidth: '1240px', height: '820px', position: 'relative', backgroundColor: '#8a8a8a', fontFamily: 'Arial, sans-serif', border: '5px solid #bdc3c7', borderRadius: '10px' }}>
                    
                    <h2 style={{ position: 'absolute', top: '15px', left: '20px', margin: 0, color: 'black', fontSize: '28px', fontWeight: '900' }}>Trichy Junction Parking</h2>
                    <h3 style={{ position: 'absolute', top: '25px', left: '500px', margin: 0, color: 'black', fontSize: '20px', fontWeight: '600' }}>Railway Station Side</h3>

                    <div style={{ position: 'absolute', top: '70px', left: '180px' }}>
                        <SlotGroup slots={s_TopRowCars} type="car" openSide="bottom" />
                        <div style={{ position: 'absolute', top: '90px', left: '-50px', display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center' }}>
                           <i className="fa-solid fa-arrow-up"></i>
                           <i className="fa-solid fa-arrow-down" style={{ marginTop: '30px' }}></i>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '70px', left: '700px' }}>
                        <div style={{ position: 'absolute', top: '-40px', left: '-50px', borderLeft: '4px solid white', borderRight: '4px solid white', width: '30px', height: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            {[1,2,3,4].map(i => <div key={i} style={{ height: '3px', backgroundColor: 'white' }}></div>)}
                        </div>
                        <SlotGroup slots={s_TopRowBikes} type="bike" openSide="bottom" />
                        <div style={{ position: 'absolute', top: '90px', right: '50px', color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Two-Wheeler Area</div>
                    </div>

                    <div style={{ position: 'absolute', top: '250px', left: '130px' }}>
                        <SlotGroup slots={s_LeftBikes} type="bike" openSide="right" />
                        <i className="fa-solid fa-arrow-up" style={{ position: 'absolute', right: '-30px', top: '40px', color: 'white', fontSize: '20px' }}></i>
                    </div>

                    <div style={{ position: 'absolute', top: '260px', left: '230px', backgroundColor: '#757575', border: '5px solid white', borderRadius: '15px', padding: '15px', paddingRight: '25px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div style={{ position: 'absolute', top: '-40px', left: '200px', color: 'white', fontWeight: 'bold', fontSize: '20px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Car Parking Area</div>
                        <SlotGroup slots={s_CenterLeftTop} type="car" openSide="top" />
                        <SlotGroup slots={s_CenterLeftBottom} type="car" openSide="bottom" />
                        <div style={{ position: 'absolute', left: '-15px', top: '80px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                        <div style={{ position: 'absolute', right: '-15px', top: '80px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                    </div>

                    <div style={{ position: 'absolute', top: '260px', left: '680px', backgroundColor: '#757575', border: '5px solid white', borderRadius: '15px', padding: '15px', paddingRight: '25px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <SlotGroup slots={s_CenterRightTop} type="car" openSide="top" />
                        <SlotGroup slots={s_CenterRightBottom} type="car" openSide="bottom" />
                        <div style={{ position: 'absolute', left: '-15px', top: '80px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                        <div style={{ position: 'absolute', right: '-15px', top: '80px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                        <i className="fa-solid fa-arrow-down" style={{ position: 'absolute', right: '-50px', top: '50px', color: 'white', fontSize: '24px' }}></i>
                    </div>

                    <div style={{ position: 'absolute', top: '150px', left: '1130px' }}>
                        <SlotGroup slots={s_RightBikesTop} type="bike" openSide="left" />
                    </div>

                    <div style={{ position: 'absolute', top: '500px', left: '550px', color: 'white', fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Driving Lane
                        <i className="fa-solid fa-arrow-right"></i>
                    </div>

                    <div style={{ position: 'absolute', top: '560px', left: '230px', backgroundColor: '#757575', border: '5px solid white', borderRadius: '15px 15px 0 0', padding: '15px', paddingRight: '25px', borderBottom: 'none' }}>
                        <SlotGroup slots={s_BottomLeftRow} type="car" openSide="top" />
                        <div style={{ position: 'absolute', left: '-15px', top: '40px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                        <div style={{ position: 'absolute', right: '-15px', top: '40px', backgroundColor: '#757575', borderRadius: '50%', padding: '2px' }}><i className="fa-solid fa-tree" style={{ color: 'white', fontSize: '22px' }}></i></div>
                        <div style={{ position: 'absolute', top: '-40px', left: '0', borderLeft: '4px solid white', borderRight: '4px solid white', width: '30px', height: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            {[1,2,3,4].map(i => <div key={i} style={{ height: '3px', backgroundColor: 'white' }}></div>)}
                        </div>
                        <i className="fa-solid fa-arrow-right" style={{ position: 'absolute', bottom: '-40px', left: '30px', color: 'white', fontSize: '24px' }}></i>
                    </div>

                    <div style={{ position: 'absolute', top: '690px', left: '270px', display: 'flex', gap: '20px', alignItems: 'flex-end', borderTop: '3px solid white', borderRight: '3px solid white', padding: '10px 10px 0 0' }}>
                        <div style={{ position: 'absolute', top: '-25px', left: '50px', color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Accessible</div>
                        <div>
                            <SlotGroup slots={s_Accessible} type="accessible" openSide="top" />
                        </div>
                        <div style={{ position: 'absolute', top: '-25px', left: '240px', color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Reserved / VIP</div>
                        <div>
                            <SlotGroup slots={s_VIP} type="vip" openSide="top" />
                        </div>
                    </div>

                    <div style={{ position: 'absolute', top: '750px', left: '600px', backgroundColor: '#e0e0e0', padding: '8px 12px', border: '3px solid #616161', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        Ticket Kiosk /<br/>Payment
                    </div>
                    
                    <i className="fa-solid fa-arrow-left" style={{ position: 'absolute', top: '710px', left: '710px', color: 'white', fontSize: '24px' }}></i>

                    <div style={{ position: 'absolute', top: '490px', left: '1130px' }}>
                        <SlotGroup slots={s_RightBikesBottom} type="bike" openSide="left" />
                        <i className="fa-solid fa-arrow-down" style={{ position: 'absolute', left: '-50px', top: '80px', color: 'white', fontSize: '24px' }}></i>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0', left: '60px', width: '200px', height: '160px', backgroundColor: '#616161', borderTop: '5px solid white', borderRight: '5px solid white', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '15px', gap: '30px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <i className="fa-solid fa-arrow-down" style={{ color: 'white', fontSize: '32px', marginBottom: '15px' }}></i>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: '900', letterSpacing: '1px' }}>ENTRY</div>
                        </div>

                        <div style={{ position: 'absolute', top: '60px', left: '0', right: '0', height: '30px', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '26px', height: '40px', backgroundColor: '#e0e0e0', borderRadius: '13px', border: '2px solid #333', zIndex: 10 }}></div>
                            <div style={{ position: 'absolute', top: '15px', left: '-20px', width: '80px', height: '8px', background: 'repeating-linear-gradient(45deg, #d32f2f, #d32f2f 10px, white 10px, white 20px)', border: '1px solid black' }}></div>
                            <div style={{ position: 'absolute', top: '15px', right: '40px', width: '80px', height: '8px', background: 'repeating-linear-gradient(45deg, #d32f2f, #d32f2f 10px, white 10px, white 20px)', border: '1px solid black' }}></div>
                            <i className="fa-solid fa-circle" style={{ position: 'absolute', color: '#4caf50', top: '2px', left: '80px', fontSize: '8px' }}></i>
                            <i className="fa-solid fa-circle" style={{ position: 'absolute', color: '#4caf50', top: '30px', right: '110px', fontSize: '8px' }}></i>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <i className="fa-solid fa-arrow-up" style={{ color: 'white', fontSize: '32px', marginBottom: '15px' }}></i>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: '900', letterSpacing: '1px' }}>EXIT</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Original / Fallback Layouts (Kept for existing logic compatibility)
    const AirportLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {["T1", "T2"].map(term => (
                <div key={term} style={{ background: '#e1f5fe', padding: '15px', borderRadius: '12px', border: '2px solid #81d4fa', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ borderBottom: '2px solid #0288d1', paddingBottom: '8px', color: '#01579b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ✈️ Terminal {term.slice(1)} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>Departure</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        {slots.filter(s => s.slotNumber.startsWith(term)).map(s => (
                            <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const MallLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Fallback to genetic P1/P2/P3 checking if generic Mall */}
            {["P1", "P2", "P3"].map(level => {
                // Check if we even have slots for this level, else show 3 levels for "City Center Mall" effect
                // The new MallLayout logic handles City Center Mall specifically by defaulting to this if named so. 
                // But we should make it generic: Check if slots exist? 
                // Or just render P1-P3 as per original design.
                const icons = { P1: "🛍️", P2: "👗", P3: "🎬" };
                const colors = { P1: "#d81b60", P2: "#8e24aa", P3: "#e53935" };
                const bgColors = { P1: "#fce4ec", P2: "#f3e5f5", P3: "#ffebee" };

                return (
                    <div key={level}>
                        <div style={{ background: colors[level], color: 'white', padding: '8px 20px', borderRadius: '8px 8px 0 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1em' }}>
                            {icons[level]} Level {level.slice(1)}
                        </div>
                        <div style={{ background: bgColors[level], border: `2px solid ${colors[level]}`, padding: '15px', borderRadius: '0 0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {slots.filter(s => s.slotNumber.startsWith(level)).map(s => (
                                <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const StadiumLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '900px', margin: '0 auto', background: '#e8f5e9', padding: '30px', borderRadius: '20px', border: '5px solid #43a047' }}>
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ color: '#2e7d32', margin: 0 }}>🏟️ Stadium Arena Parking</h2>
            </div>
            {["North", "South", "East", "West"].map(gate => (
                <div key={gate} style={{ textAlign: 'center', border: '2px dashed #66bb6a', padding: '15px', borderRadius: '10px', background: 'white' }}>
                    <h3 style={{ color: '#2e7d32', marginBottom: '15px' }}>{gate === 'North' || gate === 'South' ? '⚽' : '🏏'} {gate} Gate</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {slots.filter(s => s.slotNumber.startsWith(gate)).map(s => (
                            <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const HospitalLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Emergency Zone */}
                <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', border: '2px solid #e57373', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#c62828', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>🚑 Emergency <span style={{ fontSize: '0.7em', background: '#ef5350', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>PRIORITY</span></h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {slots.filter(s => s.slotNumber.startsWith("Emerg")).map(s => (
                            <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                        ))}
                    </div>
                </div>
                {/* Staff Zone */}
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '2px solid #64b5f6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#1565c0', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>👨‍⚕️ Staff Only</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {slots.filter(s => s.slotNumber.startsWith("Staff")).map(s => (
                            <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Visitor Zone */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '15px' }}>
                <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>🅿️ Visitor Parking</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '15px' }}>
                    {slots.filter(s => s.slotNumber.startsWith("Visitor")).map(s => (
                        <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />
                    ))}
                </div>
            </div>
        </div>
    );

    const CampusLayout = ({ slots, userBookingCount, book }) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', maxWidth: '900px', margin: '0 auto', background: '#fff8e1', padding: '20px', borderRadius: '15px', border: '1px solid #ffecb3' }}>

            {/* TOP ROW */}
            <div style={{ gridColumn: '1 / -1', background: '#fff', borderBottom: '4px solid #ffb300', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#f57f17' }}>🎓 Top Plaza</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {slots.filter(s => s.slotNumber.startsWith("Top-")).map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                </div>
            </div>

            {/* LEFT COLUMN */}
            <div style={{ gridColumn: '1 / 2', background: '#fff', borderRight: '4px solid #ffcc80', padding: '10px', borderRadius: '8px' }}>
                <h4 style={{ textAlign: 'center', color: '#ef6c00' }}>📚 West Wing</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {slots.filter(s => s.slotNumber.startsWith("Left-")).map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                </div>
            </div>

            {/* CENTER ISLANDS */}
            <div style={{ gridColumn: '2 / 4', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ textAlign: 'center', color: '#5d4037' }}>🏛️ Central A</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {slots.filter(s => s.slotNumber.startsWith("CenterA-")).map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                    </div>
                </div>
                <div style={{ width: '50px', background: '#555', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', borderRadius: '5px', letterSpacing: '3px', fontSize: '0.8em' }}>
                    DRIVING LANE ⬆⬇
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ textAlign: 'center', color: '#5d4037' }}>🏛️ Central B</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {slots.filter(s => s.slotNumber.startsWith("CenterB-")).map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ gridColumn: '4 / 5', background: '#fff', borderLeft: '4px solid #ffcc80', padding: '10px', borderRadius: '8px' }}>
                <h4 style={{ textAlign: 'center', color: '#ef6c00' }}>📚 East Wing</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {slots.filter(s => s.slotNumber.startsWith("Right-")).map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                </div>
            </div>
        </div>
    );

    const StandardLayout = ({ slots, userBookingCount, book }) => (
        <div className="parking-layout" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(slots.reduce((groups, slot) => {
                const row = slot.slotNumber.split("-")[0];
                if (!groups[row]) groups[row] = [];
                groups[row].push(slot);
                return groups;
            }, {})).sort().map(([row, rowSlots]) => (
                <div key={row} className="parking-row" style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: '800', marginBottom: '16px', color: 'var(--text-secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Row {row}</div>
                    <div className="slot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        {rowSlots.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                    </div>
                    <div className="driving-lane" style={{ height: '40px', background: 'var(--bg-sidebar)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8em', letterSpacing: '2px' }}>⬇⬆ DRIVING LANE ⬇⬆</div>
                </div>
            ))}
        </div>
    );

    // --- NEW TEMPLE LAYOUT TEMPLATE ---
    const TempleLayout = ({ slots, userBookingCount, book, parkingLotName }) => {
        const bikes = slots.filter(s => s.slotNumber.startsWith("T-BIKE-"));
        const cars = slots.filter(s => s.slotNumber.startsWith("T-CAR-"));
        const vips = slots.filter(s => s.slotNumber.startsWith("T-VIP-"));
        const accs = slots.filter(s => s.slotNumber.startsWith("T-ACC-"));

        return (
            <div style={{ background: '#fdfbf7', padding: '30px', borderRadius: '20px', border: '2px solid #e2d8ce', display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ color: '#d35400', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <i className="fa-solid fa-om" style={{ color: '#f39c12' }}></i> {parkingLotName?.toUpperCase()} <i className="fa-solid fa-om" style={{ color: '#f39c12' }}></i>
                    </h2>
                    <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Divine & Safe Parking Zone</p>
                </div>

                {/* Entry & VIP Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #27ae60', width: '200px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>⬇️ ENTRY GATE</h3>
                        <p style={{ fontSize: '0.8em', color: '#7f8c8d' }}>Ticket Counter / Scanning</p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {vips.length > 0 && (
                            <div style={{ background: '#fff', border: '2px dashed #f39c12', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#f39c12' }}>⭐ VIP Reserved</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {vips.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                                </div>
                            </div>
                        )}
                        {accs.length > 0 && (
                            <div style={{ background: '#fff', border: '2px solid #3498db', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>♿ Accessible Parking</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {accs.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Central Pathway & Main Parking */}
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* Bikes (Dense) */}
                    <div style={{ flex: 1, minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #bdc3c7', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#34495e', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>🛵 Two-Wheeler Zone (Dense)</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                            {bikes.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>

                    {/* Pedestrian Path */}
                    <div style={{ width: '80px', minHeight: '300px', background: 'repeating-linear-gradient(0deg, #ecf0f1, #ecf0f1 10px, #bdc3c7 10px, #bdc3c7 20px)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2c3e50', fontSize: '1.2em', fontWeight: 'bold', gap: '20px', textShadow: '1px 1px 0px #fff' }}>
                        <span>🚶</span>
                        <span>W</span>
                        <span>A</span>
                        <span>L</span>
                        <span>K</span>
                        <span>W</span>
                        <span>A</span>
                        <span>Y</span>
                        <span style={{ fontSize: '1.5em', marginTop: '10px' }}>🏛️</span>
                    </div>

                    {/* Cars (Rows) */}
                    <div style={{ flex: 1.5, minWidth: '400px', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #bdc3c7' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#34495e', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>🚙 Four-Wheeler Columns</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px' }}>
                            {cars.map(s => <SlotItem key={s._id} s={s} userBookingCount={userBookingCount} book={book} />)}
                        </div>
                    </div>
                </div>
                
                {/* Exit Gate */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <div style={{ background: '#ecf0f1', padding: '15px', borderRadius: '10px', borderRight: '5px solid #e74c3c', width: '200px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#c0392b' }}>⬆️ EXIT GATE</h3>
                    </div>
                </div>
            </div>
        );
    };

    // --- RENDER LOGIC ---
    const getLayout = () => {
        const name = parkingLot ? parkingLot.name : "";

        // Malls
        if (["City Center Mall", "Mega Hypermarket"].includes(name)) return <MallLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Tech & Commercial
        if (["Tech Park Plaza", "Downtown Commercial Complex", "Tech Startup Hub", "Science Museum"].includes(name)) return <TechLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Market / Food
        if (["Central Market Bazaar", "City Food Court", "Textile Bazaar Zone"].includes(name)) return <MarketLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Cinema / Events
        if (["Multiplex Cinema", "Convention Center"].includes(name)) return <CinemaLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Transit / Linear
        if (["Metro Station Parking"].includes(name)) return <TransitLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Nature / Park
        if (["Riverside Park"].includes(name)) return <NatureLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        // Fallback checks (existing)
        if (name === "Trichy Junction Parking") return <TrichyJunctionLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;
        if (name.includes("Temple")) return <TempleLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} parkingLotName={name} />;
        if (name.includes("Stadium")) return <StadiumLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;
        if (name.includes("Airport")) return <AirportParkingBlueprintLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;
        if (name.includes("Hospital")) return <HospitalLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;
        if (name.includes("Campus") || name.includes("University")) return <CampusLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;

        return <StandardLayout slots={slots} userBookingCount={userBookingCount} book={openBookingModal} />;
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                   <h2 style={{ fontSize: "2rem", color: "var(--text-primary)", marginBottom: "4px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                      {parkingLot ? parkingLot.name : "Parking Directory"}
                   </h2>
                   <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>Select an available slot below to reserve.</p>
                </div>
            </div>

            {userBookingCount >= 2 && (
                <div style={{ color: "#b45309", background: "var(--tag-peach)", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontWeight: "700", display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> Max capacity reached: A user can book only 2 slots in a lot.
                </div>
            )}

            {/* MODAL OVERLAY */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(25, 28, 43, 0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{ background: 'white', color: 'var(--text-primary)', padding: '40px', borderRadius: 'var(--radius-lg)', minWidth: '450px', maxWidth: '90%', boxShadow: 'var(--shadow-hover)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid #f1f5f9' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)' }}>
                                    <i className="fa-solid fa-ticket-simple"></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Confirm Reservation</div>
                                    <div>Slot {slots.find(s => s._id === selectedSlotId)?.slotNumber}</div>
                                </div>
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: '#f4f5f8', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="input-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}><i className="fa-regular fa-id-card"></i> Vehicle Number</label>
                            <input type="text"
                                value={bookingData.vehicleNumber}
                                onChange={e => {
                                    setBookingData({ ...bookingData, vehicleNumber: e.target.value.toUpperCase() });
                                    setValidationError("");
                                }}
                                placeholder="e.g. MH 12 AB 1234"
                                style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-primary)', border: validationError ? '2px solid var(--status-danger)' : '2px solid transparent', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}
                            />
                            {validationError && <p style={{ color: 'var(--status-danger)', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}><i className="fa-solid fa-triangle-exclamation"></i> {validationError}</p>}
                        </div>

                        <div className="input-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}><i className="fa-solid fa-car-side"></i> Vehicle Type</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={bookingData.vehicleType}
                                    onChange={e => setBookingData({ ...bookingData, vehicleType: e.target.value })}
                                    style={{ appearance: 'none', cursor: 'pointer', padding: '14px', borderRadius: '12px', background: 'var(--bg-primary)', border: '2px solid transparent', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}
                                >
                                    <option value="Four-wheeler">Four-wheeler 🚗</option>
                                    <option value="Two-wheeler">Two-wheeler 🏍️</option>
                                </select>
                                <i className="fa-solid fa-chevron-down" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Time</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input type="date"
                                            value={bookingData.startDate}
                                            onChange={e => setBookingData({ ...bookingData, startDate: e.target.value })}
                                            style={{ padding: '10px 14px', background: 'white', border: 'none', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', outline: 'none' }}
                                        />
                                        <input type="time"
                                            value={bookingData.startTime}
                                            onChange={e => setBookingData({ ...bookingData, startTime: e.target.value })}
                                            style={{ padding: '10px 14px', background: 'white', border: 'none', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Time</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input type="date"
                                            value={bookingData.endDate}
                                            onChange={e => setBookingData({ ...bookingData, endDate: e.target.value })}
                                            style={{ padding: '10px 14px', background: 'white', border: 'none', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', outline: 'none' }}
                                        />
                                        <input type="time"
                                            value={bookingData.endTime}
                                            onChange={e => setBookingData({ ...bookingData, endTime: e.target.value })}
                                            style={{ padding: '10px 14px', background: 'white', border: 'none', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleConfirmBooking} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', transition: 'var(--transition)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            Confirm & Pay <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                        </button>
                    </div>
                </div>
            )}

            {/* RENDER DYNAMIC LAYOUT */}
            <div style={{ marginTop: '20px', background: 'white', borderRadius: 'var(--radius-lg)', padding: '30px', boxShadow: 'var(--shadow-sm)' }}>
                {getLayout()}
            </div>
        </div>
    );
}
