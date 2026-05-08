import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Real parking lots from the database (seed.js) ───────────────────────────
const REAL_LOCATIONS = [
    { name: "Thillai Nagar Parking",              location: "Thillai Nagar, Tiruchirappalli",          icon: "fa-car",              color: "#3b82f6", slots: 80  },
    { name: "Gandhi Market Parking",               location: "Gandhi Market, Tiruchirappalli",           icon: "fa-store",            color: "#10b981", slots: 60  },
    { name: "Chathiram Bus Stand Parking",         location: "Chathiram Bus Stand, Tiruchirappalli",    icon: "fa-bus",              color: "#f59e0b", slots: 120 },
    { name: "Trichy Junction Parking",             location: "Trichy Junction, Tiruchirappalli",        icon: "fa-train",            color: "#8b5cf6", slots: 80  },
    { name: "Airport Parking",                     location: "Tiruchirappalli International Airport",   icon: "fa-plane-departure",  color: "#ec4899", slots: 60  },
    { name: "Srirangam Temple Parking",            location: "Srirangam, Tiruchirappalli",              icon: "fa-place-of-worship", color: "#ef4444", slots: 40  },
    { name: "Samayapuram Temple Parking",          location: "Samayapuram, Tiruchirappalli",            icon: "fa-place-of-worship", color: "#f97316", slots: 60  },
    { name: "NSB Road Parking",                    location: "NSB Road, Tiruchirappalli",               icon: "fa-road",             color: "#06b6d4", slots: 60  },
    { name: "Main Guard Gate Parking",             location: "Main Guard Gate, Tiruchirappalli",        icon: "fa-shield-halved",    color: "#6366f1", slots: 80  },
    { name: "Bishop Heber College Area Parking",   location: "Puthur / Teppakulam, Tiruchirappalli",    icon: "fa-graduation-cap",   color: "#14b8a6", slots: 60  },
];

const STATS = [
    { value: "25+",   label: "Parking Locations",    icon: "fa-map-pin"          },
    { value: "1000+", label: "Total Slots Available", icon: "fa-square-parking"  },
    { value: "3",     label: "Active Districts",      icon: "fa-map"             },
    { value: "24/7",  label: "Real-Time Updates",     icon: "fa-clock"           },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [visibleCards, setVisibleCards] = useState(4);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

            {/* ── NAVBAR ───────────────────────────────────────────────── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
                background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.35s ease',
                padding: '0 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: '72px',
            }}>
                {/* Logo */}
                <img
                    src={process.env.PUBLIC_URL + '/Logo.png'}
                    alt="ParkSense"
                    style={{ height: '52px', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />

                {/* Nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    {[
                        { label: 'Features', href: '#features' },
                        { label: 'Locations', href: '#locations' },
                        { label: 'How It Works', href: '#how' },
                    ].map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            style={{
                                color: scrolled ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={e => e.target.style.color = scrolled ? 'var(--accent-primary)' : '#fff'}
                            onMouseOut={e => e.target.style.color = scrolled ? 'var(--text-secondary)' : 'rgba(255,255,255,0.85)'}
                        >
                            {link.label}
                        </a>
                    ))}

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 22px', borderRadius: '50px', border: '2px solid',
                            borderColor: scrolled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                            background: 'transparent',
                            color: scrolled ? 'var(--accent-primary)' : 'white',
                            fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = scrolled ? 'var(--accent-primary)' : 'white'; e.currentTarget.style.borderColor = scrolled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)'; }}
                    >
                        Login
                    </button>

                    <button
                        onClick={() => navigate('/parking')}
                        className="btn-primary"
                        style={{ padding: '10px 22px', borderRadius: '50px', fontWeight: '700', fontSize: '0.9rem' }}
                    >
                        Find Parking
                    </button>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section style={{
                minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #0f4c75 70%, #0f172a 100%)',
                color: 'white', textAlign: 'center', padding: '120px 20px 80px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50px', padding: '6px 18px', marginBottom: '32px',
                        backdropFilter: 'blur(8px)', fontSize: '0.88rem', fontWeight: '600',
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        Live in 3 Districts — 25 locations, 1000+ slots
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900',
                        marginBottom: '24px', letterSpacing: '-2px', lineHeight: '1.1',
                    }}>
                        Smart Parking,<br />
                        <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Zero Hassle.
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.2rem', color: 'rgba(255,255,255,0.75)',
                        marginBottom: '48px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 48px',
                    }}>
                        Reserve guaranteed parking slots across Tiruchirappalli, Chennai, and Namakkal before you even leave home.
                        Real-time updates, QR passes, and zero wasted trips.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/parking')}
                            style={{
                                padding: '16px 36px', fontSize: '1.05rem', fontWeight: '800',
                                borderRadius: '50px', background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                                color: 'white', border: 'none', cursor: 'pointer',
                                boxShadow: '0 12px 30px rgba(37,99,235,0.4)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(37,99,235,0.5)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4)'; }}
                        >
                            <i className="fa-solid fa-location-crosshairs" /> Find Parking Now
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '16px 36px', fontSize: '1.05rem', fontWeight: '700',
                                borderRadius: '50px', background: 'rgba(255,255,255,0.1)',
                                color: 'white', border: '1.5px solid rgba(255,255,255,0.25)',
                                cursor: 'pointer', backdropFilter: 'blur(8px)',
                                transition: 'background 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            Create Free Account
                        </button>
                    </div>

                    {/* Scroll cue */}
                    <div style={{ marginTop: '60px', opacity: 0.5, fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        <i className="fa-solid fa-chevron-down" style={{ display: 'block', marginBottom: '4px', animation: 'bounce 2s infinite' }} />
                        Scroll to explore
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ────────────────────────────────────────────── */}
            <section style={{
                background: 'white', borderBottom: '1px solid var(--border-subtle)',
                padding: '32px 40px',
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                }}>
                    {STATS.map((stat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--border-subtle)',
                            }}>
                                <i className={`fa-solid ${stat.icon}`} style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '2px' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────── */}
            <section id="features" style={{ padding: '100px 40px', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <SectionHeader
                        tag="Platform Features"
                        title="Why Choose ParkSense?"
                        sub="The most efficient way to manage and reserve your parking spaces across Tiruchirappalli."
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
                        {[
                            { icon: "fa-mobile-screen",   title: "Smart Reservation",      desc: "Reserve your guaranteed parking space from any device before you arrive. Zero surprises.",                   color: "#3b82f6" },
                            { icon: "fa-location-dot",    title: "Real-Time Availability", desc: "Instant slot counts across all 10 locations — updated live as bookings come in.",                             color: "#10b981" },
                            { icon: "fa-qrcode",          title: "QR Boarding Pass",       desc: "Receive a scannable QR pass instantly after booking. Show it at the gate — no paperwork.",                    color: "#f59e0b" },
                            { icon: "fa-chart-pie",       title: "Facility Analytics",     desc: "Lot admins get live occupancy dashboards to monitor and optimise usage efficiency.",                           color: "#8b5cf6" },
                            { icon: "fa-shield-halved",   title: "Secure & Verified",      desc: "Every reservation is tied to your account with verified vehicle details and time-locks.",                      color: "#ec4899" },
                            { icon: "fa-map-location-dot",title: "Interactive Map",        desc: "Visualise all 10 parking lots on the Trichy district map and pick the spot closest to you.",                  color: "#06b6d4" },
                        ].map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--bg-secondary)', padding: '32px', borderRadius: '20px',
                                    border: '1px solid var(--border-subtle)',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.08)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '14px', marginBottom: '20px',
                                    background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.4rem', color: f.color,
                                }}>
                                    <i className={`fa-solid ${f.icon}`} />
                                </div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '1.15rem', fontWeight: '800' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <section id="how" style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #f8faff 0%, #f0fdf4 100%)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader
                        tag="Simple Process"
                        title="Book in 4 Easy Steps"
                        sub="From search to parked — the whole process takes under 2 minutes."
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', position: 'relative' }}>
                        {[
                            { step: 1, icon: "fa-map-location-dot", title: "Pick a Location",  desc: "Browse 10 live parking lots in Tiruchirappalli and select one near your destination." },
                            { step: 2, icon: "fa-square-parking",   title: "Choose Your Slot", desc: "Select from the interactive slot grid — available in sizes Small to Extra-Large." },
                            { step: 3, icon: "fa-car",              title: "Enter Vehicle Info",desc: "Provide your registration number, vehicle type, and desired duration." },
                            { step: 4, icon: "fa-qrcode",           title: "Get Your QR Pass", desc: "Receive a digital QR boarding pass instantly. Show at the gate and park!" },
                        ].map((step, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                {/* Connector line */}
                                {i < 3 && (
                                    <div style={{
                                        position: 'absolute', top: '40px', left: '66%', width: '68%',
                                        height: '2px', background: 'linear-gradient(90deg, #2563eb, #0d9488)',
                                        opacity: 0.2, display: window.innerWidth < 768 ? 'none' : 'block',
                                    }} />
                                )}
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem', color: 'white', margin: '0 auto 20px',
                                    boxShadow: '0 8px 24px rgba(37,99,235,0.3)', position: 'relative', zIndex: 1,
                                }}>
                                    <i className={`fa-solid ${step.icon}`} />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Step {step.step}</div>
                                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px' }}>{step.title}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── REAL LOCATIONS ───────────────────────────────────────── */}
            <section id="locations" style={{ padding: '100px 40px', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Live Locations — Tiruchirappalli, Chennai, Namakkal
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-1px' }}>25 Active Parking Lots</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>We operate fully active smart parking lots across Tamil Nadu.</p>
                        </div>
                        <button
                            onClick={() => navigate('/parking')}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            View All → Reserve Now
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                        {REAL_LOCATIONS.slice(0, visibleCards).map((loc, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--bg-secondary)', borderRadius: '18px',
                                    border: '1px solid var(--border-subtle)', overflow: 'hidden',
                                    transition: 'transform 0.25s, box-shadow 0.25s',
                                    cursor: 'pointer',
                                }}
                                onClick={() => navigate('/parking')}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {/* Card top stripe */}
                                <div style={{ height: '5px', background: `linear-gradient(90deg, ${loc.color}, ${loc.color}88)` }} />
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                                            background: `${loc.color}18`, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '1.2rem', color: loc.color,
                                        }}>
                                            <i className={`fa-solid ${loc.icon}`} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '800' }}>{loc.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <i className="fa-solid fa-location-dot" style={{ marginRight: '5px', color: 'var(--text-muted)' }} />
                                                {loc.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{
                                            background: '#ecfdf5', color: '#059669', padding: '4px 12px',
                                            borderRadius: '50px', fontSize: '0.78rem', fontWeight: '800',
                                        }}>
                                            ● Live
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            {loc.slots} slots · Book now →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {visibleCards < REAL_LOCATIONS.length && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button
                                onClick={() => setVisibleCards(REAL_LOCATIONS.length)}
                                style={{
                                    padding: '14px 32px', borderRadius: '50px', border: '2px solid var(--accent-primary)',
                                    background: 'transparent', color: 'var(--accent-primary)', fontWeight: '700',
                                    fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                            >
                                Show All {REAL_LOCATIONS.length} Locations
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── EXPANSION MAP ─────────────────────────────────────────── */}
            <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <SectionHeader
                        tag="Expanding Across Tamil Nadu"
                        title="Our Rollout Plan"
                        sub="ParkSense is live in multiple districts and expanding rapidly to the rest of the State."
                        light
                    />
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Active Tiruchirappalli */}
                        <div style={{
                            background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)',
                            borderRadius: '20px', padding: '28px 36px', textAlign: 'center', minWidth: '260px',
                        }}>
                            <i className="fa-solid fa-map-pin fa-2x" style={{ color: '#10b981', marginBottom: '14px', display: 'block' }} />
                            <h3 style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px' }}>Tiruchirappalli</h3>
                            <div style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>🟢 Active — 10 Lots</div>
                        </div>

                        {/* Active Chennai */}
                        <div style={{
                            background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)',
                            borderRadius: '20px', padding: '28px 36px', textAlign: 'center', minWidth: '260px',
                        }}>
                            <i className="fa-solid fa-map-pin fa-2x" style={{ color: '#10b981', marginBottom: '14px', display: 'block' }} />
                            <h3 style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px' }}>Chennai</h3>
                            <div style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>🟢 Active — 10 Lots</div>
                        </div>

                        {/* Active Namakkal */}
                        <div style={{
                            background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)',
                            borderRadius: '20px', padding: '28px 36px', textAlign: 'center', minWidth: '260px',
                        }}>
                            <i className="fa-solid fa-map-pin fa-2x" style={{ color: '#10b981', marginBottom: '14px', display: 'block' }} />
                            <h3 style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px' }}>Namakkal</h3>
                            <div style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>🟢 Active — 5 Lots</div>
                        </div>

                        {/* Coming soon */}
                        {["Madurai", "Coimbatore", "Salem", "Vellore", "32+ Others"].map((d, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
                                borderRadius: '20px', padding: '28px 32px', textAlign: 'center', minWidth: '180px', opacity: 0.75,
                            }}>
                                <i className="fa-regular fa-map fa-2x" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '14px', display: 'block' }} />
                                <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 6px' }}>{d}</h3>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Coming Soon</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ──────────────────────────────────────────────── */}
            <section style={{ padding: '100px 40px', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '80px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Why It Matters</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '32px', letterSpacing: '-1px' }}>Benefits of Smart Mobility</h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { icon: "fa-hourglass-start", text: "Reduce time spent searching for parking by up to 80%." },
                                { icon: "fa-leaf",            text: "Less traffic circling means lower fuel use and emissions." },
                                { icon: "fa-shield-halved",   text: "Verified QR boarding passes ensure secure, authorised access." },
                                { icon: "fa-wallet",          text: "Transparent pricing — pay only for the duration you need." },
                                { icon: "fa-bell",            text: "Get instant booking confirmation and slot reminders." },
                            ].map((b, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--border-subtle)',
                                    }}>
                                        <i className={`fa-solid ${b.icon}`} style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }} />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.55', paddingTop: '6px' }}>{b.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: "Time Saved Per User",    value: "25 min/visit", bar: 80, color: "#3b82f6" },
                            { label: "Slot Utilisation",       value: "92%",          bar: 92, color: "#10b981" },
                            { label: "Booking Success Rate",   value: "99.4%",        bar: 99, color: "#8b5cf6" },
                        ].map((m, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-secondary)', padding: '24px 28px', borderRadius: '16px',
                                border: '1px solid var(--border-subtle)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{m.label}</span>
                                    <span style={{ fontWeight: '900', color: m.color, fontSize: '1.05rem' }}>{m.value}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${m.bar}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}aa)`, borderRadius: '4px', transition: 'width 1s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section style={{
                padding: '100px 40px',
                background: 'linear-gradient(135deg, #1e40af, #0d9488)',
                color: 'white', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
                <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <img src={process.env.PUBLIC_URL + '/Logo.png'} alt="ParkSense" style={{ height: '72px', objectFit: 'contain', marginBottom: '28px', filter: 'brightness(0) invert(1)' }} />
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1.5px' }}>Start Parking Smarter Today</h2>
                    <p style={{ fontSize: '1.15rem', opacity: 0.88, marginBottom: '44px', lineHeight: '1.6' }}>
                        Join thousands of Trichy residents who skip the parking stress every single day.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/parking')}
                            style={{
                                padding: '16px 40px', fontSize: '1.1rem', fontWeight: '800', borderRadius: '50px',
                                background: 'white', color: '#1e40af', border: 'none', cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.25)', transition: 'transform 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'none'}
                        >
                            Reserve a Spot Now
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '16px 40px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '50px',
                                background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)',
                                cursor: 'pointer', transition: 'border-color 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'white'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
                        >
                            Register Free
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.7)', padding: '64px 40px 28px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '48px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '28px' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <img src={process.env.PUBLIC_URL + '/Logo.png'} alt="ParkSense" style={{ height: '52px', objectFit: 'contain', marginBottom: '16px', filter: 'brightness(0) invert(1)' }} />
                            <p style={{ fontSize: '0.92rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                Smart Parking Reservation &amp; Optimisation System for modern Tamil Nadu cities. Currently live in Tiruchirappalli.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '18px', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Find Parking',   action: () => navigate('/parking') },
                                        { label: 'View Map',       action: () => navigate('/map')     },
                                        { label: 'My Bookings',    action: () => navigate('/bookings') },
                                    ].map((l, i) => (
                                        <li key={i}>
                                            <span onClick={l.action} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', transition: 'color 0.2s' }}
                                                onMouseOver={e => e.target.style.color = 'white'}
                                                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                                            >{l.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ color: 'white', marginBottom: '18px', fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Login',          action: () => navigate('/login')        },
                                        { label: 'Register',       action: () => navigate('/register')     },
                                        { label: 'Admin Access',   action: () => navigate('/admin/login')  },
                                    ].map((l, i) => (
                                        <li key={i}>
                                            <span onClick={l.action} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', transition: 'color 0.2s' }}
                                                onMouseOver={e => e.target.style.color = 'white'}
                                                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                                            >{l.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
                            © {new Date().getFullYear()} ParkSense. All rights reserved. Built for smart cities.
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
                            <i className="fa-solid fa-map-pin" style={{ color: '#10b981', marginRight: '6px' }} />
                            Tiruchirappalli, Tamil Nadu
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── INLINE KEYFRAMES ─────────────────────────────────────── */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(6px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

// ── Shared section header ─────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub, light }) {
    const textPrimary = light ? 'white' : 'var(--text-primary)';
    const textSec     = light ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)';
    return (
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            {tag && (
                <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    {tag}
                </div>
            )}
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.75rem)', fontWeight: '900', color: textPrimary, marginBottom: '14px', letterSpacing: '-1px' }}>{title}</h2>
            {sub && <p style={{ fontSize: '1.08rem', color: textSec, maxWidth: '580px', margin: '0 auto', lineHeight: '1.65' }}>{sub}</p>}
        </div>
    );
}
