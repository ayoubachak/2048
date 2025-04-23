import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ScoreService } from '../../services/score.service';
import { ThemeService } from '../../services/theme.service';
import { Tile } from '../../models/tile.model';
import { ScoreEntry } from '../../models/score-entry.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, RouterModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  grid: (Tile | null)[][] = [];
  score = 0;
  gridSize = 4; // Fixed to 4x4
  gameOver = false;
  
  // Helper array for grid cells
  gridCells = Array(16).fill(0).map((_, i) => i);
  
  private startTime?: number;
  private subscriptions: Subscription[] = [];
  private touchStartX = 0;
  private touchStartY = 0;
  
  constructor(
    public gameService: GameService,
    private scoreService: ScoreService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start new game with fixed grid size
    this.startNewGame();
    
    // Subscribe to game state changes
    this.subscriptions.push(
      this.gameService.score$.subscribe(score => {
        this.score = score;
      }),
      
      this.gameService.gameOver$.subscribe(isOver => {
        if (isOver && !this.gameOver) {
          this.handleGameOver();
        }
        this.gameOver = isOver;
      }),
      
      this.gameService.tiles$.subscribe(() => {
        this.updateGrid();
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Start a new game with fixed grid size of 4
   */
  startNewGame(): void {
    // Always use 4x4 grid
    this.gridSize = 4;
    
    // Start game in service
    this.gameService.startNewGame();
    this.startTime = Date.now();
  }

  /**
   * Update the rendered grid from the game service
   */
  private updateGrid(): void {
    this.grid = this.gameService.getGrid();
  }

  /**
   * Handle game over - save score
   */
  private handleGameOver(): void {
    const duration = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : undefined;
    
    // Find the maximum tile value
    let maxTile = 0;
    for (const row of this.grid) {
      for (const tile of row) {
        if (tile && tile.value > maxTile) {
          maxTile = tile.value;
        }
      }
    }
    
    // Create score entry
    const scoreEntry: ScoreEntry = {
      score: this.score,
      gridSize: this.gridSize,
      date: new Date().toISOString(),
      duration,
      maxTile
    };
    
    // Add to high scores
    this.scoreService.addScore(scoreEntry);
    
    // Show game over message
    this.snackBar.open(`Game Over! Score: ${this.score}`, 'New Game', {
      duration: 5000
    }).onAction().subscribe(() => {
      this.startNewGame();
    });
  }

  /**
   * Handle keyboard controls
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.gameOver) return;
    
    switch (event.key) {
      case 'ArrowUp':
        this.gameService.move('up');
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.gameService.move('down');
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.gameService.move('left');
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.gameService.move('right');
        event.preventDefault();
        break;
    }
  }

  /**
   * Handle touch start event for swipe detection
   */
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  /**
   * Handle touch end event for swipe detection
   */
  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.gameOver) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // Determine swipe direction based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > 30) { // Minimum swipe distance
        if (deltaX > 0) {
          this.gameService.move('right');
        } else {
          this.gameService.move('left');
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > 30) { // Minimum swipe distance
        if (deltaY > 0) {
          this.gameService.move('down');
        } else {
          this.gameService.move('up');
        }
      }
    }
  }

  /**
   * Undo the last move
   */
  undo(): void {
    this.gameService.undo();
  }

  /**
   * Get the background color for a tile based on its value
   */
  getTileBackgroundColor(value: number | undefined): string {
    if (!value) return '';
    
    // Basic color mapping for different values
    const colorMap: Record<number, string> = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    
    return colorMap[value] || '#3c3a32'; // For values > 2048
  }

  /**
   * Get the text color for a tile based on its value
   */
  getTileTextColor(value: number | undefined): string {
    if (!value) return '';
    
    // Use darker text for low values, white for higher values
    return value <= 4 ? '#776e65' : '#f9f6f2';
  }

  /**
   * Get appropriate text size class based on tile value
   */
  getTileTextSize(value: number | undefined): string {
    if (!value) return '';
    
    if (value < 100) return 'text-3xl';
    if (value < 1000) return 'text-2xl';
    return 'text-xl';
  }

  /**
   * Track tiles by id for efficient rendering
   */
  trackByTileId(index: number, tile: Tile | null): number {
    return tile ? tile.id : index;
  }

  /**
   * Navigate back to the main menu
   */
  backToMenu(): void {
    this.router.navigate(['/']);
  }
} 