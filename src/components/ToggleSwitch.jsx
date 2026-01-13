import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ is3D, onToggle }) => {
  return (
    <div className="toggle-wrapper">
      <input 
        className="toggle-checkbox" 
        type="checkbox" 
        checked={is3D} 
        onChange={onToggle} 
        id="toggle-3d"
      />
      <label className="toggle-label" htmlFor="toggle-3d">
        <span className="toggle-inner" data-yes="3D" data-no="2D"></span>
        <span className="toggle-switch"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;