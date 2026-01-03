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
- ✅ **Difficulty Modes**: Normal, Hard, and God Mode with stat multipliers (design notes mention Easy/Medium/Hard)
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
- **Stamina Integration with Size Changes**
  - ✅ Stamina system exists but not yet tied to size transformation
  - Connect stamina consumption to Q/E size change actions
  - Scale stamina cost based on size change magnitude
  - Add visual feedback when stamina is too low to transform
  - Implement cooldown/penalty when attempting size change without stamina

- **Visual Progression**
  - Add vehicle sprite variations based on player level
  - Transform from rusty, slow appearance to high-tech, sleek design
  - Tie visual upgrades to level milestones (levels 5, 10, 15, etc.)
  - Create distinct visual states for different upgrade tiers
  - Add particle effects during transformation animations

### Scale-Based World Interaction
- **Macro Scale Implementation**
  - Add macro (large) scale scenes for land and water environments
  - Implement large-scale enemies (golems, whales, mythological creatures)
  - Create appropriate visual scaling when player is macro-sized
  - Add transition mechanics between normal ↔ macro scales

- **Scale Isolation Enhancement**
  - ✅ Micro/normal scales already isolated via separate scenes
  - Improve visual distinction (blur/fade distant scale layers)
  - Add size-appropriate obstacles and terrain features
  - Enhance scale transition visual effects

### Level Progression Enhancement
- **Level-Up Choice System**
  - Implement branching upgrade choices at level-up
  - Add "grow OR shrink" upgrade path selection
  - Create upgrade tree UI for size transformation capabilities
  - Track player's chosen upgrade path for builds
  - Balance different upgrade paths for viability

---

## 🎮 Phase 2: Content Expansion (Mid-Term)

### Main Menu System
- **Vehicle Selection**
  - ✅ Environment selection exists (Land/Water)
  - Add vehicle type selection: Tank/Car, Submarine, Plane/Air
  - Create unique starting stats for each vehicle type
  - Add vehicle preview/description in menu
  - Save player's vehicle preference between sessions

- **Menu Features**
  - ✅ Difficulty selection dropdown (Easy/Normal/Hard/God Mode)
  - ✅ Boss Mode toggle checkbox
  - Add "FIND" section (glossary/dictionary for game mechanics)
  - Implement settings menu with sound/music volume controls
  - Add key binding customization options

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
  - Design companion AI and follow behavior
  - Implement companion slot selection UI
  - Add companion attack behaviors and cooldowns
  - Create companion stat bonus system
  - Add companion leveling/upgrade mechanics

- **Tank/Car Champion: Mechanical Wolf**
  - Create wolf sprite and animations
  - Implement melee attack behavior
  - Add digging mechanic for mounds of dirt/gravel
  - Implement XP orb and parts discovery system
  - Add defensive support abilities

- **Submarine Champion: Mechanical Fish**
  - Create mechanical fish sprite and animations
  - Implement speed and oxygen/HP bonuses
  - Add ranged attack behavior underwater
  - Create critical hit spot highlighting system
  - Add enhanced underwater maneuverability

- **Plane Champion: Mechanical Hawk**
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

- **Ramming Mechanic**
  - Implement vehicle collision damage
  - Deal damage to both player and enemy on ram
  - Add momentum-based damage calculation
  - Create risk/reward for aggressive driving
  - Add knockback effects and visual feedback
  - Integrate with stamina system (cost to ram)

### Plane/Air Environment (New)
- **Flight Mechanics**
  - Create AirScene and AirMicroScene
  - Implement full X and Y directional movement
  - Design cloud-filled skybox with parallax
  - Add wind gust system affecting movement
  - Implement altitude-based physics
  - Create stall mechanic when out of fuel/stamina

- **Aerial Combat**
  - Add dragonfly-like bugs at micro scale
  - Create eagles and large birds at normal scale
  - Design mythological flying creatures (dragons, phoenixes, wyverns)
  - Implement aerial boss encounters
  - Add dogfight-style combat mechanics
  - Create vertical combat dynamics

- **Fuel Management**
  - Tie fuel to existing stamina system
  - Implement fuel depletion over time during flight
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
- **Meta-Progression**
  - Persistent upgrades between gameplay sessions
  - Unlockable vehicles and champions
  - Collectible parts for vehicle customization
  - Achievement system with rewards
  - Stat tracking across all runs
  - Leaderboards for high scores
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

### 1. Stamina System vs. Size Transformation
**Conflict**: The design notes state "When the vehicle transforms (small to big or big to small) some stamina or fuel is depleted." However, the current implementation has a stamina system that manages melee mode (Shift key for close-range combat with blue tint) but is NOT connected to size transformation (Q/E keys work without stamina cost).

**Questions**:
- Should stamina consumption be added to size transformations in addition to melee mode?
- Should there be a separate "fuel" system for transformations vs. "stamina" for melee combat?
- What should be the stamina/fuel cost per transformation? Fixed amount or scale-based?
- Should melee mode continue to use stamina, or be reworked?

### 2. Vehicle Types vs. Environment Selection
**Conflict**: The design notes mention three distinct vehicle types (Tank/Car, Submarine, Plane), but the current implementation has environment selection (Land/Water) where the same player sprite works in all environments.

**Questions**:
- Should vehicle selection replace environment selection, or coexist with it?
- Should each vehicle be locked to its environment (tank=land only, submarine=water only)?
- Or should vehicles be cosmetic/stat variants that work in any environment?
- Does the current tank sprite represent all vehicle types, or should there be distinct sprites?

### 3. Macro Scale Implementation
**Conflict**: The design notes mention macro scale enemies (rock animals, golems, whales) when player is "big", but the current implementation only has "normal" and "micro" scales, no "macro/large" scale.

**Questions**:
- Should we add a third scale tier (micro → normal → macro)?
- Or is "normal" meant to be the "macro" relative to micro?
- Should growing (E key) go: micro → normal → macro, or just micro ↔ normal?
- What enemies should exist at each scale tier?

### 4. Scale Isolation vs. Visual Rendering
**Conflict**: Design notes say "When in macro world you can barely see the micro world. Micro realm is not affected by the Macro sized player or monsters." Current implementation uses separate scenes for scale separation.

**Questions**:
- Is complete scene separation the right approach, or should scales coexist in one scene with layers?
- Should there be visual rendering of other scales (blurred/faded) or complete separation?
- How do we handle the transition between scales visually?

### 5. Planet/World Size
**Conflict**: Design notes mention "Small planet" but implementation has fixed-width world (8192 pixels) with linear side-scrolling, not a planet.

**Questions**:
- Should the world wrap around (simulate a small planet)?
- Or is "small planet" just thematic flavor for the linear level design?
- Should we add circular/spherical world mechanics in the future?

### 6. Champions vs. Current Implementation
**Conflict**: Design notes describe champions (Mechanical Wolf, Fish, Hawk) with specific abilities, but none are implemented yet.

**Questions**:
- Should champions be companions that follow the player, or power-ups?
- Should each vehicle type have a unique champion, or can any champion work with any vehicle?
- Are champions selected at start or unlocked/collected during gameplay?
- Should there be multiple champion slots or just one active companion?

### 7. Difficulty Settings Discrepancy
**Conflict**: Design notes describe three difficulties (Easy, Medium, Hard), but implementation has three modes: Normal, Hard, and God Mode.

**Questions**:
- Should "Normal" be renamed to "Medium" to match design notes?
- Should "Easy" difficulty be added as a fourth option?
- Or should design notes be updated to reflect Normal/Hard/God Mode as the intended difficulties?
- Is "God Mode" meant to be a debug/accessibility option or a legitimate difficulty tier?
- Do the Normal/Hard difficulty multipliers match the intended design (easy = one-shot enemies)?

### 8. Level Progression Choice System
**Conflict**: Design notes say "player levels up and has a choice to grow or shrink more" suggesting a choice at each level-up, but current implementation has automatic stat increases.

**Questions**:
- Should level-up present a choice between "improve grow ability" vs "improve shrink ability"?
- Or should it be: "increase max size" vs "decrease min size" to expand range?
- What specific benefits does each choice provide?
- Should there be other upgrade choices (health, speed, damage)?

### 9. Ramming Mechanic Scope
**Conflict**: Design notes mention ramming for Tank/Car specifically: "Can ram/drive through the monster dealing small damage to both the player and the monster." Not implemented yet.

**Questions**:
- Should ramming be exclusive to Tank/Car vehicle type?
- Or should all vehicles have some form of collision damage?
- Should ramming be automatic on collision or require a special input/state?
- How does ramming interact with the stamina system?

### 10. Air Environment Priority
**Conflict**: Design notes describe Plane/Air environment in detail, but current implementation only has Land and Water. Menu says "Air environment coming soon!"

**Questions**:
- What's the priority for implementing Air environment (Phase 3)?
- Should Air environment be added before or after other Phase 2 features?
- Will Air environment have both normal and micro scales like Land/Water?

---

**Last Updated**: January 2026

For current development status, see the [README.md](README.md) file.
For contribution guidelines, check the repository's contribution documentation.
