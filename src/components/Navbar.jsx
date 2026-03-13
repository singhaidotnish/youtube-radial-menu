import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { Plus, Github } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ is3D, onToggle, onAddClick, onGithubSave, githubStatus }) => {
  return (
    <div className="navbar-container">
      
      {/* 1. LEFT SIDE: The 2D/3D Switch + Back Button */}
      <div className="left-group">
        <a className="back-pill" href="https://nishith.is-a.dev/projects/" title="Back to Portfolio">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Portfolio
        </a>
        <div className="switch-wrapper">
          <ToggleSwitch is3D={is3D} onToggle={onToggle} />
        </div>
      </div>

      {/* 2. RIGHT SIDE: GitHub Save + Add Button */}
      <div className="right-group">
        <button
          className={`nav-github-btn ${githubStatus}`}
          onClick={onGithubSave}
          title="Save to GitHub"
        >
          <Github size={18} />
          <span className="github-btn-label">
            {githubStatus === 'saving' ? 'Saving...' : githubStatus === 'saved' ? '✓ Saved!' : githubStatus === 'error' ? '✗ Failed' : 'Save to GitHub'}
          </span>
        </button>

        <button 
          className="nav-add-btn" 
          onClick={onAddClick} 
          title="Add New Link"
        >
          <Plus size={24} color="#fff" />
        </button>
      </div>

    </div>
  );
};

export default Navbar;