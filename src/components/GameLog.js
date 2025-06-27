import React, { useEffect, useRef } from 'react';
import './GameLog.css';

const GameLog = ({ log }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="game-log">
      <h3>📜 Game Log</h3>
      <div className="log-content">
        {log.map((message, index) => (
          <div key={index} className="log-message">
            {message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default GameLog; 