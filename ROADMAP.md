# Scalar Game - Development Roadmap

This roadmap outlines the planned features and improvements for Scalar, a 2D side-scrolling game with dynamic size-shifting mechanics. The roadmap is organized into phases, with earlier phases being more concrete and later phases allowing for evolution based on gameplay testing and community feedback.

---

## ✅ Completed Features

### Core Gameplay Foundation
- ✅ Basic vehicle character movement and controls (land and underwater)
- ✅ Physics-based gravity and collisions with Arcade physics
- ✅ Camera system following the player with dynamic scaling
- ✅ Size transformation mechanics (shrink/grow with Q/E keys)
- ✅ Multiple environments: Land and Underwater levels with micro variants
  - MainGameScene (land, normal scale)
  - MicroScene (land, micro scale)
  - UnderwaterScene (water, normal scale)
  - UnderwaterMicroScene (water, micro scale)
- ✅ Environment-specific mechanics (submarine vertical thrust with W/S controls)
- ✅ Combat system with projectiles (F key to shoot)
- ✅ Enemy AI with patrol and chase behaviors
- ✅ Line of sight detection system with configurable ranges
- ✅ Health and damage systems with visual feedback
- ✅ XP orb collection with magnetization system
- ✅ TypeScript architecture with modular managers and systems

### Advanced Features Already Implemented
- ✅ **Stamina System**: Full stamina management with recharge, consumption, exhaustion mechanics (currently used for melee mode - Shift key)
- ✅ **Level Progression System**: Player leveling with XP requirements and stat increases
- ✅ **Map Level System**: Progressive difficulty with level-based enemy scaling
- ✅ **Difficulty Modes**: Normal, Hard, and God Mode with stat multipliers
- ✅ **Main Menu**: Environment selection (Land/Water), difficulty dropdown, boss mode toggle
- ✅ **HUD Display**: Health bar, XP bar, stamina bar, player level, map level indicators
- ✅ **Boss Enemies**: Multiple boss types per environment with enhanced stats and abilities
  - Land: boss_land, spawner_boss_land (spawns rock minions)
  - Water: boss_water_swimming, boss_water_shark (ranged attacks), boss_water_crab
  - Micro: boss_land_micro, boss_water_swimming_micro
- ✅ **Enemy Variety by Scale**:
  - Normal scale: generic land enemies, fish, crabs
  - Micro scale: bacteria-like enemies, plankton, micro fish
  - Boss variants for each scale and environment
- ✅ **Scale-Based Scene Transitions**: Seamless transitions between normal and micro worlds
- ✅ **Combat Feedback**: Camera shake, color flashes, health bars above enemies
- ✅ **Level Stats Tracking**: Tracks enemies destroyed, bosses defeated, score calculation
- ✅ **Level Complete Screen**: End-of-level summary with detailed statistics

---

## 🚀 Phase 1: Core Mechanics Enhancement (Near-Term)

### Vehicle Transformation System
- **Fuel System for Size Changes** (Separate from Stamina)
  - ✅ Stamina system exists for melee mode
  - Implement separate fuel system for size transformations
  - Start with 20-second cooldown for size changes
  - Add visual feedback when fuel is too low to transform
  - Fuel regenerates over time (faster at higher levels)
  - Display fuel bar in HUD alongside health/XP/stamina

- **Visual Progression**
  - Add vehicle sprite variations based on player level
  - Transform from rusty, slow appearance to high-tech, sleek design
  - Tie visual upgrades to level milestones (levels 5, 10, 15, etc.)
  - Create distinct visual states for different upgrade tiers
  - Add particle effects during transformation animations

### Scale-Based World Interaction
- **Macro Scale Implementation** (3-Tier System)
  - Add macro (large) scale scenes for land and water environments
  - Implement large-scale enemies (golems, whales, rock animals, mythological creatures)
  - Create appropriate visual scaling when player is macro-sized
  - Progressive scaling: micro → normal → macro (one stage at a time with E key)
  - Add transition mechanics between all three scale tiers

- **Scale Isolation Enhancement**
  - ✅ Micro/normal scales already isolated via separate scenes
  - ✅ Complete scene separation approach confirmed
  - Add visual continuity: use prior scale's ground texture as background when shrinking
  - Enhance scale transition with Ant-Man style scaling animations (player shrinks, enemies appear to grow)
  - Add size-appropriate obstacles and terrain features per scale

### Level Progression Enhancement (Far Future - Rough Concept)
- **Level-Up Choice System**
  - This is a far future item and not well defined yet
  - Implement branching upgrade choices at level-up
  - Add "grow OR shrink" upgrade path selection
  - Create upgrade tree UI for size transformation capabilities
  - Track player's chosen upgrade path for builds
  - Balance different upgrade paths for viability
  - Consider other upgrade choices (health, speed, damage)

---

## 🎮 Phase 2: Content Expansion (Mid-Term)

### Main Menu System
- **Biome/Environment Selection**
  - ✅ Environment selection exists (Land/Water)
  - Environment/biome selection is the primary menu feature
  - Vehicle types are tied to their respective biomes
  - Save player's environment preference between sessions

- **Menu Features**
  - ✅ Difficulty selection dropdown (Normal/Hard/God Mode)
  - Add Easy and Brutal difficulty modes
  - Rebalance Normal and Hard difficulties (currently too difficult)
  - Add enemy density as key difficulty factor
  - ✅ Boss Mode toggle checkbox
  - Add "FIND" section (glossary/dictionary for game mechanics)
  - Implement settings menu with sound/music volume controls
  - Add key binding customization options
  - God Mode will be hidden/removed in future (debug only)

### Enemy Variety & Scale-Based Spawning
- **Macro Scale Enemies** (Large/Giant) - *Requires Macro Scenes*
  - Rock animals and geological creatures
  - Mythological beasts (dragons, phoenixes, kraken)
  - Large predators: whales, giant sharks, eagles
  - Giant golems, bears, and wolves

- **Normal Scale Enemies**
  - ✅ Generic land enemies implemented
  - ✅ Fish and crabs in underwater environments
  - Add gunners with ranged attacks
  - Add flying/aerial enemies for land scenes
  - Add security/robot enemies with varied attack patterns

- **Micro Scale Enemies**
  - ✅ Bacteria-like enemies (micro, water_swimming_micro)
  - ✅ Plankton in underwater micro
  - Add ants and small insects for land micro
  - Add various microorganism types with different behaviors
  - Add cell-like enemies with division mechanics

- **Boss Enhancements**
  - ✅ Multiple boss types per environment
  - ✅ Spawner boss that creates minions
  - ✅ Shark boss with ranged torpedo attacks
  - Add multi-phase boss fights
  - Add boss-specific mechanics and attack patterns

### Champion/Companion System
- **Base Implementation**
  - Champions are companions/buddies that fight alongside the player
  - Specific to each biome (land, water, air)
  - Only one champion active at a time
  - Design companion AI and follow behavior
  - Implement companion slot selection (details to be determined: at start or unlocked during gameplay)
  - Add companion attack behaviors and cooldowns
  - Create companion stat bonus system

- **Land Champion: Mechanical Wolf**
  - Create wolf sprite and animations
  - Implement melee attack behavior
  - Add digging mechanic for mounds of dirt/gravel
  - Implement XP orb and parts discovery system
  - Add defensive support abilities

- **Water Champion: Mechanical Fish**
  - Create mechanical fish sprite and animations
  - Implement speed and oxygen/HP bonuses
  - Add ranged attack behavior underwater
  - Create critical hit spot highlighting system
  - Add enhanced underwater maneuverability

- **Air Champion: Mechanical Hawk**
  - Design hawk sprite and aerial animations
  - Implement fire rate and agility multipliers
  - Create dive bomb attack mechanic
  - Add aerial combat support behaviors

---

## 🌍 Phase 3: Environment & Vehicle Expansion (Long-Term)

### Submarine/Underwater Environment Enhancements
- **Deep Sea Mechanics**
  - ✅ Vertical thrust controls (W/S) implemented
  - ✅ Lighter gravity for underwater feel
  - Add gradual downward drift mechanic
  - Implement depth-based pressure system
  - Create depth zones with varying difficulty
  - Add oxygen/air bubble collection mechanics

- **Underwater Obstacles & Navigation**
  - ✅ Kelp and coral decorations exist
  - Make kelp forests interactive (slow movement)
  - Implement cave systems for micro-scale exploration
  - Create underwater currents affecting movement
  - Add submarine-specific hazards (mines, whirlpools)
  - Improve vertical level design with depth layers

### Tank/Car Land Environment Enhancements
- **Scale-Based Terrain**
  - ✅ Basic platform navigation exists
  - Add massive dirt and gravel mountains for micro scale
  - Create climbable surfaces when small
  - Add destructible terrain elements
  - Implement terrain that changes with scale
  - Add interactive environmental objects

- **Ramming/Melee Mechanic** (High Priority - Mostly Implemented)
  - ✅ Ramming/melee mode implemented (Shift key)
  - ✅ Uses stamina system
  - Enhance vehicle-specific ramming abilities
  - Add more visual feedback for collision damage
  - Fine-tune damage balance for both player and enemy
  - Add momentum-based damage calculation
  - Create risk/reward for aggressive driving

### Plane/Air Environment (New - Major Feature)
- **Flight Mechanics**
  - Create AirScene and AirMicroScene (and AirMacroScene for 3-tier system)
  - Implement full X and Y directional movement
  - Design cloud-filled skybox with parallax
  - Add wind gust system affecting movement
  - Implement altitude-based physics
  - Create stall mechanic when out of fuel
  - This is a major feature with multiple sub-features requiring further design

- **Aerial Combat**
  - Add dragonfly-like bugs at micro scale
  - Create eagles and large birds at normal scale
  - Design mythological flying creatures at macro scale (dragons, phoenixes, wyverns)
  - Implement aerial boss encounters
  - Add dogfight-style combat mechanics
  - Create vertical combat dynamics

- **Fuel Management**
  - Separate fuel system for size transformations (shared across all biomes)
  - Implement fuel depletion over time during flight (air-specific)
  - Add stall state when fuel depleted
  - Create wind drift mechanic when stalled
  - Add fuel pickups or regeneration zones
  - Balance fuel consumption with gameplay flow

---

## ⚙️ Phase 4: Systems & Polish (Future)

### Advanced Combat Systems
- **Critical Hit System**
  - Implement weak point detection on enemies
  - Add critical hit damage multipliers
  - Visual feedback for critical strikes
  - Champion abilities to highlight weak points
  - Enemy-specific vulnerable zones

### Visual & Audio Enhancements
- **Sound Design**
  - Background music for each environment
  - Sound effects for weapons and transformations
  - Enemy-specific audio cues
  - Ambient environmental sounds (waves, wind, etc.)
  - Volume controls in settings menu
  - Dynamic music that responds to combat intensity

- **Visual Effects**
  - ✅ Camera shake on combat impacts
  - ✅ Color flash effects on damage
  - Particle effects for size transformations
  - Enhanced combat impact effects
  - Environmental particle systems (dust, bubbles, clouds)
  - Lighting and atmospheric effects
  - Trail effects for projectiles and movement

### User Interface Improvements
- **HUD Enhancements**
  - ✅ Health, XP, and stamina bars exist
  - ✅ Level and map level display
  - Add minimap showing nearby enemies and objectives
  - Improve bar styling with gradients and animations
  - Add active companion status indicator
  - Display current environment and scale
  - Add combo counter and damage numbers

- **Progression Feedback**
  - ✅ Level complete screen with statistics
  - Add level-up animations and notifications
  - Create upgrade selection screen UI
  - Add stats comparison when choosing upgrades
  - Implement achievement system with unlocks
  - Add tutorial tips and hints system

---

## 🎯 Phase 5: Advanced Features (Aspirational)

### Procedural Generation & Replayability
- **Dynamic World Generation**
  - ✅ Random segment density for enemy spawns
  - Expand to procedurally generated terrain layouts
  - Add randomized platform configurations
  - Implement biome variety within environments
  - Create unique runs with seed-based generation
  - Add challenge modifiers and mutators

### Boss Battles Enhancement
- **Scale-Specific Bosses**
  - ✅ Boss variants for land, water, and micro scales
  - ✅ Spawner boss with minion mechanics
  - ✅ Shark boss with ranged attacks
  - Add macro bosses with massive health pools
  - Create multi-phase boss transformations
  - Add unique boss abilities per environment
  - Implement boss-specific arena mechanics
  - Create memorable boss encounters with patterns

### Progression & Unlocks
- **High Score Tracking**
  - **Phase 1 (Local)**: Implement browser localStorage for high scores
    - Track high scores per difficulty and biome
    - Display personal best on menu and level complete screen
    - Add high score leaderboard UI
  - **Phase 2 (Cloud)**: Migrate to cloud-based storage
    - Global leaderboards across all players
    - Persistent high scores across devices
    - Social features and comparisons
  
- **Meta-Progression**
  - Persistent upgrades between gameplay sessions
  - Unlockable vehicles and champions
  - Collectible parts for vehicle customization
  - Achievement system with rewards
  - Stat tracking across all runs
  - Daily/weekly challenges

### Multiplayer Considerations (Exploration)
- **Cooperative Elements** (Potential)
  - Shared world exploration
  - Team-based size puzzles (one player micro, one macro)
  - Combined champion abilities
  - Competitive leaderboards and time trials
  - Co-op boss battles
  - PvP arena modes

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

## ❓ Open Questions & Conflicts to Resolve

This section identifies areas where the original design notes, current implementation, and roadmap have conflicts or ambiguities that need clarification:

### 1. ✅ RESOLVED: Stamina System vs. Size Transformation
**Resolution**: Separate fuel system for size transformations. Stamina remains for melee mode. Start with 20-second cooldown for size changes.

### 2. ✅ RESOLVED: Vehicle Types vs. Environment Selection
**Resolution**: Biome/environment selection is the key feature. Vehicles are tied to their respective biomes (tank for land, submarine for water, plane for air).

### 3. ✅ RESOLVED: Macro Scale Implementation
**Resolution**: Add third scale tier with progressive scaling: micro → normal → macro (one stage at a time). Current "normal" is the middle tier.

### 4. ✅ RESOLVED: Scale Isolation vs. Visual Rendering
**Resolution**: Complete scene separation is confirmed as the approach. Add visual continuity by using prior scale's ground texture as background. Future enhancement: Ant-Man style scaling animations.

### 5. ✅ RESOLVED: Planet/World Size
**Resolution**: Ignore "small planet" design notes. Continue with linear side-scrolling world design.

### 6. ✅ RESOLVED: Champions
**Resolution**: Champions are companions/buddies specific to each biome. Only one active at a time. Selection method TBD (at start or unlocked during gameplay).

### 7. ✅ RESOLVED: Difficulty Settings
**Resolution**: Implement Easy, Normal, Hard, Brutal, and God Mode. God Mode will be hidden/removed in future (debug only). Rebalance Normal and Hard (currently too difficult). Enemy density should be a key difficulty factor.

### 8. Level Progression Choice System
**Status**: Far future feature, not well defined yet. Rough concept for branching upgrade choices at level-up.

**Remaining Questions**:
- Should level-up present a choice between "improve grow ability" vs "improve shrink ability"?
- Or should it be: "increase max size" vs "decrease min size" to expand range?
- What specific benefits does each choice provide?
- Should there be other upgrade choices (health, speed, damage)?

### 9. ✅ RESOLVED: Ramming Mechanic
**Resolution**: Ramming/melee mechanic is mostly implemented (Shift key with stamina). High priority to enhance with vehicle-specific abilities and better visual feedback.

### 10. ✅ RESOLVED: Air Environment Priority
**Resolution**: Air environment is a major feature with sub-features (TBD). Will have normal and micro scales (and macro once 3-tier system is implemented).

---

**Last Updated**: January 2026

For current development status, see the [README.md](README.md) file.
For contribution guidelines, check the repository's contribution documentation.
