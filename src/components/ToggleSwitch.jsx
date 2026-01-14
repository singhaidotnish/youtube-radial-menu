import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ is3D, onToggle }) => {
  return (
    /* The Outer Container (The Double Oval Housing) */
    <div className="toggle-housing" onClick={onToggle}>
      
      {/* The Inner Track (Black Background) */}
      <div className="toggle-track">
        
        {/* TEXT: "3D" (Visible only when Knob is Right) */}
        <span className={`toggle-text left ${is3D ? 'visible' : ''}`}>3D</span>
        
        {/* TEXT: "2D" (Visible only when Knob is Left) */}
        <span className={`toggle-text right ${!is3D ? 'visible' : ''}`}>2D</span>

        {/* THE KNOB (Silver Circle) */}
        <div className={`toggle-knob ${is3D ? 'active' : ''}`}></div>
        
      </div>
    </div>
  );
};

export default ToggleSwitch;