import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { Router } from '@angular/router';
import { ThemeService, ThemeType } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // Settings
  defaultGridSize = 4;
  theme: ThemeType = 'light';
  animationSpeed = 100; // 0-200 where 100 is normal
  undoEnabled = true;
  
  // UI selection options
  availableGridSizes = [4, 5, 6];
  availableThemes: { value: ThemeType, label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'colorful', label: 'Colorful' }
  ];
  
  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}
  
  ngOnInit(): void {
    this.loadSettings();
  }
  
  /**
   * Load saved settings from localStorage
   */
  loadSettings(): void {
    // Load default grid size
    const savedGridSize = localStorage.getItem('2048-grid-size');
    if (savedGridSize) {
      this.defaultGridSize = parseInt(savedGridSize);
    }
    
    // Load theme
    this.theme = this.themeService.getCurrentTheme();
    
    // Load animation speed
    const savedAnimationSpeed = localStorage.getItem('2048-animation-speed');
    if (savedAnimationSpeed) {
      this.animationSpeed = parseInt(savedAnimationSpeed);
    }
    
    // Load undo setting
    const savedUndoEnabled = localStorage.getItem('2048-undo-enabled');
    if (savedUndoEnabled !== null) {
      this.undoEnabled = savedUndoEnabled === 'true';
    }
  }
  
  /**
   * Save current settings to localStorage
   */
  saveSettings(): void {
    // Save default grid size
    localStorage.setItem('2048-grid-size', this.defaultGridSize.toString());
    
    // Save theme
    this.themeService.setTheme(this.theme);
    
    // Save animation speed
    localStorage.setItem('2048-animation-speed', this.animationSpeed.toString());
    
    // Apply animation speed to CSS variables
    document.documentElement.style.setProperty(
      '--animation-speed-factor', 
      (this.animationSpeed / 100).toString()
    );
    
    // Save undo setting
    localStorage.setItem('2048-undo-enabled', this.undoEnabled.toString());
  }
  
  /**
   * Change the current theme
   */
  changeTheme(theme: ThemeType): void {
    this.theme = theme;
    this.themeService.setTheme(theme);
  }
  
  /**
   * Save settings and return to the main menu
   */
  saveAndReturn(): void {
    this.saveSettings();
    this.router.navigate(['/']);
  }
  
  /**
   * Cancel changes and return to main menu
   */
  cancel(): void {
    this.router.navigate(['/']);
  }
  
  /**
   * Reset settings to defaults
   */
  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.defaultGridSize = 4;
      this.theme = 'light';
      this.animationSpeed = 100;
      this.undoEnabled = true;
      
      this.saveSettings();
    }
  }
} 