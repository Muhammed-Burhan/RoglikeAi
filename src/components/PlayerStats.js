import React from 'react';
import './PlayerStats.css';

const PlayerStats = ({ player, level }) => {
  if (!player) {
    return <div className="player-stats">Loading player...</div>;
  }

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const xpPercentage = (player.xp / player.xpToNext) * 100;

  return (
    <div className="player-stats">
      <h3>🏃‍♂️ Player Stats</h3>
      
      <div className="stat-section">
        <div className="stat-row">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{player.level}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Floor:</span>
          <span className="stat-value">{level}</span>
        </div>
      </div>

      <div className="stat-section">
        <div className="stat-row">
          <span className="stat-label">Health:</span>
          <span className="stat-value">{player.health}/{player.maxHealth}</span>
        </div>
        <div className="health-bar">
          <div 
            className="health-fill" 
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="stat-section">
        <div className="stat-row">
          <span className="stat-label">Experience:</span>
          <span className="stat-value">{player.xp}/{player.xpToNext}</span>
        </div>
        <div className="xp-bar">
          <div 
            className="xp-fill" 
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="stat-section">
        <div className="stat-row">
          <span className="stat-label">⚔️ Attack:</span>
          <span className="stat-value">{player.attack}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">🛡️ Defense:</span>
          <span className="stat-value">{player.defense}</span>
        </div>
      </div>

      <div className="stat-section">
        <div className="stat-row">
          <span className="stat-label">🎒 Items:</span>
          <span className="stat-value">{player.inventory?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats; 