import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tile } from '../models/tile.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Game state observables
  private scoreSubject = new BehaviorSubject<number>(0);
  private tilesSubject = new BehaviorSubject<Tile[]>([]);
  private gameOverSubject = new BehaviorSubject<boolean>(false);
  private lastStateSubject = new BehaviorSubject<{tiles: Tile[], score: number} | null>(null);
  private gridSizeSubject = new BehaviorSubject<number>(4);
  
  // Public observables
  public score$: Observable<number> = this.scoreSubject.asObservable();
  public tiles$: Observable<Tile[]> = this.tilesSubject.asObservable();
  public gameOver$: Observable<boolean> = this.gameOverSubject.asObservable();
  public gridSize$: Observable<number> = this.gridSizeSubject.asObservable();
  
  // Grid size (default 4)
  private gridSize = 4;
  
  // ID counter for tiles
  private tileIdCounter = 0;
  
  constructor() {}

  /**
   * Start a new game
   */
  startNewGame(gridSize: number = 4): void {
    // Set grid size (minimum 3, maximum 8)
    this.gridSize = Math.min(Math.max(gridSize, 3), 8);
    this.gridSizeSubject.next(this.gridSize);
    
    this.scoreSubject.next(0);
    this.gameOverSubject.next(false);
    this.lastStateSubject.next(null);
    
    // Initialize empty grid
    const tiles: Tile[] = [];
    this.tilesSubject.next(tiles);
    
    // Add initial tiles
    this.addRandomTile();
    this.addRandomTile();
  }

  /**
   * Add a random tile (2 or 4) to an empty cell
   */
  private addRandomTile(): void {
    const tiles = [...this.tilesSubject.value];
    const emptyCells: {x: number, y: number}[] = [];
    
    // Find all empty cells
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (!this.getTileAt(x, y, tiles)) {
          emptyCells.push({x, y});
        }
      }
    }
    
    // If there are empty cells, add a new tile
    if (emptyCells.length > 0) {
      const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
      
      const newTile: Tile = {
        id: this.tileIdCounter++,
        value,
        position: {x: cell.x, y: cell.y},
        isNew: true
      };
      
      tiles.push(newTile);
      this.tilesSubject.next(tiles);
    }
  }

  /**
   * Helper to get a tile at specific coordinates
   */
  private getTileAt(x: number, y: number, tiles: Tile[]): Tile | undefined {
    return tiles.find(tile => tile.position.x === x && tile.position.y === y);
  }

  /**
   * Save current game state for undo
   */
  private saveState(): void {
    const tiles = this.tilesSubject.value.map(tile => ({...tile, isNew: false, isMerged: false}));
    const score = this.scoreSubject.value;
    this.lastStateSubject.next({tiles: JSON.parse(JSON.stringify(tiles)), score});
  }

  /**
   * Move tiles in the specified direction and merge if possible
   */
  move(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    // Save the current state for undo
    this.saveState();
    
    const originalTiles = [...this.tilesSubject.value];
    let tiles = originalTiles.map(tile => ({...tile, isMerged: false, isNew: false, previousPosition: {...tile.position}}));
    let score = this.scoreSubject.value;
    let moved = false;
    
    // Clear merge flags
    tiles = tiles.map(tile => ({...tile, isMerged: false}));
    
    // Process the move based on direction
    switch (direction) {
      case 'up':
        for (let x = 0; x < this.gridSize; x++) {
          for (let y = 1; y < this.gridSize; y++) {
            moved = this.moveTile(x, y, 0, -1, tiles) || moved;
          }
        }
        break;
      case 'down':
        for (let x = 0; x < this.gridSize; x++) {
          for (let y = this.gridSize - 2; y >= 0; y--) {
            moved = this.moveTile(x, y, 0, 1, tiles) || moved;
          }
        }
        break;
      case 'left':
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 1; x < this.gridSize; x++) {
            moved = this.moveTile(x, y, -1, 0, tiles) || moved;
          }
        }
        break;
      case 'right':
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = this.gridSize - 2; x >= 0; x--) {
            moved = this.moveTile(x, y, 1, 0, tiles) || moved;
          }
        }
        break;
    }
    
    // Update the score
    this.scoreSubject.next(score);
    
    // If any tile moved, add a new random tile
    if (moved) {
      this.tilesSubject.next(tiles);
      setTimeout(() => this.addRandomTile(), 150); // Small delay for animations
      
      // Check for game over
      setTimeout(() => this.checkGameOver(), 300);
    } else {
      // If no move was made, discard the saved state
      this.lastStateSubject.next(null);
    }
    
    return moved;
  }

  /**
   * Move a single tile in the specified direction
   */
  private moveTile(x: number, y: number, dx: number, dy: number, tiles: Tile[]): boolean {
    const tile = this.getTileAt(x, y, tiles);
    if (!tile) return false;
    
    let nextX = x + dx;
    let nextY = y + dy;
    let moved = false;
    
    // Keep moving in the specified direction until hitting a boundary or another tile
    while (
      nextX >= 0 && nextX < this.gridSize &&
      nextY >= 0 && nextY < this.gridSize
    ) {
      const nextTile = this.getTileAt(nextX, nextY, tiles);
      
      if (!nextTile) {
        // Move to empty space
        tile.position.x = nextX;
        tile.position.y = nextY;
        moved = true;
        nextX += dx;
        nextY += dy;
      } else if (nextTile.value === tile.value && !nextTile.isMerged) {
        // Merge with same-value tile
        tile.position.x = nextX;
        tile.position.y = nextY;
        tile.isMerged = true;
        nextTile.isMerged = true;
        
        // Remove this tile and increase value of the other
        const tileIndex = tiles.findIndex(t => t.id === tile.id);
        if (tileIndex !== -1) {
          tiles.splice(tileIndex, 1);
        }
        
        nextTile.value *= 2;
        
        // Update score
        this.scoreSubject.next(this.scoreSubject.value + nextTile.value);
        
        moved = true;
        break;
      } else {
        // Hit another tile, stop
        break;
      }
    }
    
    return moved;
  }

  /**
   * Check if game is over (no more valid moves)
   */
  private checkGameOver(): void {
    const tiles = this.tilesSubject.value;
    
    // If there are empty cells, game is not over
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (!this.getTileAt(x, y, tiles)) {
          return;
        }
      }
    }
    
    // Check for possible merges
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tile = this.getTileAt(x, y, tiles);
        if (tile) {
          // Check adjacent cells for same value
          const directions = [{dx: 0, dy: 1}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: -1, dy: 0}];
          for (const dir of directions) {
            const adjX = x + dir.dx;
            const adjY = y + dir.dy;
            
            if (adjX >= 0 && adjX < this.gridSize && adjY >= 0 && adjY < this.gridSize) {
              const adjTile = this.getTileAt(adjX, adjY, tiles);
              if (adjTile && adjTile.value === tile.value) {
                // Found a possible merge, game is not over
                return;
              }
            }
          }
        }
      }
    }
    
    // If we get here, no valid moves exist
    this.gameOverSubject.next(true);
  }

  /**
   * Undo the last move
   */
  undo(): boolean {
    const lastState = this.lastStateSubject.value;
    if (lastState) {
      this.tilesSubject.next(lastState.tiles);
      this.scoreSubject.next(lastState.score);
      this.lastStateSubject.next(null);
      this.gameOverSubject.next(false);
      return true;
    }
    return false;
  }

  /**
   * Get the current grid as a 2D array for rendering
   */
  getGrid(): (Tile | null)[][] {
    const tiles = this.tilesSubject.value;
    const grid: (Tile | null)[][] = [];
    
    // Initialize empty grid
    for (let y = 0; y < this.gridSize; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        grid[y][x] = null;
      }
    }
    
    // Place tiles
    for (const tile of tiles) {
      const {x, y} = tile.position;
      if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
        grid[y][x] = tile;
      }
    }
    
    return grid;
  }
} 