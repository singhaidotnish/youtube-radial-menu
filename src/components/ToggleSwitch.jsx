import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ is3D, onToggle }) => {
  return (
    <div className="toggle-container" onClick={onToggle}>
      {/* 1. The Sliding Highlight (The "Ring" that moves) */}
      <div className={`toggle-glider ${is3D ? 'position-left' : 'position-right'}`}></div>

      {/* 2. The Text Labels (Clickable) */}
      <div className="toggle-labels">
        <span className={`toggle-option ${is3D ? 'active' : ''}`}>3D</span>
        <span className={`toggle-option ${!is3D ? 'active' : ''}`}>2D</span>
      </div>
    </div>
  );
};

export default ToggleSwitch;