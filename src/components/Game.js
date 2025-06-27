import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import PlayerStats from './PlayerStats';
import GameLog from './GameLog';
import Inventory from './Inventory';
import {
  generateLevel,
  placeEntities,
  isValidMove,
  calculateCombat,
  giveExperience,
  moveEnemies,
  ENTITY_TYPES
} from '../utils/gameLogic';
import './Game.css';

const Game = () => {
  const [gameState, setGameState] = useState({
    grid: [],
    entities: [],
    currentLevel: 1,
    gameLog: ['Welcome to RogueLike Adventure! Use WASD or Arrow Keys to move.'],
    gameOver: false,
    victory: false
  });

  const [showInventory, setShowInventory] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const { grid, rooms } = generateLevel(40, 25, 1);
    const entities = placeEntities(grid, rooms, 1);
    
    setGameState({
      grid,
      entities,
      currentLevel: 1,
      gameLog: ['Welcome to RogueLike Adventure! Use WASD or Arrow Keys to move.'],
      gameOver: false,
      victory: false
    });
  };

  const addToLog = (message) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog.slice(-9), message]
    }));
  };

  const getPlayer = () => {
    return gameState.entities.find(e => e.id === 'player');
  };

  const updateEntity = (entityId, updates) => {
    setGameState(prev => ({
      ...prev,
      entities: prev.entities.map(e => 
        e.id === entityId ? { ...e, ...updates } : e
      )
    }));
  };

  const removeEntity = (entityId) => {
    setGameState(prev => ({
      ...prev,
      entities: prev.entities.filter(e => e.id !== entityId)
    }));
  };

  const handleCombat = (player, enemy) => {
    const playerDamage = calculateCombat(player, enemy);
    const enemyDamage = calculateCombat(enemy, player);

    // Apply damage
    const newEnemyHealth = enemy.health - playerDamage;
    const newPlayerHealth = player.health - enemyDamage;

    addToLog(`You attack ${enemy.name} for ${playerDamage} damage!`);

    if (newEnemyHealth <= 0) {
      addToLog(`You defeated ${enemy.name}! Gained ${enemy.xp} XP.`);
      const levelsGained = giveExperience(player, enemy.xp);
      
      if (levelsGained.length > 0) {
        addToLog(`Level up! You are now level ${player.level}.`);
      }
      
      updateEntity('player', player);
      removeEntity(enemy.id);
    } else {
      addToLog(`${enemy.name} attacks you for ${enemyDamage} damage!`);
      updateEntity(enemy.id, { health: newEnemyHealth });
      
      if (newPlayerHealth <= 0) {
        updateEntity('player', { health: 0 });
        setGameState(prev => ({ ...prev, gameOver: true }));
        addToLog('Game Over! You have been defeated.');
      } else {
        updateEntity('player', { health: newPlayerHealth });
      }
    }
  };

  const handleItemPickup = (player, item) => {
    switch (item.itemType) {
      case 'heal':
        const newHealth = Math.min(player.health + item.value, player.maxHealth);
        updateEntity('player', { health: newHealth });
        addToLog(`You drink ${item.name} and restore ${newHealth - player.health} health.`);
        break;
      case 'weapon':
        updateEntity('player', { attack: player.attack + item.value });
        addToLog(`You pick up ${item.name}. Attack increased by ${item.value}!`);
        break;
      case 'armor':
        updateEntity('player', { defense: player.defense + item.value });
        addToLog(`You pick up ${item.name}. Defense increased by ${item.value}!`);
        break;
      case 'gold':
        player.inventory.push(item);
        updateEntity('player', { inventory: player.inventory });
        addToLog(`You pick up ${item.value} gold.`);
        break;
      default:
        player.inventory.push(item);
        updateEntity('player', { inventory: player.inventory });
        addToLog(`You pick up ${item.name}.`);
        break;
    }
    removeEntity(item.id);
  };

  const nextLevel = () => {
    const newLevel = gameState.currentLevel + 1;
    const { grid, rooms } = generateLevel(40, 25, newLevel);
    const entities = placeEntities(grid, rooms, newLevel);
    
    // Keep player stats but reset position
    const player = getPlayer();
    const newPlayer = entities.find(e => e.id === 'player');
    newPlayer.health = player.health;
    newPlayer.maxHealth = player.maxHealth;
    newPlayer.attack = player.attack;
    newPlayer.defense = player.defense;
    newPlayer.level = player.level;
    newPlayer.xp = player.xp;
    newPlayer.xpToNext = player.xpToNext;
    newPlayer.inventory = player.inventory;

    setGameState(prev => ({
      ...prev,
      grid,
      entities,
      currentLevel: newLevel
    }));

    addToLog(`Welcome to level ${newLevel}! The monsters grow stronger...`);
  };

  const movePlayer = useCallback((dx, dy) => {
    if (gameState.gameOver) return;

    const player = getPlayer();
    if (!player) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check for combat
    const enemy = gameState.entities.find(e => 
      e.type === ENTITY_TYPES.ENEMY && e.x === newX && e.y === newY
    );

    if (enemy) {
      handleCombat(player, enemy);
      return;
    }

    // Check for items
    const item = gameState.entities.find(e => 
      e.type === ENTITY_TYPES.ITEM && e.x === newX && e.y === newY
    );

    if (item) {
      if (item.name === 'Stairs to next level') {
        nextLevel();
        return;
      } else {
        handleItemPickup(player, item);
      }
    }

    // Check if move is valid
    if (isValidMove(gameState.grid, gameState.entities, newX, newY)) {
      updateEntity('player', { x: newX, y: newY });
      
      // Move enemies after player moves
      setTimeout(() => {
        setGameState(prev => {
          const newEntities = [...prev.entities];
          moveEnemies(newEntities, prev.grid, { x: newX, y: newY });
          return { ...prev, entities: newEntities };
        });
      }, 100);
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          movePlayer(1, 0);
          break;
        case 'i':
          e.preventDefault();
          setShowInventory(!showInventory);
          break;
        case 'r':
          if (gameState.gameOver) {
            e.preventDefault();
            startNewGame();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer, gameState.gameOver, showInventory]);

  const player = getPlayer();

  return (
    <div className="game-container">
      <div className="game-main">
        <div className="game-left">
          <PlayerStats player={player} level={gameState.currentLevel} />
          <GameLog log={gameState.gameLog} />
        </div>
        
        <div className="game-center">
          <GameBoard
            grid={gameState.grid}
            entities={gameState.entities}
            player={player}
          />
          
          {gameState.gameOver && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>💀 Game Over! 💀</h2>
                <p>You reached level {gameState.currentLevel}</p>
                <p>Press R to restart</p>
              </div>
            </div>
          )}
        </div>

        <div className="game-right">
          <div className="controls-panel">
            <h3>Controls</h3>
            <div className="control-item">
              <strong>WASD / Arrows:</strong> Move
            </div>
            <div className="control-item">
              <strong>I:</strong> Toggle Inventory
            </div>
            <div className="control-item">
              <strong>Walk into enemies:</strong> Attack
            </div>
            <div className="control-item">
              <strong>Walk into items:</strong> Pick up
            </div>
          </div>

          {showInventory && player && (
            <Inventory 
              player={player} 
              onClose={() => setShowInventory(false)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game; 