import React, { useState, useEffect, useCallback } from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🗡️ RogueLike Adventure ⚔️</h1>
        <p>Use WASD or Arrow Keys to move • Fight monsters • Collect loot • Survive!</p>
      </header>
      <Game />
    </div>
  );
}

export default App; 