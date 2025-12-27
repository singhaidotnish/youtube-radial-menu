import React from 'react';
import RadialMenu from './components/RadialMenu';
import menuData from './data.json'; 
import './index.css';

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">COMMAND CENTER</h1>
      {/* We pass the whole object { youtube: [...], ai: [...] } */}
      <RadialMenu items={menuData} />
    </div>
  );
}

export default App;