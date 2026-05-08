import React from 'react';
import './AirportBlueprint.css';
import { useNotification } from "../context/NotificationContext";

export default function AirportParkingBlueprintLayout({ slots, userBookingCount, book }) {
    const { showNotification } = useNotification();

    // Safety check
    if (!slots || slots.length === 0) return <div>Loading Map Data...</div>;

    // Distribute slots linearly into exactly 16 slots per geometric block
    const blockA = slots.slice(0, 16);
    const blockB = slots.slice(16, 32);
    const blockC = slots.slice(32, 48); 

    const BlueprintSlot = ({ s }) => {
        if (!s) return null;
        
        const handleBooking = () => {
             if (s.isBooked) return;
             if (userBookingCount >= 2) {
                 showNotification("warning", "A user can book only 2 slots in a lot");
                 return;
             }
             book(s._id);
        };
        
        // Extract slot number ignoring prefix so letters fit cleanly inside the tight blueprint lines
        // e.g. T1-1 -> 1
        const shortName = s.slotNumber.includes('-') ? s.slotNumber.split('-')[1] : s.slotNumber;
        
        return (
            <div 
                className={`blueprint-slot ${s.isBooked ? 'slot-booked' : ''}`}
                onClick={handleBooking}
                title={`Slot ${s.slotNumber} ${s.isBooked ? '(Reserved)' : '(Available)'}`}
            >
                <div className="slot-indicator-dot"></div>
                <div className="slot-text" style={{ fontSize: '11px', letterSpacing: '-0.5px' }}>
                    {s.slotNumber}
                </div>
            </div>
        );
    };

    const renderColumn = (slotArray, startIndex, endIndex) => {
        return slotArray.slice(startIndex, endIndex).map(s => (
             <BlueprintSlot key={s._id} s={s} />
        ));
    };
    
    return (
        <div className="airport-blueprint-wrapper">
             <div className="blueprint-map">
                  {/* Top Geometry */}
                  <div className="terminal-building">
                      AIRPORT TERMINAL
                      <div className="terminal-door"></div>
                  </div>
                  <div className="road-lane-top"></div>
                  
                  <div className="drop-off-zone">
                      <span className="drop-off-text">DROP-OFF / PICK-UP ZONE</span>
                  </div>
                  <div className="zebra-crossing"></div>
                  
                  {/* Traffic Gates & Road Arrows */}
                  <div className="security-booth booth-entry">ENTRY <br/> BOOTH</div>
                  <div className="gate-barrier barrier-in"></div>
                  
                  <div className="security-booth booth-exit">EXIT <br/> BOOTH</div>
                  <div className="gate-barrier barrier-out"></div>
                  
                  <i className="fa-solid fa-arrow-up road-arrow arrow-in-left"></i>
                  <i className="fa-solid fa-arrow-up road-arrow arrow-out-right"></i>
                  <i className="fa-solid fa-arrow-up road-arrow arrow-top-left"></i>
                  <i className="fa-solid fa-arrow-up road-arrow arrow-top-right"></i>

                  {/* PARKING BLOCKS (The 3 central vertical islands) */}
                  <div className="parking-islands-container">
                      
                      {/* Block A: Left Island */}
                      <div className="island-block">
                          <div className="island-label">
                              <h2>BLOCK A</h2>
                              <p>(VIP/PREMIUM)</p>
                          </div>
                          
                          <div className="slots-column-left">
                              {renderColumn(blockA, 0, 8)}
                          </div>
                          <div className="slots-column-right">
                              {renderColumn(blockA, 8, 16)}
                          </div>
                      </div>

                      {/* Block B: Center Island including Disabled bays */}
                      <div className="island-block">
                          <div className="island-label">
                              <h2>BLOCK B</h2>
                              <p>(STANDARD)</p>
                          </div>
                          
                          <div className="slots-column-left">
                              {renderColumn(blockB, 0, 8)}
                          </div>
                          <div className="slots-column-right">
                              {renderColumn(blockB, 8, 16)}
                          </div>
                      </div>

                      {/* Block C: Right Island */}
                      <div className="island-block">
                          <div className="island-label">
                              <h2>BLOCK C</h2>
                              <p>(ECONOMY)</p>
                          </div>
                          
                          <div className="slots-column-left">
                              {renderColumn(blockC, 0, 8)}
                          </div>
                          <div className="slots-column-right">
                              {renderColumn(blockC, 8, 16)}
                          </div>
                      </div>

                  </div>
             </div>
        </div>
    );
}
