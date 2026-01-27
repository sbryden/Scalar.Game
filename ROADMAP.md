# Scalar Game - Development Roadmap

This roadmap outlines the future development for Scalar. For current features and implementation status, see [README.md](README.md).

The roadmap is organized by feature area rather than timeline, allowing for flexible prioritization based on gameplay testing and community feedback.

---

## 🎯 Core Mechanics Enhancements

### ✅ Flag-Based Level Completion
**Status: COMPLETED**
- ✅ Changed level completion flow - bosses no longer immediately end the level
- ✅ When all bosses are defeated:
  - All remaining enemies are destroyed without dropping XP orbs
  - A golden flag spawns at a fixed distance from the map's end (300 pixels)
- ✅ Flag has a bouncing animation to attract player attention
- ✅ Player must reach the flag to complete the level
- ✅ Firework celebration animation plays when flag is reached:
  - 5 colorful particle bursts radiating from screen center
  - Camera shake effects for impact
  - 1-second delay before stats screen displays
- ✅ Works with both normal mode (single boss) and boss mode (multiple bosses)
- ✅ Proper cleanup on level restart/replay

### ✅ Improved HUD & Stat Display
**Status: COMPLETED**
- ✅ Redesigned vertical stat bars into horizontal top bar layout
- ✅ Added clear text labels for each stat (HP, STA, FUEL, XP)
- ✅ Optimized use of horizontal screen space
- ✅ Maintained pixel-art styling with bold text and contrasting colors
- ✅ Preserved existing color states for stamina and fuel warnings
- ✅ Repositioned level/map info and pause button for clean layout

### ✅ Fuel System for Size Transformations
**Status: COMPLETED**
- ✅ Implemented separate fuel system (distinct from stamina which is for melee)
- ✅ 20-second cooldown for size transformations at game start
- ✅ Fuel regenerates over time (faster at higher levels)
- ✅ Visual fuel bar in HUD
- ✅ Prevent size changes when fuel depleted
- ✅ Low fuel warning indicators

### ✅ 3-Tier Scale System (Macro Scale)
**Status: COMPLETED**
- ✅ Add macro (large) scale to existing micro/normal scales
- ✅ Progressive scaling: micro → normal → macro (E key advances, Q key reverses)
- ✅ Created 2 new scenes per biome:
  - MainGameMacroScene (land, macro scale)
  - UnderwaterMacroScene (water, macro scale)
- ✅ Macro-scale enemies:
  - Land: Golems, wolves, bears, and macro bosses
  - Water: Whales, giant sharks, sea dragons, giant crabs, sea serpents
- ✅ Camera and physics scaling adjustments for macro perspective
- ✅ Enhanced visuals: mountain silhouettes, deep ocean effects, bioluminescent elements
- ✅ Macro combat bonuses: 30% enhanced ramming damage

### Vehicle Visual Progression
**Priority: Medium**
- Vehicle sprite variations based on player level
- Start rusty and slow, evolve to high-tech and sleek
- Visual upgrades at level milestones (5, 10, 15, 20, etc.)
- Tie speed improvements to visual upgrades
- Particle effects during transformation animations
- Distinct visual states per upgrade tier

### ✅ Ramming/Melee Enhancements
**Status: COMPLETED**
- ✅ Vehicle-specific ramming abilities
- ✅ Enhanced visual feedback for collision damage (camera shake, tints, impact flashes)
- ✅ Fine-tuned damage balance with multiple modifiers
- ✅ Momentum-based damage calculation (velocity bonus)
- ✅ Risk/reward mechanics (melee mode reduces damage taken, passive mode deals less damage)
- ✅ Polished melee mode visual effects (tint colors, flashes, screen shake)
- ✅ Combo system for consecutive hits
- ✅ Positioning multipliers (attacking from behind/above)
- ✅ Size-based damage scaling

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

### ✅ Base Champion System  
**Status: PARTIALLY COMPLETED** - Foundation implemented
- ✅ Champions are AI companions that fight alongside player
- ✅ Biome-specific (land wolf only works on land; can't use in underwater biome)
- ✅ Multiple companions can be active simultaneously (if player collects different companion orbs)
- ✅ Champion AI: follow player, auto-attack nearby enemies
- ✅ Champion health and stamina bars displayed above companion (enemy-style)
- ✅ Companion HP scales with player level (½ of player base HP)
- ✅ Permanent death within a run (no revival once HP reaches zero)
- ✅ Companion orbs can refresh HP/stamina if companion is still alive
- ✅ Companions persist across size-scale transitions within same biome (micro/normal/macro)
- ✅ Unlock system: companions unlocked by defeating specific bosses (wolf from wolf_boss)

### ✅ Land Champion: Mechanical Wolf  
**Status: IMPLEMENTED**
- ✅ Wolf sprite and HP/stamina display bars
- ✅ Melee attack behavior using shield-like mechanics
  - Stamina-based melee mode with faster depletion than player shield (1.5x consumption rate)
  - 70% damage reduction when in melee mode
  - Auto-toggles melee mode when enemies are within attack range (60 units)
  - Visual tinting (cyan when in melee, gray when exhausted)
- ✅ Follow player behavior maintaining 80-unit distance
- ✅ Auto-attacks nearby enemies when in melee mode
- ✅ Level-scaled damage: base 15 + 2 per player level
- ✅ Orb refresh mechanic: picking up additional wolf orbs restores HP and stamina to 100% if alive
- ✅ Permanent death: if wolf dies, it cannot be revived for the rest of the run
- (future) Digging mechanic: periodically digs mounds of dirt/gravel
- (future) Occasionally uncovers XP orbs or upgrade parts
- (future) Howl ability to stun nearby enemies

### Water Champion: Mechanical Fish
- Mechanical fish sprite and animations
- Stat bonuses: +speed, +oxygen/HP
- Ranged attack behavior underwater
- (future) Highlights enemy weak points (critical hit system integration)
- Enhanced maneuverability bonus in water
- School mechanic: creates duplicate decoys

### Air Champion: Mechanical Hawk
- Hawk sprite and aerial animations
- Fire rate multiplier passive ability
- Agility bonus for player
- Dive bomb attack (massive damage on cooldown)
- (future) Scout ability: reveals nearby enemies
- Wind riding: reduces fuel consumption

---

## 🎮 Menu & Settings Enhancements

### ✅ Difficulty System Overhaul
**Status: COMPLETED**
- ✅ Added Easy and Brutal difficulty modes (now 4 difficulties: Easy/Normal/Hard/Brutal)
- ✅ Rebalanced Normal and Hard modes (reduced enemy stats for better accessibility)
- ✅ Enemy density scales with difficulty (enemySpawnMultiplier)
- ✅ Difficulty-specific stat multipliers implemented:
  - **Easy**: 40% enemy HP, 50% damage dealt, 2x player damage, 50% spawn rate, 0.8x XP
  - **Normal**: Balanced baseline (1.0x all stats)
  - **Hard**: 130% enemy HP, 125% damage, 90% player damage, 130% spawn rate, 1.25x XP
  - **Brutal**: 200% enemy HP, 200% damage, 75% player damage, 180% spawn rate, 2x XP
- ✅ God Mode hidden in production builds (only visible when BUILD_NUMBER is 'dev')
- ✅ Unified getDifficultyConfig() function for consistent multiplier access

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

### Minimap System
**Priority: Medium**
- **Core Display**:
  - Minimap in corner of screen (configurable position)
  - Real-time map of nearby area
  - Player position indicator (centered or tracked)
  - Terrain/environment representation
- **Enemy Tracking**:
  - Show nearby enemies as colored dots/icons
  - Different colors for enemy types (normal, elite, boss)
  - Enemy health indicators on minimap
  - Aggro radius visualization
- **Objectives & Points of Interest**:
  - Mark objectives and goals
  - XP orb clusters highlighted
  - Boss locations when active
  - Safe zones or landmarks
- **Scale Awareness**:
  - Minimap zoom adjusts based on player scale (micro/normal/macro)
  - Show scale transition zones
  - Different visual style per biome
- **Interactive Features**:
  - Toggle minimap visibility
  - Expand to full-screen map
  - Ping system for marking locations
  - Fog of war for unexplored areas (optional)
- **Visual Customization**:
  - Opacity settings
  - Size adjustment
  - Corner position selection
  - Color scheme options

### UI/UX Improvements
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
