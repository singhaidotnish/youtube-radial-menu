import { useState } from 'react'
import RadialMenu from './components/RadialMenu'
import Galaxy from './components/Galaxy'
import ToggleSwitch from './components/ToggleSwitch'
import './App.css'
// Working version of the app with proper 2d and 3d switching
function App() {
  const [viewMode, setViewMode] = useState('2d');

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'black' }}>
      
      {/* 1. TOGGLE SWITCH (Top Layer) */}
      <ToggleSwitch 
        is3D={viewMode === '3d'} 
        onToggle={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
      />

      {/* 2. BACKGROUND (Galaxy runs always, but planets hide in 2D) */}
      <Galaxy showSolarSystem={viewMode === '3d'} />

      {/* 3. 2D MENU OVERLAY (Only visible in 2D mode) */}
      {viewMode === '2d' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
            {/* pointerEvents: 'none' lets clicks pass through empty space, 
                but we need to re-enable them for the menu itself inside RadialMenu css */}
            <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                <RadialMenu />
            </div>
        </div>
      )}
      
    </div>
  )
}

export default App