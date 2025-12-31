# Scalar

A fun, interactive side-scrolling game built with **Phaser 3** and powered by **Vite**. Control a character with size-shifting abilities, navigate platforms, and experience dynamic gravity-based gameplay.

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
- TypeScript for type safety and better architecture
- Vite build tool for fast development
- Arcade physics engine
- Modular architecture with managers and systems

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

Control your character to navigate platforms, defeat enemies, and progress through the game!

**Movement & Jumping:**
- ⬅️ **Left Arrow / A** - Move left
- ➡️ **Right Arrow / D** - Move right
- **Space** - Jump

**Size Mechanics:**
- **Q** - Shrink
- **E** - Grow

**Combat:**
- **F** - Shoot projectiles

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## Deployment

This project is configured for automatic deployment to GitHub Pages:

1. Push changes to the `main` or `master` branch
2. GitHub Actions will automatically build and deploy to `https://sbryden.github.io/Scalar.Game/`
3. The `.github/workflows/gh-pages.yml` handles the deployment process

**Local Preview:**
After building, test the production build locally:
```bash
npm run build
npm run preview
```
Visit `http://localhost:4173/Scalar.Game/` to preview.

## Technologies

- **Phaser 3** - Powerful 2D game framework
- **TypeScript** - Type-safe development with improved tooling
- **Vite** - Next-generation build tool with HMR
- **Arcade Physics** - Built-in physics engine

## Future Roadmap

This project is set up as a foundation for adding:
- Enhanced vehicle transformation mechanics
- Minimap
- Dynamic obstacles and enemies
- Collectible items and power-ups
- Score and progression system
- Multiple levels and worlds
- Sound effects and music
