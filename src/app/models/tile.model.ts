export interface Tile {
  id: number;       // Unique identifier for animation purposes
  value: number;    // The value displayed on the tile (2, 4, 8, etc.)
  position: {
    x: number;      // Column position (0-based)
    y: number;      // Row position (0-based)
  };
  isNew?: boolean;  // Flag for new tiles that just appeared
  isMerged?: boolean; // Flag for tiles that just merged
  previousPosition?: { // Used for animation and undo
    x: number;
    y: number;
  };
} 