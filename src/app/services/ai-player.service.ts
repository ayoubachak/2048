import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { GameService } from './game.service';

export type AIStrategy = 'greedy' | 'corner' | 'random';

@Injectable({
  providedIn: 'root'
})
export class AIPlayerService {
  // AI state tracking
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();
  
  // Current strategy
  private strategySubject = new BehaviorSubject<AIStrategy>('corner');
  public strategy$ = this.strategySubject.asObservable();
  
  // Speed in ms between moves (lower = faster)
  private speedSubject = new BehaviorSubject<number>(500);
  public speed$ = this.speedSubject.asObservable();
  
  private aiInterval?: Subscription;
  
  constructor(private gameService: GameService) {}
  
  /**
   * Start the AI player
   */
  startPlaying(strategy: AIStrategy = 'corner', speed: number = 500): void {
    if (this.isPlayingSubject.value) {
      this.stopPlaying();
    }
    
    this.strategySubject.next(strategy);
    this.speedSubject.next(speed);
    this.isPlayingSubject.next(true);
    
    // Start interval for regular moves
    this.aiInterval = interval(speed).subscribe(() => {
      if (this.isPlayingSubject.value) {
        this.makeNextMove();
      }
    });
  }
  
  /**
   * Stop the AI player
   */
  stopPlaying(): void {
    this.isPlayingSubject.next(false);
    if (this.aiInterval) {
      this.aiInterval.unsubscribe();
      this.aiInterval = undefined;
    }
  }
  
  /**
   * Change the AI speed
   */
  setSpeed(speed: number): void {
    this.speedSubject.next(speed);
    
    // Restart the interval with new speed if playing
    if (this.isPlayingSubject.value) {
      this.stopPlaying();
      this.startPlaying(this.strategySubject.value, speed);
    }
  }
  
  /**
   * Change the AI strategy
   */
  setStrategy(strategy: AIStrategy): void {
    this.strategySubject.next(strategy);
  }
  
  /**
   * Make a single AI move
   */
  makeNextMove(): boolean {
    const strategy = this.strategySubject.value;
    let moved = false;
    
    switch (strategy) {
      case 'greedy':
        moved = this.makeGreedyMove();
        break;
      case 'corner':
        moved = this.makeCornerStrategyMove();
        break;
      case 'random':
        moved = this.makeRandomMove();
        break;
    }
    
    // If no move was made and we're still playing, try a random move as fallback
    if (!moved && this.isPlayingSubject.value) {
      moved = this.makeRandomMove();
    }
    
    return moved;
  }
  
  /**
   * Strategy: Make moves favoring corners and edges
   * This is a simple but effective strategy for 2048
   */
  private makeCornerStrategyMove(): boolean {
    // Try directions in preferred order: right, down, left, up
    const directions: ('up' | 'down' | 'left' | 'right')[] = ['right', 'down', 'left', 'up'];
    
    // Try each direction in order until one works
    for (const direction of directions) {
      if (this.gameService.move(direction)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Strategy: Choose the move that merges the most tiles
   * or creates the highest value
   */
  private makeGreedyMove(): boolean {
    // Simple implementation for now - try all moves and pick the one that
    // results in the highest score increase
    // In a real implementation, we would simulate the moves without actually making them
    
    // Fallback to corner strategy for now
    return this.makeCornerStrategyMove();
  }
  
  /**
   * Strategy: Make a random move
   */
  private makeRandomMove(): boolean {
    const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
    const randomIndex = Math.floor(Math.random() * directions.length);
    const direction = directions[randomIndex];
    
    return this.gameService.move(direction);
  }
} 