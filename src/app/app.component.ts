import { Component, OnInit, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '2048 Game';
  
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme from localStorage
    // Theme service will handle loading and applying the theme
    
    // Set up base href dynamically for GitHub Pages
    if (!isDevMode()) {
      this.setupForGithubPages();
    }
  }
  
  /**
   * Set up the app for GitHub Pages deployment
   */
  private setupForGithubPages() {
    // For GitHub Pages, make sure localStorage has the correct prefix
    try {
      // Test localStorage access
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      
      // Set app prefix for localStorage
      const repoName = window.location.pathname.split('/')[1] || '2048-game';
      if (!localStorage.getItem(`${repoName}-initialized`)) {
        localStorage.setItem(`${repoName}-initialized`, 'true');
        console.log(`GitHub Pages environment detected. Using ${repoName} as storage prefix.`);
      }
    } catch (e) {
      console.warn('LocalStorage not available, game progress won\'t be saved');
    }
  }
}
