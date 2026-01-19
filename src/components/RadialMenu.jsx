import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Plus, X, Folder } from "lucide-react"; 
import "./RadialMenu.css";
import initialData from '../data.json'; 

// --- MATH HELPERS ---
const polarToCartesian = (radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: radius * Math.cos(angleInRadians),
    y: radius * Math.sin(angleInRadians)
  };
};

const getSectorPath = (outerRadius, innerRadius, startAngle, endAngle) => {
  const start = polarToCartesian(outerRadius, endAngle);
  const end = polarToCartesian(outerRadius, startAngle);
  const startInner = polarToCartesian(innerRadius, endAngle);
  const endInner = polarToCartesian(innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
};

const RadialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });
  
  // 1. DATA STATE
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('radialMenuItems');
    return saved ? JSON.parse(saved) : initialData;
  });

  // 2. ADD MODAL STATE
  const [isAdding, setIsAdding] = useState(false);
  // We now track 'parentId' to know WHERE to put the link
  const [newItem, setNewItem] = useState({ label: '', url: '', parentId: 'root' });

  // --- LOGIC: SAVE ITEM ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.label) return;

    const newLinkObject = {
      id: Date.now(),
      label: newItem.label,
      url: newItem.url || "#", // If empty, it's just a folder
      icon: "link",
      img: null,
      children: newItem.url ? null : [] // If no URL provided, treat as a "New Group"
    };

    let updatedItems = [...items];

    if (newItem.parentId === 'root') {
      // Option A: Add to Main Circle
      updatedItems.push(newLinkObject);
    } else {
      // Option B: Add to an Existing Group
      updatedItems = updatedItems.map(item => {
        if (item.id === parseInt(newItem.parentId)) {
          // Found the parent! Add to its children.
          const currentChildren = item.children || [];
          return { ...item, children: [...currentChildren, newLinkObject] };
        }
        return item;
      });
    }

    setItems(updatedItems);
    localStorage.setItem('radialMenuItems', JSON.stringify(updatedItems));
    
    setNewItem({ label: '', url: '', parentId: 'root' });
    setIsAdding(false);
  };

  const handleReset = () => {
    if(confirm("Reset menu to default?")) {
      setItems(initialData);
      localStorage.removeItem('radialMenuItems');
    }
  };

  // CONFIGURATION
  const GAP = 2; 
  const R1_INNER = 60;
  const R1_OUTER = 140; 
  const R2_INNER = 145;
  const R2_OUTER = 230;

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleGroupClick = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  const handleMouseEnter = (e, text) => {
    setTooltip({ show: true, x: e.clientX, y: e.clientY, text });
  };
  const handleMouseMove = (e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, show: false }));

  const renderSlice = (item, index, total, innerR, outerR, isGroupParent) => {
    const sliceAngle = 360 / total;
    const startAngle = (index * sliceAngle) + (GAP / 2);
    const endAngle = ((index + 1) * sliceAngle) - (GAP / 2);
    const pathData = getSectorPath(outerR, innerR, startAngle, endAngle);
    
    const midAngle = startAngle + (sliceAngle - GAP)/2;
    const iconRadius = innerR + (outerR - innerR) / 2;
    const pos = polarToCartesian(iconRadius, midAngle);
    const isActive = activeGroup === item.id;
    const clipId = `clip-${isGroupParent ? 'parent' : 'child'}-${index}`;
    const imgSize = 160; 

    return (
      <g 
        key={item.id || index} 
        className="slice-group"
        onClick={(e) => isGroupParent && item.children ? handleGroupClick(e, item.id) : null}
        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <a href={item.children ? "#" : item.url} target={item.children ? "_self" : "_blank"} rel="noopener noreferrer">
          {item.img && (
            <>
              <defs><clipPath id={clipId}><path d={pathData} /></clipPath></defs>
              <image href={item.img} x={pos.x - (imgSize/2)} y={pos.y - (imgSize/2)} width={imgSize} height={imgSize} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
            </>
          )}
          <path 
            d={pathData} 
            fill={item.img ? (isActive ? "rgba(212, 160, 23, 0.4)" : "rgba(0,0,0,0.4)") : (isActive ? "#d4a017" : "rgba(30, 35, 40, 0.85)")} 
            stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="slice-path"
          />
          {!item.img && (
            <foreignObject x={pos.x - 14} y={pos.y - 14} width="28" height="28" style={{ color: isActive ? "black" : "#ddd", pointerEvents: "none" }}>
              <div className="slice-icon"><LinkIcon size={20} /></div>
            </foreignObject>
          )}
        </a>
      </g>
    );
  };

  return (
    <div className="radial-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      <div className="menu-container">
        <motion.button className="trigger-btn" onClick={toggleMenu} whileTap={{ scale: 0.95 }}>START</motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="svg-layer"
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <svg width="600" height="600" viewBox="-300 -300 600 600" style={{ overflow: 'visible' }}>
                {items.map((item, index) => renderSlice(item, index, items.length, R1_INNER, R1_OUTER, true))}
                {activeGroup && (() => {
                  const group = items.find(i => i.id === activeGroup);
                  if (group && group.children) {
                    return group.children.map((child, idx) => renderSlice(child, idx, group.children.length, R2_INNER, R2_OUTER, false));
                  }
                })()}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ADD BUTTON */}
      <div className="add-btn-container">
        <button className="add-btn" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* --- INTELLIGENT ADD MODAL --- */}
      <AnimatePresence>
        {isAdding && (
            <motion.div 
                className="add-modal"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
            >
                <h3>Add to Menu</h3>
                <form onSubmit={handleAddItem}>
                    {/* 1. LABEL */}
                    <input 
                        type="text" 
                        placeholder="Label (e.g. My Blog)" 
                        value={newItem.label}
                        onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                        autoFocus
                        required
                    />
                    
                    {/* 2. URL (Optional) */}
                    <input 
                        type="url" 
                        placeholder="URL (leave empty for folder)" 
                        value={newItem.url}
                        onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                    />

                    {/* 3. LOCATION SELECTOR */}
                    <div className="select-wrapper">
                      <label style={{fontSize: '12px', color: '#888', marginBottom: '4px', display:'block'}}>Location:</label>
                      <select 
                        value={newItem.parentId} 
                        onChange={(e) => setNewItem({...newItem, parentId: e.target.value})}
                        className="location-select"
                      >
                        <option value="root">🔵 Main Circle (New Top Item)</option>
                        {/* Dynamically list all existing groups that have children */}
                        {items.map(item => (
                          // Only show items that are "Folders" (have children or no URL)
                          (item.children || !item.url) && 
                          <option key={item.id} value={item.id}>📂 Inside: {item.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </motion.div>
        )}
      </AnimatePresence>

      {tooltip.show && <div className="radial-tooltip" style={{ top: tooltip.y, left: tooltip.x }}>{tooltip.text}</div>}
    </div>
  );
};

export default RadialMenu;