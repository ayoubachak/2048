export interface ScoreEntry {
  score: number;           // Player's score
  gridSize: number;        // Size of the grid (4, 5, or 6)
  date: string;            // Date when the score was achieved
  duration?: number;       // Game duration in seconds (optional)
  maxTile?: number;        // Highest tile value achieved
} 