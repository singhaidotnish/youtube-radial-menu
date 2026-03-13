import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RadialMenu from './components/RadialMenu';
import Galaxy from './components/Galaxy';
import Navbar from './components/Navbar';
import './App.css';
import initialData from './data.json';

const GITHUB_OWNER = 'singhaidotnish';
const GITHUB_REPO = 'mymenu-yt';
const GITHUB_FILE_PATH = 'src/data.json';

function App() {
  const [viewMode, setViewMode] = useState('2d');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '', parentId: 'root' });
  const [githubStatus, setGithubStatus] = useState('idle'); // idle | saving | saved | error
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('radialMenuItems');
    return saved ? JSON.parse(saved) : initialData;
  });

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

  // ── GitHub Save Logic ──────────────────────────────────────────
  const handleGithubSave = async () => {
    const token = localStorage.getItem('githubToken');
    if (!token) {
      setIsTokenModalOpen(true);
      return;
    }
    await pushToGithub(token);
  };

  const handleTokenSave = async () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem('githubToken', tokenInput.trim());
    setIsTokenModalOpen(false);
    setTokenInput('');
    await pushToGithub(tokenInput.trim());
  };

  const pushToGithub = async (token) => {
    setGithubStatus('saving');
    try {
      // 1. Get current file SHA (required for update)
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
      );
      const fileData = await getRes.json();
      const sha = fileData.sha;

      // 2. Encode new content as base64
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(items, null, 2))));

      // 3. Commit the update
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: '🔗 Update menu links via app',
            content,
            sha,
          }),
        }
      );

      if (putRes.ok) {
        setGithubStatus('saved');
        setTimeout(() => setGithubStatus('idle'), 3000);
      } else {
        const err = await putRes.json();
        console.error('GitHub error:', err);
        setGithubStatus('error');
        setTimeout(() => setGithubStatus('idle'), 4000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setGithubStatus('error');
      setTimeout(() => setGithubStatus('idle'), 4000);
    }
  };
  // ──────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      <Navbar 
        is3D={viewMode === '3d'} 
        onToggle={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onAddClick={() => setIsAdding(true)}
        onGithubSave={handleGithubSave}
        githubStatus={githubStatus}
      />

      <Galaxy showSolarSystem={viewMode === '3d'} items={items} />

      {viewMode === '2d' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                <RadialMenu items={items} />
            </div>
        </div>
      )}

      {/* ADD LINK MODAL */}
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

      {/* GITHUB TOKEN MODAL */}
      <AnimatePresence>
        {isTokenModalOpen && (
          <div className="modal-overlay">
            <motion.div
              className="add-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3>GitHub Token</h3>
                <button onClick={() => setIsTokenModalOpen(false)} style={{background:'none', border:'none', color:'#666', cursor:'pointer'}}>✕</button>
              </div>
              <p style={{fontSize:'12px', color:'#888', margin:'8px 0 16px'}}>
                Paste your fine-grained token with <strong style={{color:'#ffaa00'}}>Contents: Read &amp; Write</strong> for this repo. Stored locally in your browser only.
              </p>
              <input
                type="password"
                placeholder="github_pat_..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleTokenSave()}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="save-btn" onClick={handleTokenSave}>Save &amp; Sync</button>
                <button className="reset-btn" onClick={() => { localStorage.removeItem('githubToken'); setIsTokenModalOpen(false); }}>Clear Token</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
