# Scalar Game - Development Roadmap

This roadmap outlines the planned features and improvements for Scalar, a 2D side-scrolling game with dynamic size-shifting mechanics. The roadmap is organized into phases, with earlier phases being more concrete and later phases allowing for evolution based on gameplay testing and community feedback.

---

## ✅ Completed Features

### Core Gameplay Foundation
- ✅ Basic vehicle character movement and controls
- ✅ Physics-based gravity and collisions
- ✅ Camera system following the player with dynamic scaling
- ✅ Size transformation mechanics (shrink/grow)
- ✅ Multiple environments: Land and Underwater levels
- ✅ Environment-specific mechanics (submarine vertical thrust)
- ✅ Combat system with projectiles
- ✅ Enemy AI with patrol and chase behaviors
- ✅ Line of sight detection system
- ✅ Health and damage systems
- ✅ XP orb collection and magnetization
- ✅ TypeScript architecture with modular systems

---

## 🚀 Phase 1: Core Mechanics Enhancement (Near-Term)

### Vehicle Transformation System
- **Stamina/Fuel Management**
  - Implement stamina bar that depletes when transforming size
  - Add stamina regeneration over time (30-10 seconds based on level)
  - Prevent size changes when stamina is depleted
  - Add temporary slowdown effect when out of stamina
  - Display stamina bar alongside health bar in UI

- **Visual Progression**
  - Implement vehicle visual upgrades as player levels up
  - Transform from rusty, slow appearance to high-tech, sleek design
  - Add speed improvements tied to vehicle appearance upgrades
  - Create distinct visual states for different upgrade tiers

### Scale-Based World Interaction
- **Macro/Micro World Isolation**
  - Ensure micro realm is not affected by macro-sized player or enemies
  - Implement proper layer separation between size scales
  - Make micro world barely visible when player is at macro scale
  - Add transition effects between scale layers

### Level Progression System
- **XP and Leveling**
  - Enhance XP orb drop system from defeated enemies
  - Implement level-up choice system: grow OR shrink upgrade
  - Track and display player level
  - Create upgrade tree for size transformation capabilities
  - Balance XP requirements for progression

---

## 🎮 Phase 2: Content Expansion (Mid-Term)

### Main Menu System
- **Vehicle Selection**
  - Implement vehicle selection screen
  - Add three vehicle types: Tank/Car, Submarine, Plane/Air
  - Create unique starting stats for each vehicle
  - Save player's vehicle preference

- **Menu Features**
  - Add "FIND" section (glossary/dictionary for game mechanics)
  - Implement settings menu with sound controls
  - Add difficulty selection:
    - **Easy**: One-shot enemies, reduced challenge
    - **Medium**: Balanced player and enemy stats
    - **Hard**: Enemies deal more damage, move faster, reduced player stamina

### Enemy Variety & Scale-Based Spawning
- **Macro Scale Enemies** (Large/Giant)
  - Rock animals and geological creatures
  - Mythological beasts
  - Large predators (whales, sharks, eagles)
  - Giant golems and beasts (wolves, bears)

- **Normal Scale Enemies** (Default)
  - Gunners and shooters
  - Planes and aerial units
  - Security forces
  - Ground-based creatures

- **Micro Scale Enemies** (Small/Tiny)
  - Bacteria (various sizes and types)
  - Ants and small insects
  - Microscopic organisms
  - Developing fish/microbes

### Champion/Companion System
- **Base Implementation**
  - Add companion slot that follows player
  - Implement companion attack behaviors
  - Add companion stat bonuses to player

- **Tank/Car Champion: Mechanical Wolf**
  - Attacks enemies in range
  - Digs mounds of dirt/gravel periodically
  - Occasionally uncovers XP orbs or upgrade parts
  - Provides defensive support

- **Submarine Champion: Mechanical Fish**
  - Adds +speed and +oxygen/HP bonuses
  - Performs small ranged damage attacks
  - Highlights critical hit spots on enemies
  - Enhanced underwater maneuverability

- **Plane Champion: Mechanical Hawk** (Future)
  - Multiplies fire rate and agility
  - Performs dive bomb attacks for massive damage
  - Enhanced aerial combat support

---

## 🌍 Phase 3: Environment & Vehicle Expansion (Long-Term)

### Submarine Environment Enhancements
- **Deep Sea Mechanics**
  - Implement gradual downward drift mechanic
  - Add oxygen/HP system specific to underwater
  - Expand vertical exploration capabilities
  - Create depth-based difficulty scaling

- **Underwater Obstacles & Navigation**
  - Add kelp forests that slow movement
  - Implement cave systems for micro-scale exploration
  - Create underwater currents affecting movement
  - Add submarine-specific hazards

### Tank/Car Land Environment
- **Scale-Based Terrain**
  - Massive dirt and gravel mountains when small (micro scale)
  - Smooth terrain easily traversable when large
  - Implement climbable surfaces for small scale
  - Add destructible terrain elements

- **Ramming Mechanic**
  - Allow driving through enemies
  - Deal damage to both player and enemy
  - Add momentum-based damage calculation
  - Create risk/reward for aggressive driving

### Plane/Air Environment (New)
- **Flight Mechanics**
  - Full X and Y directional movement
  - Cloud-filled skybox with rare land sightings
  - Wind gust system affecting movement
  - Fuel depletion causing stall and drift

- **Aerial Combat**
  - Dragonfly-like bugs at micro scale
  - Eagles and large birds at normal scale
  - Mythological flying creatures at macro scale (dragons, phoenixes)
  - Aerial boss encounters

- **Fuel Management**
  - Fuel depletion over time
  - Stall mechanic when out of fuel
  - Wind carries stalled plane short distance
  - Fuel regeneration tied to stamina system

---

## ⚙️ Phase 4: Systems & Polish (Future)

### Advanced Combat Systems
- **Critical Hit System**
  - Implement weak point detection
  - Add critical hit damage multipliers
  - Visual feedback for critical strikes
  - Champion abilities to highlight weak points

### Visual & Audio Enhancements
- **Sound Design**
  - Background music for each environment
  - Sound effects for weapons and transformations
  - Enemy-specific audio
  - Ambient environmental sounds
  - Volume controls in settings

- **Visual Effects**
  - Particle effects for size transformations
  - Combat impact effects
  - Environmental particle systems (dust, bubbles, clouds)
  - Screen shake and camera effects
  - Lighting and atmospheric effects

### User Interface Improvements
- **HUD Enhancements**
  - Minimap showing nearby enemies and objectives
  - Better health and stamina bar styling
  - Level and XP progress display
  - Active companion status indicator
  - Environment and scale indicators

- **Progression Feedback**
  - Level-up animations and notifications
  - Upgrade selection screen
  - Stats comparison UI
  - Achievement unlocks

---

## 🎯 Phase 5: Advanced Features (Aspirational)

### Procedural Generation & Replayability
- **Dynamic World Generation**
  - Procedurally generated terrain segments
  - Randomized enemy spawns
  - Variable difficulty scaling
  - Unique runs with different layouts

### Boss Battles
- **Scale-Specific Bosses**
  - Macro bosses with massive health pools
  - Micro bosses with swarm mechanics
  - Multi-phase boss fights
  - Unique boss abilities per environment

### Progression & Unlocks
- **Meta-Progression**
  - Persistent upgrades between runs
  - Unlockable vehicles and champions
  - Collectible parts for customization
  - Achievement system

### Multiplayer Considerations (Exploration)
- **Cooperative Elements** (Potential)
  - Shared world exploration
  - Team-based size puzzles
  - Combined champion abilities
  - Competitive leaderboards

---

## 🔧 Technical Improvements (Ongoing)

### Code Architecture
- Continued TypeScript type safety improvements
- Performance optimization for large-scale battles
- Better state management for complex interactions
- Improved asset loading and management

### Testing & Quality
- Implement automated testing for core mechanics
- Balance testing across difficulty modes
- Cross-browser compatibility verification
- Mobile control exploration

### Documentation
- Expand developer documentation
- Create modding guidelines
- Maintain updated CHANGELOG
- Community contribution guidelines

---

## 📝 Notes

- **Flexibility**: This roadmap is subject to change based on playtesting, technical constraints, and community feedback
- **Prioritization**: Earlier phases are more concrete, later phases allow for creative evolution
- **Iteration**: Features may be refined, combined, or reprioritized as development progresses
- **Community**: We welcome feedback and suggestions for improving the game experience

---

**Last Updated**: January 2026

For current development status, see the [README.md](README.md) file.
For contribution guidelines, check the repository's contribution documentation.
