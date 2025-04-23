import { Component, OnInit, OnDestroy, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';
import { ScoreService } from '../../services/score.service';
import { ThemeService } from '../../services/theme.service';
import { AIPlayerService } from '../../services/ai-player.service';
import { AiControlsComponent } from '../ai-controls/ai-controls.component';
import { Tile } from '../../models/tile.model';
import { ScoreEntry } from '../../models/score-entry.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule, 
    RouterModule,
    AiControlsComponent
  ],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  host: {
    '[class.grid-3]': 'gridSize === 3',
    '[class.grid-4]': 'gridSize === 4',
    '[class.grid-5]': 'gridSize === 5',
    '[class.grid-6]': 'gridSize === 6',
    '[class.grid-7]': 'gridSize === 7',
    '[class.grid-8]': 'gridSize === 8'
  }
})
export class GameBoardComponent implements OnInit, OnDestroy {
  grid: (Tile | null)[][] = [];
  score = 0;
  gridSize = 4; // Default grid size
  gameOver = false;
  showAIControls = false; // Flag to show AI controls
  
  // Helper array for grid cells, will be updated when grid size changes
  gridCells: number[] = [];
  
  // Gap settings
  private gapSize = 10; // Default gap size between cells
  
  private startTime?: number;
  private subscriptions: Subscription[] = [];
  private touchStartX = 0;
  private touchStartY = 0;
  
  constructor(
    public gameService: GameService,
    private scoreService: ScoreService,
    private themeService: ThemeService,
    private aiPlayerService: AIPlayerService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters for grid size and AI flag
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        // Check for grid size
        const size = params['size'] ? parseInt(params['size'], 10) : 4;
        this.gridSize = isNaN(size) ? 4 : Math.min(Math.max(size, 3), 8); // Limit between 3 and 8
        
        // Check for AI controls flag
        this.showAIControls = params['ai'] === 'true';
        
        // Update gridCells for the template
        this.updateGridCells();
        
        // Start new game with selected grid size
        this.startNewGame();
      })
    );
    
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

  /**
   * Get the CSS grid template columns string
   */
  getGridTemplateColumns(): string {
    return `repeat(${this.gridSize}, 1fr)`;
  }

  /**
   * Get the CSS grid template rows string
   */
  getGridTemplateRows(): string {
    return `repeat(${this.gridSize}, 1fr)`;
  }

  /**
   * Calculate the width of a tile based on grid size
   */
  getTileWidth(): string {
    // Use smaller gap size on smaller screens
    const effectiveGapSize = window.innerWidth <= 480 ? 8 : this.gapSize;
    const totalGapWidth = effectiveGapSize * (this.gridSize - 1);
    return `calc((100% - ${totalGapWidth}px) / ${this.gridSize})`;
  }

  /**
   * Calculate the height of a tile based on grid size
   */
  getTileHeight(): string {
    // Use smaller gap size on smaller screens
    const effectiveGapSize = window.innerWidth <= 480 ? 8 : this.gapSize;
    const totalGapHeight = effectiveGapSize * (this.gridSize - 1);
    return `calc((100% - ${totalGapHeight}px) / ${this.gridSize})`;
  }

  /**
   * Calculate the top position of a tile
   */
  getTileTop(y: number): string {
    // Use smaller gap size on smaller screens
    const effectiveGapSize = window.innerWidth <= 480 ? 8 : this.gapSize;
    const cellSize = `calc((100% - ${effectiveGapSize * (this.gridSize - 1)}px) / ${this.gridSize})`;
    return `calc(${y} * (${cellSize} + ${effectiveGapSize}px))`;
  }

  /**
   * Calculate the left position of a tile
   */
  getTileLeft(x: number): string {
    // Use smaller gap size on smaller screens
    const effectiveGapSize = window.innerWidth <= 480 ? 8 : this.gapSize;
    const cellSize = `calc((100% - ${effectiveGapSize * (this.gridSize - 1)}px) / ${this.gridSize})`;
    return `calc(${x} * (${cellSize} + ${effectiveGapSize}px))`;
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Stop AI if it's running
    if (this.showAIControls) {
      this.aiPlayerService.stopPlaying();
    }
  }

  /**
   * Update gridCells array based on current grid size
   */
  private updateGridCells(): void {
    const totalCells = this.gridSize * this.gridSize;
    this.gridCells = Array(totalCells).fill(0).map((_, i) => i);
  }

  /**
   * Start a new game with the current grid size
   */
  startNewGame(): void {
    // Start game in service, passing the grid size
    this.gameService.startNewGame(this.gridSize);
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
   * Get appropriate text size class based on tile value and grid size
   */
  getTileTextSize(value: number | undefined): string {
    if (!value) return '';
    
    // For smaller grid sizes, use larger text
    if (this.gridSize <= 4) {
      if (value < 100) return 'text-3xl';
      if (value < 1000) return 'text-2xl';
      return 'text-xl';
    }
    // For medium grid sizes
    else if (this.gridSize <= 6) {
      if (value < 100) return 'text-2xl';
      if (value < 1000) return 'text-xl';
      return 'text-lg';
    } 
    // For large grid sizes
    else {
      if (value < 100) return 'text-xl';
      if (value < 1000) return 'text-lg';
      return 'text-sm';
    }
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

  /**
   * Get the gap size based on screen width
   */
  getGapSize(): number {
    return window.innerWidth <= 480 ? 8 : this.gapSize;
  }
} 