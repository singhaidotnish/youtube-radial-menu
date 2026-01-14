import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Code, TrendingUp, Activity, Sun, DollarSign, 
  Heart, User, Utensils, MessageCircle, HelpCircle, Link,
  Bot, Search, Mic, Video, Image, Brain, Building, Cloud, Server
} from "lucide-react";
import "./RadialMenu.css";
import data from '../data.json';

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

const ICON_MAP = {
  youtube: <Youtube size={24} />,
  activity: <Activity size={20} />,
  sun: <Sun size={20} />,
  trending: <TrendingUp size={20} />,
  dollar: <DollarSign size={20} />,
  heart: <Heart size={20} />,
  user: <User size={20} />,
  code: <Code size={20} />,
  utensils: <Utensils size={20} />,
  message: <MessageCircle size={20} />,
  help: <HelpCircle size={20} />,
  bot: <Bot size={20} />,
  search: <Search size={20} />,
  mic: <Mic size={20} />,
  video: <Video size={20} />,
  image: <Image size={20} />,
  brain: <Brain size={20} />,
  building: <Building size={20} />,
  cloud: <Cloud size={20} />,
  server: <Server size={20} />,
  link: <Link size={20} />
};

const RadialMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // 1. TOOLTIP STATE
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });
  
  const GAP = 2; 
  const R1_INNER = 60;
  const R1_OUTER = 140; 
  const R2_INNER = 145;
  const R2_OUTER = 230;
  
  const items = data;
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setActiveGroup(null);
  };

  const handleGroupClick = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  // 2. MOUSE HANDLERS
  const handleMouseEnter = (e, text) => {
    setTooltip({ show: true, x: e.clientX, y: e.clientY, text });
  };

  const handleMouseMove = (e) => {
    setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  const renderSlice = (item, index, total, innerR, outerR, isGroupParent) => {
    const sliceAngle = 360 / total;
    const startAngle = (index * sliceAngle) + (GAP / 2);
    const endAngle = ((index + 1) * sliceAngle) - (GAP / 2);
    
    const pathData = getSectorPath(outerR, innerR, startAngle, endAngle);
    
    const midAngle = startAngle + (sliceAngle - GAP)/2;
    const iconRadius = innerR + (outerR - innerR) / 2;
    const pos = polarToCartesian(iconRadius, midAngle);

    const isActive = activeGroup === item.id;
    const defaultFill = "rgba(30, 35, 40, 0.85)";
    const activeFill = "#d4a017";
    const clipId = `clip-${isGroupParent ? 'parent' : 'child'}-${index}`;
    const imgSize = 160; 

    return (
      <g 
        key={item.label || index} 
        className="slice-group"
        onClick={(e) => isGroupParent && item.children ? handleGroupClick(e, item.id) : null}
        // 3. ATTACH EVENTS TO THE GROUP
        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <a 
          href={item.children ? "#" : item.url} 
          target={item.children ? "_self" : "_blank"}
          rel="noopener noreferrer"
        >
          {item.img && (
            <>
              <defs>
                <clipPath id={clipId}>
                  <path d={pathData} />
                </clipPath>
              </defs>
              <image 
                href={item.img} 
                x={pos.x - (imgSize/2)} 
                y={pos.y - (imgSize/2)} 
                width={imgSize} 
                height={imgSize} 
                preserveAspectRatio="xMidYMid slice" 
                clipPath={`url(#${clipId})`}
                className="sector-bg-image"
              />
            </>
          )}

          <path 
            d={pathData} 
            fill={item.img ? (isActive ? "rgba(212, 160, 23, 0.4)" : "rgba(0,0,0,0.4)") : (isActive ? activeFill : defaultFill)} 
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            className="slice-path"
          />

          {!item.img && (
            <foreignObject 
              x={pos.x - 14} 
              y={pos.y - 14} 
              width="28" 
              height="28" 
              style={{ color: isActive ? "black" : "#ddd", pointerEvents: "none" }}
            >
              <div className="slice-icon">{ICON_MAP[item.icon] || <Link size={20} />}</div>
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
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="menu-container">
        <motion.button
          className="trigger-btn"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
        >
           START
        </motion.button>

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
                {items.map((item, index) => 
                  renderSlice(item, index, items.length, R1_INNER, R1_OUTER, true)
                )}
                {activeGroup && (() => {
                  const group = items.find(i => i.id === activeGroup);
                  if (group && group.children) {
                    return group.children.map((child, idx) => 
                      renderSlice(child, idx, group.children.length, R2_INNER, R2_OUTER, false)
                    );
                  }
                })()}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. RENDER THE TOOLTIP HERE */}
      {tooltip.show && (
        <div 
          className="radial-tooltip"
          style={{ 
            top: tooltip.y, 
            left: tooltip.x 
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default RadialMenu;