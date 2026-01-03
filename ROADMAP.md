# Scalar Game - Development Roadmap

This roadmap outlines the future development for Scalar. For current features and implementation status, see [README.md](README.md).

The roadmap is organized by feature area rather than timeline, allowing for flexible prioritization based on gameplay testing and community feedback.

---

## 🎯 Core Mechanics Enhancements

### Fuel System for Size Transformations
**Priority: High**
- Implement separate fuel system (distinct from stamina which is for melee)
- 20-second cooldown for size transformations to start
- Fuel regenerates over time (faster at higher levels)
- Visual fuel bar in HUD
- Prevent size changes when fuel depleted
- Add warning indicators when fuel is low

### 3-Tier Scale System (Macro Scale)
**Priority: High**
- Add macro (large) scale to existing micro/normal scales
- Progressive scaling: micro → normal → macro (E key advances, Q key reverses)
- Create 2 new scenes per biome:
  - MainGameMacroScene (land, macro scale)
  - UnderwaterMacroScene (water, macro scale)
- Macro-scale enemies:
  - Land: Giant golems, rock animals, massive wolves/bears
  - Water: Whales, giant sharks, mythological sea creatures
- Camera scaling adjustments for macro perspective
- Visual continuity: use prior scale's ground texture as background
- Ant-Man style transition animations (player shrinks, enemies appear to grow)

### Vehicle Visual Progression
**Priority: Medium**
- Vehicle sprite variations based on player level
- Start rusty and slow, evolve to high-tech and sleek
- Visual upgrades at level milestones (5, 10, 15, 20, etc.)
- Tie speed improvements to visual upgrades
- Particle effects during transformation animations
- Distinct visual states per upgrade tier

### Ramming/Melee Enhancements
**Priority: High** (Core mechanic mostly implemented, needs polish)
- Add vehicle-specific ramming abilities
- Enhanced visual feedback for collision damage
- Fine-tune damage balance
- Momentum-based damage calculation
- Better risk/reward mechanics
- Polish melee mode visual effects

---

## 🗺️ New Biome: Air Environment

### Air Biome Foundation
**Priority: High** - Major feature with multiple sub-features
- Create 3 new scenes:
  - AirScene (normal scale)
  - AirMicroScene (micro scale)  
  - AirMacroScene (macro scale)
- Full X and Y directional movement (true flight)
- Cloud-filled skybox with parallax layers
- Rare glimpses of land (only at start)
- Wind gust system affecting movement
- Altitude-based physics
- Fuel stall mechanic (plane drifts on wind when fuel depleted)

### Air Enemies
- **Micro Scale**: Dragonfly-like bugs, small flying insects
- **Normal Scale**: Eagles, hawks, large birds
- **Macro Scale**: Dragons, phoenixes, wyverns, mythological flying creatures
- Aerial boss encounters with dogfight mechanics
- Vertical combat dynamics

### Air Environment Challenges
- Wind current navigation
- Altitude management
- Fuel management specific to air biome
- Aerial obstacle courses through clouds
- Dive and climb mechanics

---

## 🤖 Companion System (Champions)

### Base Champion System
**Priority: Medium**
- Champions are AI companions that fight alongside player
- Biome-specific (can't use water champion on land)
- Only one champion active at a time
- Champion AI: follow player, auto-attack enemies
- Champion health and revival mechanics
- Selection system (details to be determined: at start, unlocked, or collected)

### Land Champion: Mechanical Wolf
- Wolf sprite and animations
- Melee attack behavior
- Digging mechanic: periodically digs mounds of dirt/gravel
- Occasionally uncovers XP orbs or upgrade parts
- Defensive support abilities
- Howl ability to stun nearby enemies

### Water Champion: Mechanical Fish
- Mechanical fish sprite and animations
- Stat bonuses: +speed, +oxygen/HP
- Ranged attack behavior underwater
- Highlights enemy weak points (critical hit system integration)
- Enhanced maneuverability bonus in water
- School mechanic: creates duplicate decoys

### Air Champion: Mechanical Hawk
- Hawk sprite and aerial animations
- Fire rate multiplier passive ability
- Agility bonus for player
- Dive bomb attack (massive damage on cooldown)
- Scout ability: reveals nearby enemies
- Wind riding: reduces fuel consumption

---

## 🎮 Menu & Settings Enhancements

### Difficulty System Overhaul
**Priority: Medium**
- Add Easy and Brutal difficulty modes (currently only Normal/Hard/God Mode)
- Rebalance Normal and Hard (currently too difficult)
- Enemy density as key difficulty factor
- Difficulty-specific stat multipliers:
  - Easy: One-shot most enemies, player advantages
  - Normal: Balanced gameplay
  - Hard: Fewer resources, tougher enemies
  - Brutal: Extreme challenge, high risk/high reward
- Hide/remove God Mode in production (keep for debugging)

### Menu System Additions
- **FIND Section**: Glossary/dictionary explaining game mechanics
- **Settings Menu**: 
  - Sound effects volume control
  - Music volume control
  - Key binding customization
  - Graphics quality settings
- **Stats Screen**: View overall player statistics
- **Tutorial System**: Optional tutorial for new players

---

## 🏆 Progression & Meta-Game

### High Score System
**Priority: Medium**
- **Phase 1 - Local Storage**:
  - Browser localStorage for high scores
  - Track per difficulty and biome
  - Display personal best on menu
  - High score table in level complete screen
  - Score breakdown by category
- **Phase 2 - Cloud Integration**:
  - Cloud-based storage
  - Global leaderboards
  - Friends leaderboards
  - Cross-device persistence
  - Social features

### Level Progression Choice System
**Priority: Low** (Far future, rough concept)
- Branching upgrade choices at level-up
- "Grow path" vs "Shrink path" specializations
- Upgrade tree UI
- Persistent build tracking
- Alternative: health/speed/damage upgrades
- Requires significant design work

### Meta-Progression
**Priority: Low**
- Persistent upgrades between runs
- Unlockable vehicles and champions
- Collectible vehicle parts for customization
- Achievement system with rewards
- Overall stat tracking across all sessions
- Daily/weekly challenges

---

## 💎 Content Expansion

### Enemy Variety
**Normal Scale:**
- Gunners with ranged attacks
- Flying enemies for land biome
- Security robots with varied attack patterns
- Elemental-themed enemies

**Micro Scale:**
- Ants and small insects for land
- Various microorganism types
- Cell-like enemies with division mechanics
- Parasites that latch onto player

**Macro Scale:**
- All new enemy types for macro tier
- Scale-appropriate behaviors
- Massive hitboxes and health pools

### Boss Battle Enhancements
- Multi-phase boss transformations
- Boss-specific arena mechanics  
- Unique abilities per environment
- Memorable attack patterns
- Environmental interaction in boss fights
- Mid-boss encounters

### Environmental Features
**Land Enhancements:**
- Massive dirt/gravel mountains at micro scale
- Climbable surfaces when small
- Destructible terrain
- Interactive environmental objects
- Weather effects

**Water Enhancements:**
- Interactive kelp forests (slow movement)
- Cave systems for micro exploration
- Underwater currents
- Depth-based pressure/darkness
- Oxygen bubble collection
- Submarine-specific hazards

---

## 🎨 Polish & Quality of Life

### Visual Effects
- Enhanced particle effects for size transformations
- Combat impact effects
- Environmental particles (dust, bubbles, clouds)
- Improved screen shake and camera effects
- Lighting and atmospheric effects
- Weather systems per biome
- Trail effects for projectiles

### Audio System
**Priority: Medium**
- Background music for each biome
- Dynamic music (combat vs exploration)
- Sound effects for weapons and transformations
- Enemy-specific audio
- Ambient environmental sounds
- Footstep/movement sounds
- UI sound effects

### UI/UX Improvements
- Minimap showing nearby enemies and objectives
- Enhanced health/stamina/fuel bar styling with animations
- Damage numbers floating from enemies
- Combo counter
- Active champion status indicator
- Environment and scale indicators
- Better level-up notifications
- Upgrade selection screen
- Smooth transitions between screens

### Critical Hit System
- Implement weak point detection
- Critical damage multipliers
- Visual feedback for crits
- Champion abilities to highlight weak points
- Enemy-specific vulnerable zones

---

## 🌍 Advanced Features

### Procedural Generation
**Priority: Low**
- Procedurally generated terrain layouts
- Randomized platform configurations
- Biome variety within environments
- Seed-based generation for sharing
- Challenge modifiers and mutators
- Roguelike mode option

### World Design
- Multiple distinct levels per biome
- Themed zones within biomes
- Secret areas and hidden paths
- Environmental storytelling
- Boss arenas
- Safe zones/checkpoints

### Multiplayer (Exploration Phase)
**Priority: Very Low** - Conceptual only
- Co-op possibilities:
  - Shared world exploration
  - One player micro, one macro (size puzzles)
  - Combined champion abilities
  - Boss raid encounters
- Competitive modes:
  - Time trials
  - Score attack
  - PvP arena
  - Global leaderboards

---

## 🔧 Technical Improvements

### Performance Optimization
- Large-scale battle optimization
- Asset loading improvements
- Memory management
- Sprite pooling
- Efficient collision detection

### Code Quality
- Expanded TypeScript typing
- Better state management
- Improved error handling
- Code documentation
- Unit tests for core mechanics

### Testing & Balance
- Automated testing framework
- Balance testing across difficulties
- Cross-browser compatibility
- Mobile control exploration (potential)
- Playtesting feedback integration

---

## 📝 Notes

- **Flexibility**: Priorities may shift based on playtesting and feedback
- **Iteration**: Features may be refined or combined during development  
- **Community**: Player feedback will influence feature prioritization
- **Scope**: Some features (especially in Advanced) are aspirational

---

**Last Updated**: January 2026

For current game features, see [README.md](README.md)
