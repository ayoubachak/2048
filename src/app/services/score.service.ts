import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScoreEntry } from '../models/score-entry.model';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY = '2048-high-scores';
  private scoresSubject = new BehaviorSubject<ScoreEntry[]>([]);
  public scores$: Observable<ScoreEntry[]> = this.scoresSubject.asObservable();

  constructor() {
    this.loadScores();
  }

  /**
   * Load scores from localStorage
   */
  private loadScores(): void {
    try {
      const storedScores = localStorage.getItem(this.STORAGE_KEY);
      const scores = storedScores ? JSON.parse(storedScores) : [];
      this.scoresSubject.next(scores);
    } catch (error) {
      console.error('Error loading scores from localStorage:', error);
      this.scoresSubject.next([]);
    }
  }

  /**
   * Save scores to localStorage
   */
  private saveScores(scores: ScoreEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
      this.scoresSubject.next(scores);
    } catch (error) {
      console.error('Error saving scores to localStorage:', error);
    }
  }

  /**
   * Add a new score entry
   */
  addScore(entry: ScoreEntry): void {
    const currentScores = [...this.scoresSubject.value];
    
    // Add new entry
    currentScores.push(entry);
    
    // Sort by score (highest first)
    const sortedScores = currentScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores per grid size
    const resultScores: ScoreEntry[] = [];
    const scoresByGridSize: { [gridSize: number]: ScoreEntry[] } = {};
    
    // Group by grid size
    for (const score of sortedScores) {
      const gridSize = score.gridSize;
      if (!scoresByGridSize[gridSize]) {
        scoresByGridSize[gridSize] = [];
      }
      
      if (scoresByGridSize[gridSize].length < 10) {
        scoresByGridSize[gridSize].push(score);
      }
    }
    
    // Flatten the grouped scores
    for (const gridSizeScores of Object.values(scoresByGridSize)) {
      resultScores.push(...gridSizeScores);
    }
    
    this.saveScores(resultScores);
  }

  /**
   * Get all score entries
   */
  getScores(): ScoreEntry[] {
    return this.scoresSubject.value;
  }

  /**
   * Get top scores for specific grid size
   */
  getScoresByGridSize(gridSize: number): ScoreEntry[] {
    return this.scoresSubject.value
      .filter(entry => entry.gridSize === gridSize)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Clear all scores
   */
  clearScores(): void {
    this.saveScores([]);
  }
} 