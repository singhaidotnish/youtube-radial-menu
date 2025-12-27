import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Youtube, Code, TrendingUp, Activity, Sun, DollarSign, 
  Heart, User, Utensils, MessageCircle, HelpCircle, Link,
  Bot, Search, Mic, Video, Image, Brain, Building, Cloud, Server
} from "lucide-react";
import "./RadialMenu.css";

// --- Math Helpers (Centered at 0,0) ---
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

const RadialMenu = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  
  // CONFIGURATION
  const GAP = 2; 

  // --- RING SIZES ---
  const R1_INNER = 60;
  const R1_OUTER = 140; 
  const R2_INNER = 145;
  const R2_OUTER = 230;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setActiveGroup(null);
  };

  const handleGroupClick = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveGroup(activeGroup === groupId ? null : groupId);
  };

  const renderSlice = (item, index, total, innerR, outerR, isGroupParent) => {
    const sliceAngle = 360 / total;
    const startAngle = (index * sliceAngle) + (GAP / 2);
    const endAngle = ((index + 1) * sliceAngle) - (GAP / 2);
    
    // Draw Path (0,0 is center)
    const pathData = getSectorPath(outerR, innerR, startAngle, endAngle);
    
    // Icon Position
    const midAngle = startAngle + (sliceAngle - GAP)/2;
    const iconRadius = innerR + (outerR - innerR) / 2;
    const pos = polarToCartesian(iconRadius, midAngle);

    // Styling
    const isActive = activeGroup === item.id;
    const fillColor = isActive ? "#d4a017" : "rgba(30, 35, 40, 0.85)";
    const textColor = isActive ? "black" : "#ddd";

    // Icon logic
    let iconContent;
    if (item.img) {
      iconContent = <img src={item.img} alt={item.label} className="slice-img" />;
    } else {
      iconContent = <div className="slice-icon">{ICON_MAP[item.icon] || <Link size={20} />}</div>;
    }

    return (
      <g 
        key={item.label || index} 
        className="slice-group"
        onClick={(e) => isGroupParent && item.children ? handleGroupClick(e, item.id) : null}
      >
        <a 
          href={item.children ? "#" : item.url} 
          target={item.children ? "_self" : "_blank"}
          rel="noopener noreferrer"
        >
          <path 
            d={pathData} 
            fill={fillColor} 
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            className="slice-path"
          />
          <foreignObject x={pos.x - 14} y={pos.y - 14} width="28" height="28" style={{ color: textColor }}>
            {iconContent}
          </foreignObject>
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
        {/* Center Button with START Text */}
        <motion.button
          className="trigger-btn"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
        >
           START
        </motion.button>

        {/* SVG Layer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="svg-layer"
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* VIEWBOX EXPLAINED: 
                 -300 -300 means the top-left corner is at coordinate (-300, -300).
                 This puts coordinate (0,0) exactly in the center of the 600x600 box.
              */}
              <svg width="600" height="600" viewBox="-300 -300 600 600" style={{ overflow: 'visible' }}>
                
                {/* INNER RING (Parents) */}
                {items.map((item, index) => 
                  renderSlice(item, index, items.length, R1_INNER, R1_OUTER, true)
                )}

                {/* OUTER RING (Children) */}
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
    </div>
  );
};

export default RadialMenu;