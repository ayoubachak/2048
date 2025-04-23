import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService, ThemeType } from '../../services/theme.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {
  selectedGridSize = 4;
  availableGridSizes = [4, 5, 6];
  currentTheme: ThemeType;
  
  // Custom grid size properties
  customGridSize = 7;
  showCustomSize = false;
  showCustomSizeInput = false;
  
  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentTheme = this.themeService.getCurrentTheme();
  }
  
  /**
   * Start a new game with the selected grid size
   */
  startNewGame(): void {
    // Store selected grid size in localStorage
    localStorage.setItem('game-2048-grid-size', this.selectedGridSize.toString());
    
    // Navigate to the game board
    this.router.navigate(['/game'], { queryParams: { size: this.selectedGridSize } });
  }
  
  /**
   * Start a new game with AI player
   */
  startAIGame(): void {
    // Store selected grid size in localStorage
    localStorage.setItem('game-2048-grid-size', this.selectedGridSize.toString());
    
    // Navigate to the game board with AI enabled
    this.router.navigate(['/game'], { 
      queryParams: { 
        size: this.selectedGridSize,
        ai: 'true' 
      } 
    });
  }
  
  /**
   * Toggle custom size input display
   */
  toggleCustomSizeInput(): void {
    this.showCustomSizeInput = !this.showCustomSizeInput;
    if (this.showCustomSizeInput) {
      this.updateCustomSize();
    }
  }
  
  /**
   * Update the custom grid size
   */
  updateCustomSize(): void {
    // Ensure the custom size is within bounds
    this.customGridSize = Math.min(Math.max(this.customGridSize, 3), 8);
    this.showCustomSize = true;
    this.selectedGridSize = this.customGridSize;
  }
  
  /**
   * Open the settings page
   */
  openSettings(): void {
    this.router.navigate(['/settings']);
  }
  
  /**
   * Open the high scores page
   */
  viewHighScores(): void {
    this.router.navigate(['/high-scores']);
  }
  
  /**
   * Switch to next theme
   */
  cycleTheme(): void {
    const themes: ThemeType[] = ['light', 'dark', 'colorful'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.currentTheme = themes[nextIndex];
    this.themeService.setTheme(this.currentTheme);
  }
} 