import { Routes } from '@angular/router';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';

export const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'game', component: GameBoardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'high-scores', component: HighScoresComponent },
  { path: '**', redirectTo: '' }
];
