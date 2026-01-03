# Scalar

A 2D side-scrolling action game built with **Phaser 3** and **TypeScript**. Master dynamic size-shifting mechanics to battle scale-specific enemies across land and underwater environments!

## Overview

Scalar is a physics-based side-scroller where you control a vehicle with the unique ability to shrink and grow. Navigate through two distinct biomes (Land and Underwater), each with normal and micro scale variants. Face off against intelligent enemies that patrol, chase, and attack using line-of-sight detection. Progress through map levels, defeat bosses, collect XP orbs, and level up your character in this evolving adventure!

## ✨ Key Features

### 🎮 **Core Gameplay**
- **Size-Shifting Mechanics**: Shrink and grow between normal and micro scales (Q/E keys)
- **Two Complete Biomes**: 
  - 🌳 **Land Environment** with jumping mechanics
  - 🌊 **Underwater Environment** with submarine-style vertical thrust controls
- **4 Unique Scenes**: Each biome has normal and micro scale variants with distinct enemies
- **Melee Combat System**: Hold Shift for close-range attacks with stamina management
- **Projectile Combat**: Shoot enemies with F key (slower projectiles underwater)
- **Smooth Physics**: Arcade physics with environment-specific gravity

### 🤖 **Intelligent Enemy AI**
- **Patrol Behavior**: Enemies guard their territories by default
- **Chase System**: Enemies detect and pursue players when:
  - Hit by a projectile
  - Player enters line of sight
  - Direct collision occurs
- **Smart Pathfinding**: Swimming enemies move in 2D space, ground enemies jump intelligently
- **7 Boss Types**: Enhanced bosses with special abilities:
  - Spawner bosses that summon minions
  - Shark boss with ranged torpedo attacks
  - Scale-specific variants for land, water, and micro environments

### 📊 **Progression Systems**
- **Player Leveling**: Collect XP orbs dropped by enemies to level up
- **Map Levels**: Progressive difficulty scaling across multiple map levels
- **Difficulty Modes**: Normal, Hard, and God Mode with enemy stat multipliers
- **Boss Mode**: Toggle for boss-heavy gameplay
- **Stats Tracking**: Detailed end-of-level statistics and score calculation

### 💪 **Combat & Feedback**
- **Stamina System**: Manage stamina for melee attacks (recharges over time)
- **Visual Feedback**: Camera shake, enemy color flashes, health bars
- **Magnetization**: XP orbs automatically pulled toward player
- **Dynamic HUD**: Real-time health, XP, stamina, player level, and map level display

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

## 🎯 How to Play

### Getting Started
1. **Select Your Biome**: Choose between Land or Water environment
2. **Choose Difficulty**: Normal, Hard, or God Mode
3. **Toggle Boss Mode**: Enable for boss-heavy gameplay (optional)
4. **Start Playing**: Battle enemies, collect XP, and progress through map levels!

### Controls

**Movement Controls:**

*Land Environment:*
- ⬅️ **A / Left Arrow** - Move left
- ➡️ **D / Right Arrow** - Move right  
- **Space** - Jump

*Underwater Environment (Submarine):*
- ⬅️ **A / Left Arrow** - Move left
- ➡️ **D / Right Arrow** - Move right
- **W / Up Arrow / Space** - Thrust upward
- **S / Down Arrow** - Thrust downward (sink slower)

**Combat Controls:**
- **F** - Shoot projectiles (ranged attack)
- **Shift** - Melee mode (hold for close-range combat, consumes stamina)

**Size Transformation:**
- **Q** - Shrink (normal → micro scale)
- **E** - Grow (micro → normal scale)
- *Note: Future updates will add macro (large) scale for 3-tier system*

### Gameplay Tips
- 💡 Collect glowing XP orbs to level up your character
- 💡 Manage your stamina - melee attacks drain it, it recharges over time
- 💡 Enemies chase when they spot you - use size changes strategically
- 💡 Underwater physics differ - lighter gravity and slower projectiles
- 💡 Each scale has different enemies - shrink to face bacteria, stay normal for bigger threats
- 💡 Boss enemies have enhanced detection range and special abilities
- 💡 Check your stats at level complete screen to track progress

## ⚙️ Technical Stack

- **Phaser 3** - Powerful 2D game framework
- **TypeScript** - Type-safe development with improved tooling
- **Vite** - Next-generation build tool with HMR
- **Arcade Physics** - Built-in physics engine for collisions and movement
- **Modular Architecture** - Organized managers and systems for maintainability

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally

## 🌐 Deployment

This project auto-deploys to GitHub Pages:
- Push to `main` or `master` branch
- GitHub Actions builds and deploys automatically
- Live at: `https://sbryden.github.io/Scalar.Game/`

## 🗺️ What's Next?

Check out our [ROADMAP.md](ROADMAP.md) for planned features including:
- **Macro Scale**: Third scale tier with giant enemies
- **Air Biome**: Complete flying environment with wind mechanics
- **Champion Companions**: AI buddies that fight alongside you
- **High Score System**: Local and cloud-based leaderboards
- **Enhanced Audio**: Music and sound effects for all biomes
- And much more!

## 🤝 Contributing

We welcome contributions! Check the [ROADMAP.md](ROADMAP.md) for areas that need work.

## 📄 License

This project is open source. Check repository for license details.

---

Made with passion using Phaser 3 and TypeScript
