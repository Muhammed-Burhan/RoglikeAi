// Game constants
export const TILE_TYPES = {
  EMPTY: '.',
  WALL: '#',
  PLAYER: '@',
  ENEMY: 'E',
  TREASURE: '$',
  POTION: 'H',
  STAIRS: '>',
  DOOR: '+'
};

export const ENTITY_TYPES = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  ITEM: 'item'
};

// Enemy types with different stats based on level
export const ENEMY_TYPES = [
  { name: 'Goblin', symbol: 'g', health: 15, attack: 3, defense: 1, xp: 10 },
  { name: 'Orc', symbol: 'o', health: 25, attack: 5, defense: 2, xp: 20 },
  { name: 'Troll', symbol: 'T', health: 40, attack: 8, defense: 3, xp: 35 },
  { name: 'Dragon', symbol: 'D', health: 80, attack: 15, defense: 5, xp: 100 }
];

export const ITEM_TYPES = [
  { name: 'Health Potion', symbol: 'H', type: 'heal', value: 20 },
  { name: 'Sword', symbol: 's', type: 'weapon', value: 5 },
  { name: 'Shield', symbol: 'S', type: 'armor', value: 3 },
  { name: 'Gold', symbol: '$', type: 'gold', value: 50 }
];

// Level generation using cellular automata-like algorithm
export function generateLevel(width = 40, height = 25, level = 1) {
  const grid = Array(height).fill().map(() => Array(width).fill(TILE_TYPES.WALL));
  
  // Create rooms
  const rooms = [];
  const numRooms = Math.min(6 + Math.floor(level / 2), 12);
  
  for (let i = 0; i < numRooms; i++) {
    const roomWidth = Math.floor(Math.random() * 8) + 4;
    const roomHeight = Math.floor(Math.random() * 6) + 3;
    const x = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
    const y = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
    
    // Check if room overlaps with existing rooms
    let overlap = false;
    for (const room of rooms) {
      if (x < room.x + room.width + 1 && x + roomWidth + 1 > room.x &&
          y < room.y + room.height + 1 && y + roomHeight + 1 > room.y) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) {
      // Create room
      for (let dy = 0; dy < roomHeight; dy++) {
        for (let dx = 0; dx < roomWidth; dx++) {
          grid[y + dy][x + dx] = TILE_TYPES.EMPTY;
        }
      }
      rooms.push({ x, y, width: roomWidth, height: roomHeight });
    }
  }
  
  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currentRoom = rooms[i];
    
    const prevCenterX = Math.floor(prevRoom.x + prevRoom.width / 2);
    const prevCenterY = Math.floor(prevRoom.y + prevRoom.height / 2);
    const currentCenterX = Math.floor(currentRoom.x + currentRoom.width / 2);
    const currentCenterY = Math.floor(currentRoom.y + currentRoom.height / 2);
    
    // Horizontal corridor
    const startX = Math.min(prevCenterX, currentCenterX);
    const endX = Math.max(prevCenterX, currentCenterX);
    for (let x = startX; x <= endX; x++) {
      grid[prevCenterY][x] = TILE_TYPES.EMPTY;
    }
    
    // Vertical corridor
    const startY = Math.min(prevCenterY, currentCenterY);
    const endY = Math.max(prevCenterY, currentCenterY);
    for (let y = startY; y <= endY; y++) {
      grid[y][currentCenterX] = TILE_TYPES.EMPTY;
    }
  }
  
  return { grid, rooms };
}

// Place entities in the level
export function placeEntities(grid, rooms, level) {
  const entities = [];
  const width = grid[0].length;
  const height = grid.length;
  
  // Place player in first room
  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    const playerX = Math.floor(firstRoom.x + firstRoom.width / 2);
    const playerY = Math.floor(firstRoom.y + firstRoom.height / 2);
    entities.push({
      id: 'player',
      type: ENTITY_TYPES.PLAYER,
      x: playerX,
      y: playerY,
      symbol: '@',
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 2,
      level: 1,
      xp: 0,
      xpToNext: 100,
      inventory: []
    });
  }
  
  // Place stairs in last room
  if (rooms.length > 1) {
    const lastRoom = rooms[rooms.length - 1];
    const stairsX = Math.floor(lastRoom.x + lastRoom.width / 2);
    const stairsY = Math.floor(lastRoom.y + lastRoom.height / 2);
    entities.push({
      id: 'stairs',
      type: ENTITY_TYPES.ITEM,
      x: stairsX,
      y: stairsY,
      symbol: '>',
      name: 'Stairs to next level'
    });
  }
  
  // Place enemies
  const numEnemies = Math.min(3 + level, 15);
  for (let i = 0; i < numEnemies; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    let x, y;
    let attempts = 0;
    
    do {
      x = room.x + Math.floor(Math.random() * room.width);
      y = room.y + Math.floor(Math.random() * room.height);
      attempts++;
    } while (attempts < 20 && (grid[y][x] !== TILE_TYPES.EMPTY || 
             entities.some(e => e.x === x && e.y === y)));
    
    if (attempts < 20) {
      const enemyTypeIndex = Math.min(
        Math.floor(level / 3) + Math.floor(Math.random() * 2),
        ENEMY_TYPES.length - 1
      );
      const enemyType = ENEMY_TYPES[enemyTypeIndex];
      
      entities.push({
        id: `enemy_${i}`,
        type: ENTITY_TYPES.ENEMY,
        x,
        y,
        symbol: enemyType.symbol,
        name: enemyType.name,
        health: enemyType.health + Math.floor(level * 2),
        maxHealth: enemyType.health + Math.floor(level * 2),
        attack: enemyType.attack + Math.floor(level / 2),
        defense: enemyType.defense + Math.floor(level / 3),
        xp: enemyType.xp + Math.floor(level * 3)
      });
    }
  }
  
  // Place items
  const numItems = Math.min(2 + Math.floor(level / 2), 8);
  for (let i = 0; i < numItems; i++) {
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    let x, y;
    let attempts = 0;
    
    do {
      x = room.x + Math.floor(Math.random() * room.width);
      y = room.y + Math.floor(Math.random() * room.height);
      attempts++;
    } while (attempts < 20 && (grid[y][x] !== TILE_TYPES.EMPTY || 
             entities.some(e => e.x === x && e.y === y)));
    
    if (attempts < 20) {
      const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
      entities.push({
        id: `item_${i}`,
        type: ENTITY_TYPES.ITEM,
        x,
        y,
        symbol: itemType.symbol,
        name: itemType.name,
        itemType: itemType.type,
        value: itemType.value + Math.floor(level * 2)
      });
    }
  }
  
  return entities;
}

// Combat calculation
export function calculateCombat(attacker, defender) {
  const damage = Math.max(1, attacker.attack - defender.defense + Math.floor(Math.random() * 4) - 2);
  return damage;
}

// Experience and leveling
export function giveExperience(player, amount) {
  player.xp += amount;
  const levelsGained = [];
  
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    player.maxHealth += 10;
    player.health = player.maxHealth; // Full heal on level up
    player.attack += 2;
    player.defense += 1;
    player.xpToNext = Math.floor(player.xpToNext * 1.5);
    levelsGained.push(player.level);
  }
  
  return levelsGained;
}

// Check if position is valid for movement
export function isValidMove(grid, entities, x, y) {
  if (x < 0 || y < 0 || y >= grid.length || x >= grid[0].length) {
    return false;
  }
  
  if (grid[y][x] === TILE_TYPES.WALL) {
    return false;
  }
  
  // Check for blocking entities (enemies)
  const entityAtPosition = entities.find(e => e.x === x && e.y === y && e.type === ENTITY_TYPES.ENEMY);
  return !entityAtPosition;
}

// Simple AI for enemies
export function moveEnemies(entities, grid, playerPos) {
  const enemies = entities.filter(e => e.type === ENTITY_TYPES.ENEMY);
  
  enemies.forEach(enemy => {
    // Simple pathfinding - move towards player if in range
    const dx = playerPos.x - enemy.x;
    const dy = playerPos.y - enemy.y;
    const distance = Math.abs(dx) + Math.abs(dy);
    
    if (distance <= 8) { // Enemy detection range
      let moveX = 0, moveY = 0;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        moveX = dx > 0 ? 1 : -1;
      } else {
        moveY = dy > 0 ? 1 : -1;
      }
      
      const newX = enemy.x + moveX;
      const newY = enemy.y + moveY;
      
      if (isValidMove(grid, entities.filter(e => e !== enemy), newX, newY)) {
        enemy.x = newX;
        enemy.y = newY;
      }
    } else {
      // Random movement
      if (Math.random() < 0.3) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const [moveX, moveY] = directions[Math.floor(Math.random() * directions.length)];
        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;
        
        if (isValidMove(grid, entities.filter(e => e !== enemy), newX, newY)) {
          enemy.x = newX;
          enemy.y = newY;
        }
      }
    }
  });
} 