import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ScoreService } from '../../services/score.service';
import { ScoreEntry } from '../../models/score-entry.model';

@Component({
  selector: 'app-high-scores',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule
  ],
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss']
})
export class HighScoresComponent implements OnInit {
  scores4x4: ScoreEntry[] = [];
  scores5x5: ScoreEntry[] = [];
  scores6x6: ScoreEntry[] = [];
  
  displayedColumns: string[] = ['rank', 'score', 'maxTile', 'date', 'duration'];
  
  constructor(
    private router: Router,
    private scoreService: ScoreService
  ) {}
  
  ngOnInit(): void {
    this.loadScores();
  }
  
  /**
   * Load scores for each grid size
   */
  loadScores(): void {
    this.scores4x4 = this.scoreService.getScoresByGridSize(4);
    this.scores5x5 = this.scoreService.getScoresByGridSize(5);
    this.scores6x6 = this.scoreService.getScoresByGridSize(6);
  }
  
  /**
   * Format the date string to a readable format
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  /**
   * Format the duration in seconds to MM:SS
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Navigate back to the main menu
   */
  backToMenu(): void {
    this.router.navigate(['/']);
  }
  
  /**
   * Clear all scores (with confirmation)
   */
  clearScores(): void {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
      this.scoreService.clearScores();
      this.loadScores();
    }
  }
} 