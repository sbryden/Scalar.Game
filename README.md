# Vehicle Side Scroller

A fun, interactive side-scrolling game built with **Phaser 3** and powered by **Vite**. Control a vehicle, navigate platforms, and experience dynamic gravity-based gameplay.

## Overview

This is a classic 2D side-scroller game where you control a vehicle navigating through a world of platforms. Jump, move left and right, and explore the expanding game world. The camera follows your vehicle, revealing new areas as you progress.

## Features

✨ **Core Gameplay**
- Smooth character movement and jumping
- Physics-based gravity and collisions
- Responsive camera system that follows the player
- Static platforms for navigation

⚙️ **Technical Stack**
- Phaser 3 game framework
- Vite build tool for fast development
- ES6+ JavaScript
- Arcade physics engine

## Quick Start

### Installation
```bash
npm install
```

### Play the Game
```bash
npm run dev
```

Open your browser to the URL shown in your terminal (typically `http://localhost:5173`)

## How to Play

Use the **arrow keys** to move left and right, and **spacebar** to jump. Navigate across platforms and avoid falling off the world!

- ⬅️ **Left Arrow** - Move left
- ➡️ **Right Arrow** - Move right
- **Space** - Jump

## Project Layout

```
├── index.html              # HTML entry point
├── style.css               # Game styling
├── vite.config.js          # Vite build configuration
├── package.json            # Dependencies and scripts
└── src/
    └── game.js             # Game logic and scenes
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Technologies

- **Phaser 3** - Powerful 2D game framework
- **Vite** - Next-generation build tool
- **Arcade Physics** - Built-in physics engine

## Future Roadmap

This project is set up as a foundation for adding:
- Vehicle transformation mechanics (shrinking/growing)
- Dynamic obstacles and enemies
- Collectible items and power-ups
- Score and progression system
- Multiple levels and worlds
- Sound effects and music

## Contributing

Feel free to modify and extend the game! The codebase is clean and well-structured, making it easy to add new features.

## License

Open source - use freely for learning and development

## Support

For issues or questions, check the [INSTRUCTIONS.md](INSTRUCTIONS.md) file for detailed setup and troubleshooting guidance.
