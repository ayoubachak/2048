import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeType = 'light' | 'dark' | 'colorful';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'game-2048-theme';
  private themeSubject = new BehaviorSubject<ThemeType>('light');
  public theme$: Observable<ThemeType> = this.themeSubject.asObservable();

  constructor() {
    this.loadSavedTheme();
  }

  /**
   * Load the saved theme from localStorage
   */
  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeType;
      if (savedTheme && ['light', 'dark', 'colorful'].includes(savedTheme)) {
        this.themeSubject.next(savedTheme);
        this.applyTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
  }

  /**
   * Set the current theme
   */
  setTheme(theme: ThemeType): void {
    this.themeSubject.next(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  /**
   * Save the theme to localStorage
   */
  private saveTheme(theme: ThemeType): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(theme: ThemeType): void {
    // Remove any existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme', 'colorful-theme');
    
    // Add the new theme class
    document.body.classList.add(`${theme}-theme`);
    
    // Set the color-scheme for system UI elements
    document.documentElement.style.setProperty(
      'color-scheme', 
      theme === 'dark' ? 'dark' : 'light'
    );
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): ThemeType {
    return this.themeSubject.value;
  }
} 