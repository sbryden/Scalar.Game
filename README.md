# Scalar

A fun, interactive side-scrolling game built with **Phaser 3** and powered by **Vite**. Control a character with size-shifting abilities, navigate platforms, and experience dynamic gravity-based gameplay.

## Overview

Scalar is a classic 2D side-scroller where you control a vehicle navigating through diverse environments. With dynamic size-shifting mechanics, physics-based combat, and intelligent enemy AI, experience evolving gameplay as you explore land and underwater worlds. Enemies patrol their territories but will aggressively chase you when provoked!

## Features

✨ **Core Gameplay**
- Smooth character movement and jumping
- Physics-based gravity and collisions
- Responsive camera system that follows the player
- Static platforms for navigation
- **Multiple environments**: Land and Underwater levels
- **Environment-specific mechanics**: Submarine controls with vertical thrust in water
- **Enemy AI with Chase System**: Enemies patrol areas but will chase and attack when player enters their line of sight
- **Combat System**: Shoot projectiles to damage enemies and trigger chase behavior

⚙️ **Technical Stack**
- Phaser 3 game framework
- TypeScript for type safety and better architecture
- Vite build tool for fast development
- Arcade physics engine
- Modular architecture with managers and systems

🌊 **Underwater Level**
- Lighter gravity physics for underwater feel
- Submarine-style controls with vertical thrust (W/S or Up/Down for depth control)
- Swimming fish enemies (80%) that float freely
- Ground-based crab enemies (20%) that walk and jump
- Slower projectile speed underwater
- XP orbs float instead of falling
- Microscopic plankton level when shrinking
- Blue ocean background with kelp and coral decorations

🤖 **Enemy AI & Chase System**
- Enemies patrol their designated areas by default
- **Detection Triggers**: Enemies become aggressive when:
  - Hit by a projectile
  - Player enters their line of sight (detection range)
  - Direct collision with player
- **Line of Sight Calculation**:
  - Based on larger of enemy width and height
  - Minimum detection distance for small enemies (100 pixels)
  - Bosses have enhanced line of sight (60% of screen width)
- **Intelligent Pathfinding**: Detected enemies chase the player at 1.5× speed
- **Physics-Aware Movement**:
  - Swimming enemies (fish, micro, plankton) move freely in 2D space
  - Ground enemies (crab, generic) run horizontally and jump intelligently to reach player
- **Combat Feedback**: Visual indicators (color flashes, health bars) and camera shake effects

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

**Environment Selection:**
- Choose between **Land** and **Water** environments in the main menu
- Air environment coming soon!

**Movement & Controls:**

*Land Mode:*
- ⬅️ **Left Arrow / A** - Move left
- ➡️ **Right Arrow / D** - Move right
- **Space** - Jump

*Underwater Mode (Submarine):*
- ⬅️ **Left Arrow / A** - Move left
- ➡️ **Right Arrow / D** - Move right
- **W / Up Arrow / Space** - Thrust upward
- **S / Down Arrow** - Thrust downward

**Size Mechanics:**
- **Q** - Shrink (transitions between regular ↔ micro levels)
- **E** - Grow (transitions between regular ↔ micro/large levels)
- Note: Underwater only allows regular and micro sizes (no large)

**Combat:**
- **F** - Shoot projectiles (slower underwater)
- Hitting enemies with projectiles triggers chase behavior
- Enemies will chase and attack when detected

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

This project continues to evolve with planned features:
- ✅ Enemy chase system with line of sight detection (completed)
- ✅ TypeScript typing improvements (completed)
- Enhanced vehicle transformation mechanics
- Minimap
- More enemy types and boss battles
- Collectible items and power-ups
- Enhanced score and progression system
- Multiple levels and worlds
- Sound effects and music
- Particle effects and visual polish
