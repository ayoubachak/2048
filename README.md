# 2048 Game

A modern, responsive implementation of the classic 2048 game built with Angular. This game features multiple grid sizes, theme customization, and persistence of high scores.

## Features

- **Classic 2048 Gameplay**: Merge tiles with the same number to get to 2048
- **Multiple Grid Sizes**: Play on 4×4 (classic), 5×5 (challenge), or 6×6 (expert) grids
- **Theme Support**: Switch between Light, Dark, and Colorful themes
- **Score Tracking**: View and sort high scores for each grid size
- **Responsive Design**: Play seamlessly on desktop or mobile devices
- **Touch Support**: Swipe to move tiles on touch devices
- **Customization**: Adjust animation speed and game settings
- **Undo Functionality**: Revert your last move

## Demo

The game is deployed on GitHub Pages at: https://ayoubachak.github.io/2048/

## Technologies Used

- Angular 18.2
- Angular Material
- RxJS
- SCSS for styling
- TypeScript

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/ayoubachak/2048.git
   cd 2048
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:4200/`

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/game-2048/browser` directory.

## Deploying to GitHub Pages

The project is configured for easy deployment to GitHub Pages:

1. Make sure your code is committed and pushed to your GitHub repository.
2. Run the following command:
   ```bash
   npm run github-pages
   ```

This will:
1. Build the application in production mode with the correct base href
2. Deploy the build to GitHub Pages

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── game-board/      # Main game grid component
│   │   ├── high-scores/     # High scores display
│   │   ├── main-menu/       # Game menu
│   │   └── settings/        # Game settings
│   ├── models/
│   │   ├── tile.model.ts    # Tile interface
│   │   └── score-entry.model.ts # Score entry interface
│   ├── services/
│   │   ├── game.service.ts  # Game logic
│   │   ├── score.service.ts # Score persistence
│   │   └── theme.service.ts # Theme management
│   ├── app.component.ts     # Root component
│   ├── app.routes.ts        # Application routing
│   └── app.config.ts        # App configuration
├── assets/                  # Static assets
└── styles.scss              # Global styles and theme variables
```

## Customization

### Themes

The application comes with three built-in themes:
- **Light**: Classic, light background theme
- **Dark**: Dark mode for low-light environments
- **Colorful**: Vibrant, colorful theme

Themes are implemented using CSS variables and can be easily extended or modified in `styles.scss`.

### Grid Sizes

The game supports three grid sizes:
- **4×4**: Classic difficulty
- **5×5**: Higher difficulty
- **6×6**: Extreme difficulty

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Angular team for the excellent framework
