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
- **Multiple environments**: Land and Underwater levels
- **Environment-specific mechanics**: Submarine controls with vertical thrust in water

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

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

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
