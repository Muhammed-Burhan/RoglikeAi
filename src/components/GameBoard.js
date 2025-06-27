import React from 'react';
import { ENTITY_TYPES } from '../utils/gameLogic';
import './GameBoard.css';

const GameBoard = ({ grid, entities, player }) => {
  if (!grid || grid.length === 0) {
    return <div className="game-board loading">Loading...</div>;
  }

  const renderCell = (rowIndex, colIndex) => {
    const baseTile = grid[rowIndex][colIndex];
    
    // Find entity at this position
    const entity = entities.find(e => e.x === colIndex && e.y === rowIndex);
    
    let cellContent = baseTile;
    let cellClass = 'cell';
    
    if (entity) {
      cellContent = entity.symbol;
      
      switch (entity.type) {
        case ENTITY_TYPES.PLAYER:
          cellClass += ' player';
          break;
        case ENTITY_TYPES.ENEMY:
          cellClass += ' enemy';
          if (entity.name === 'Dragon') cellClass += ' dragon';
          else if (entity.name === 'Troll') cellClass += ' troll';
          else if (entity.name === 'Orc') cellClass += ' orc';
          else cellClass += ' goblin';
          break;
        case ENTITY_TYPES.ITEM:
          cellClass += ' item';
          if (entity.symbol === '>') cellClass += ' stairs';
          else if (entity.symbol === 'H') cellClass += ' potion';
          else if (entity.symbol === '$') cellClass += ' gold';
          else if (entity.symbol === 's') cellClass += ' weapon';
          else if (entity.symbol === 'S') cellClass += ' armor';
          break;
      }
    } else {
      // Style based on tile type
      if (baseTile === '#') {
        cellClass += ' wall';
      } else if (baseTile === '.') {
        cellClass += ' floor';
      }
    }
    
    return (
      <span 
        key={`${rowIndex}-${colIndex}`} 
        className={cellClass}
        title={entity ? entity.name : ''}
      >
        {cellContent}
      </span>
    );
  };

  return (
    <div className="game-board-container">
      <div className="game-board">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 