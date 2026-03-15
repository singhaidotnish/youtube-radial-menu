import { useState } from 'react';
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
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [pendingItems, setPendingItems] = useState(null);
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage'

  const [items] = useState(initialData);

  // â”€â”€ Push to GitHub â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pushToGithub = async (token, itemsToSave) => {
    setSaveStatus('saving');
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
      );
      const fileData = await getRes.json();
      const sha = fileData.sha;
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(itemsToSave, null, 2))));
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ðŸ”— Update menu links via app', content, sha }),
        }
      );
      if (putRes.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
        setIsAdding(false);
        setNewItem({ label: '', url: '', parentId: 'root' });
      } else {
        console.error('GitHub error:', await putRes.json());
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const getTokenAndPush = (itemsToSave) => {
    const token = localStorage.getItem('githubToken');
    if (!token) {
      setPendingItems(itemsToSave);
      setIsTokenModalOpen(true);
      return;
    }
    pushToGithub(token, itemsToSave);
  };

  // â”€â”€ Add link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSaveToGithub = (e) => {
    e.preventDefault();
    if (!newItem.label) return;

    const newLinkObject = {
      id: Date.now(),
      label: newItem.label,
      url: newItem.url || '#',
      icon: 'link',
      img: null,
      children: newItem.url ? null : [],
    };

    let updatedItems = [...items];
    if (newItem.parentId === 'root') {
      updatedItems.push(newLinkObject);
    } else {
      updatedItems = updatedItems.map(item => {
        if (String(item.id) === String(newItem.parentId)) {
          return { ...item, children: [...(item.children || []), newLinkObject] };
        }
        return item;
      });
    }
    getTokenAndPush(updatedItems);
  };

  // â”€â”€ Delete link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDelete = (sectorId, childIndex) => {
    let updatedItems;
    if (sectorId === 'root') {
      // deleting a top-level sector
      updatedItems = items.filter((_, i) => i !== childIndex);
    } else {
      updatedItems = items.map(item => {
        if (String(item.id) === String(sectorId)) {
          const newChildren = (item.children || []).filter((_, i) => i !== childIndex);
          return { ...item, children: newChildren };
        }
        return item;
      });
    }
    getTokenAndPush(updatedItems);
  };

  // â”€â”€ Token modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTokenSave = () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem('githubToken', tokenInput.trim());
    setIsTokenModalOpen(false);
    setTokenInput('');
    if (pendingItems) {
      pushToGithub(tokenInput.trim(), pendingItems);
      setPendingItems(null);
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default? This pushes the original data.json to GitHub.')) {
      getTokenAndPush(initialData);
    }
  };

  const saveBtnLabel = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'âœ“ Saved!' : saveStatus === 'error' ? 'âœ— Failed' : 'ðŸ’¾ Save to GitHub';

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>

      <Navbar
        is3D={viewMode === '3d'}
        onToggle={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onAddClick={() => { setIsAdding(true); setActiveTab('add'); }}
      />

      <Galaxy showSolarSystem={viewMode === '3d'} items={items} />

      {viewMode === '2d' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
            <RadialMenu items={items} />
          </div>
        </div>
      )}

      {/* MAIN MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="modal-overlay">
            <motion.div
              className="add-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Menu Links</h3>
                <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>âœ•</button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                {['add', 'manage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab ? '#ffaa00' : '#1a1a1a',
                      color: activeTab === tab ? '#000' : '#888',
                      fontWeight: activeTab === tab ? 'bold' : 'normal',
                      fontSize: '13px', textTransform: 'capitalize'
                    }}
                  >
                    {tab === 'add' ? '+ Add Link' : 'ðŸ—‘ Manage'}
                  </button>
                ))}
              </div>

              {/* ADD TAB */}
              {activeTab === 'add' && (
                <form onSubmit={handleSaveToGithub}>
                  <input type="text" placeholder="Label (e.g. Bitwarden)" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} autoFocus />
                  <input type="url" placeholder="URL (https://...)" value={newItem.url} onChange={(e) => setNewItem({ ...newItem, url: e.target.value })} />
                  <div className="select-wrapper">
                    <label>Location:</label>
                    <select value={newItem.parentId} onChange={(e) => setNewItem({ ...newItem, parentId: e.target.value })} className="location-select">
                      <option value="root">ðŸ”µ Main Circle</option>
                      {items.map(item => (item.children || !item.url) && <option key={item.id} value={item.id}>ðŸ“‚ Inside: {item.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button type="submit" className="save-btn" disabled={saveStatus === 'saving'}>{saveBtnLabel}</button>
                    <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                  </div>
                </form>
              )}

              {/* MANAGE TAB */}
              {activeTab === 'manage' && (
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {/* Top-level sectors */}
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#555', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Main Circle</p>
                    {items.map((sector, i) => (
                      <div key={sector.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <span style={{ fontSize: '13px', color: '#ccc' }}>ðŸ“‚ {sector.label}</span>
                        <button onClick={() => handleDelete('root', i)} disabled={saveStatus === 'saving'}
                          style={{ background: 'none', border: '1px solid #333', borderRadius: '4px', color: '#ff4444', cursor: 'pointer', padding: '3px 8px', fontSize: '12px' }}>
                          ðŸ—‘
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Children per sector */}
                  {items.map(sector => sector.children && sector.children.length > 0 && (
                    <div key={sector.id} style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', color: '#555', margin: '8px 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Inside: {sector.label}
                      </p>
                      {sector.children.map((child, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #1e1e1e' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '13px', color: '#ccc' }}>{child.label}</span>
                            <span style={{ fontSize: '10px', color: '#444', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.url}</span>
                          </div>
                          <button onClick={() => handleDelete(sector.id, i)} disabled={saveStatus === 'saving'}
                            style={{ background: 'none', border: '1px solid #333', borderRadius: '4px', color: '#ff4444', cursor: 'pointer', padding: '3px 8px', fontSize: '12px', marginLeft: '8px', flexShrink: 0 }}>
                            ðŸ—‘
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Status */}
                  {saveStatus !== 'idle' && (
                    <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: saveStatus === 'saved' ? '#50c850' : saveStatus === 'error' ? '#ff5050' : '#ffaa00' }}>
                      {saveBtnLabel}
                    </p>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOKEN MODAL */}
      <AnimatePresence>
        {isTokenModalOpen && (
          <div className="modal-overlay">
            <motion.div className="add-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>GitHub Token</h3>
                <button onClick={() => setIsTokenModalOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>âœ•</button>
              </div>
              <p style={{ fontSize: '12px', color: '#888', margin: '8px 0 16px' }}>
                One-time setup. Fine-grained token with <strong style={{ color: '#ffaa00' }}>Contents: Read &amp; Write</strong>. Stored in your browser only.
              </p>
              <input type="password" placeholder="github_pat_..." value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleTokenSave()} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="save-btn" onClick={handleTokenSave}>Save &amp; Continue</button>
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
