import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Plus } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ is3D, onToggle, onAddClick }) => {
  return (
    <div className="navbar-container">
      {/* 1. The Add Button */}
      <button className="nav-add-btn" onClick={onAddClick} title="Add Link">
        <Plus size={24} color="#fff" />
      </button>

      {/* 2. The 2D/3D Switch */}
      {/* We wrap it to ensure layout stability */}
      <div className="switch-wrapper">
        <ToggleSwitch is3D={is3D} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default Navbar;