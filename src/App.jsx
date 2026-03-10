import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RadialMenu from './components/RadialMenu';
import Galaxy from './components/Galaxy';
import Navbar from './components/Navbar'; // Import new Navbar
import './App.css';
import initialData from './data.json'; // Import default data

function App() {
  const [viewMode, setViewMode] = useState('2d');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '', parentId: 'root' });

  // 1. GLOBAL STATE for Items (Loads from LocalStorage)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('radialMenuItems');
    return saved ? JSON.parse(saved) : initialData;
  });

  // 2. Add Item Logic
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.label) return;

    const newLinkObject = {
      id: Date.now(),
      label: newItem.label,
      url: newItem.url || "#",
      icon: "link",
      img: null,
      children: newItem.url ? null : [] 
    };

    let updatedItems = [...items];

    if (newItem.parentId === 'root') {
      updatedItems.push(newLinkObject);
    } else {
      updatedItems = updatedItems.map(item => {
        if (item.id === parseInt(newItem.parentId)) {
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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      {/* 1. NAVBAR (Switch + Add Button) */}
      <Navbar 
        is3D={viewMode === '3d'} 
        onToggle={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onAddClick={() => setIsAdding(true)}
      />

      {/* 2. BACKGROUND (Galaxy) - We pass 'items' so 3D updates too! */}
      <Galaxy showSolarSystem={viewMode === '3d'} items={items} />

      {/* 3. 2D MENU OVERLAY - We pass 'items' so 2D updates too! */}
      {viewMode === '2d' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                <RadialMenu items={items} />
            </div>
        </div>
      )}

      {/* 4. GLOBAL ADD MODAL (Works in both views) */}
      <AnimatePresence>
        {isAdding && (
            <div className="modal-overlay">
                <motion.div 
                    className="add-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h3>Add New Link</h3>
                        <button onClick={() => setIsAdding(false)} style={{background:'none', border:'none', color:'#666', cursor:'pointer'}}>✕</button>
                    </div>
                    
                    <form onSubmit={handleAddItem}>
                        <input 
                            type="text" 
                            placeholder="Label (e.g. Google)" 
                            value={newItem.label}
                            onChange={(e) => setNewItem({...newItem, label: e.target.value})}
                            autoFocus
                        />
                        <input 
                            type="url" 
                            placeholder="URL (https://...)" 
                            value={newItem.url}
                            onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                        />

                        {/* Location Selector */}
                        <div className="select-wrapper">
                            <label>Location:</label>
                            <select 
                                value={newItem.parentId} 
                                onChange={(e) => setNewItem({...newItem, parentId: e.target.value})}
                                className="location-select"
                            >
                                <option value="root">🔵 Main Circle</option>
                                {items.map(item => (
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
            </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}

export default App