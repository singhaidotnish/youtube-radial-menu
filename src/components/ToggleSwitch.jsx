import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ is3D, onToggle }) => {
  return (
    /* The Container (Double Oval Housing) */
    <div className="toggle-housing" onClick={onToggle}>
      
      {/* TEXT: "3D" (Sits on the Left) */}
      <span className="toggle-text left">3D</span>
      
      {/* TEXT: "2D" (Sits on the Right) */}
      <span className="toggle-text right">2D</span>

      {/* THE KNOB (Silver Circle that slides) */}
      <div className={`toggle-knob ${is3D ? 'active' : ''}`}></div>
      
    </div>
  );
};

export default ToggleSwitch;