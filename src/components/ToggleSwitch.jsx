import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ is3D, onToggle }) => {
  return (
    <div className="toggle-container" onClick={onToggle}>
      
      {/* 1. THE MOVING RING (The "Oval" that slides) */}
      <div className={`toggle-ring ${is3D ? 'pos-left' : 'pos-right'}`}></div>

      {/* 2. THE LABELS (Sits on top of the ring) */}
      <div className="toggle-labels">
        {/* If is3D is true, this text lights up */}
        <span className={`toggle-text ${is3D ? 'active' : ''}`}>3D</span>
        
        {/* If is3D is false (2D mode), this text lights up */}
        <span className={`toggle-text ${!is3D ? 'active' : ''}`}>2D</span>
      </div>
      
    </div>
  );
};

export default ToggleSwitch;