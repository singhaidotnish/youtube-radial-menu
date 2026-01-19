import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Plus } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ is3D, onToggle, onAddClick }) => {
  return (
    <div className="navbar-container">
      
      {/* 1. LEFT SIDE: The 2D/3D Switch */}
      <div className="switch-wrapper">
        <ToggleSwitch is3D={is3D} onToggle={onToggle} />
      </div>

      {/* 2. RIGHT SIDE: The Add Button */}
      <button 
        className="nav-add-btn" 
        onClick={onAddClick} 
        title="Add New Link"
      >
        <Plus size={24} color="#fff" />
      </button>

    </div>
  );
};

export default Navbar;