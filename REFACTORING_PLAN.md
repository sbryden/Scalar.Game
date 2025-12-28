# TwentySix - Architectural Refactoring Plan

**Date:** December 27, 2025  
**Project:** Vehicle Side-Scroller Game (Phaser 3)  
**Status:** Planning Phase

---

## Executive Summary

This document outlines a phased refactoring plan to improve maintainability, scalability, and code organization as the game grows in complexity. The current architecture uses a module-based approach with cross-module state sharing that creates tight coupling. This plan transitions to a more maintainable architecture with proper separation of concerns.

---

## Current State Assessment

### File Metrics
| File | Lines | Status | Primary Concerns |
|------|-------|--------|------------------|
| game.js | 217 | ⚠️ Growing | Too many responsibilities, main coordinator |
| xpOrbs.js | 116 | ⚠️ Complex | Mixed concerns (XP, stats, leveling, spawning) |
| enemies.js | 93 | ✅ OK | Reasonable size and scope |
| projectiles.js | 77 | ✅ OK | Focused responsibility |
| player.js | 60 | ✅ Good | Clean and focused |
| ui.js | 45 | ✅ Good | Simple and clear |
| config.js | 54 | ✅ Good | Well-organized constants |

### Architectural Issues

1. **Anti-Pattern: State Sharing via Setters**
   - Every module exports `setPlayer()`, `setEnemies()`, etc.
   - Creates tight coupling between modules
   - Fragile initialization order dependencies
   - Difficult to track state flow

2. **game.js Overload**
   - Phaser initialization
   - Scene management (preload, create, update)
   - Input handling
   - Camera management
   - Game loop coordination
   - Collision setup

3. **xpOrbs.js Mixed Responsibilities**
   - XP orb spawning and physics
   - Player statistics management
   - Leveling system
   - Health management
   - Enemy spawning coordination
   - Magnetism system

4. **Circular Dependency Risk**
   - enemies.js dynamically imports xpOrbs.js
   - Suggests poor module boundaries

---

## Target Architecture

### Proposed Structure

```
src/
├── main.js                      # Phaser config & game initialization
├── config.js                    # Game constants (existing)
│
├── scenes/                      # Phaser scene classes
│   ├── BootScene.js            # Asset preloading
│   └── MainGameScene.js        # Primary gameplay scene
│
├── entities/                    # Game object classes (Phaser-based)
│   ├── Player.js               # Player entity with behaviors
│   ├── Enemy.js                # Enemy entity with AI
│   ├── Projectile.js           # Projectile entity
│   └── XPOrb.js                # XP orb entity
│
├── systems/                     # Pure logic systems (stateless where possible)
│   ├── PlayerStatsSystem.js    # Health, XP, leveling logic
│   ├── SpawnSystem.js          # Enemy and item spawning
│   ├── CombatSystem.js         # Damage calculations and combat
│   └── MagnetismSystem.js      # XP orb attraction logic
│
├── managers/                    # Coordination and subsystems
│   ├── InputManager.js         # Keyboard/mouse input handling
│   ├── CameraManager.js        # Camera follow and bounds
│   └── CollisionManager.js     # Physics collision configuration
│
├── ui/                          # UI components
│   ├── HUD.js                  # Health/XP bars, level display
│   └── DebugDisplay.js         # Debug information overlay
│
└── utils/                       # Shared utilities
    └── gameState.js            # Central state container
```

### Key Architectural Principles

1. **Single Responsibility** - Each module has one clear purpose
2. **Dependency Injection** - Pass dependencies explicitly
3. **Central State** - One source of truth for game state
4. **Scene-Based** - Leverage Phaser's scene architecture
5. **Entity-Component** - Use Phaser's game object inheritance
6. **Testability** - Isolate logic for easier testing

---

## Implementation Plan

### Phase 1: Foundation (Low Risk, High Impact)

**Goal:** Eliminate state sharing anti-pattern and reduce coupling

**Tasks:**

1. **Create Central State Manager**
   - [x] Create `src/utils/gameState.js`
   - [x] Define GameState class with singleton pattern
   - [x] Add properties: player, enemies, projectiles, xpOrbs, platforms, scene, inputs
   - [x] Export singleton instance

2. **Refactor State References**
   - [x] Update `player.js` - replace setters with gameState imports
   - [x] Update `enemies.js` - replace setters with gameState imports
   - [x] Update `projectiles.js` - replace setters with gameState imports
   - [x] Update `xpOrbs.js` - replace setters with gameState imports
   - [x] Update `ui.js` - replace setters with gameState imports (N/A - no state refs)
   - [x] Update `game.js` - initialize gameState instead of calling setters

3. **Extract PlayerStatsSystem**
   - [x] Create `src/systems/PlayerStatsSystem.js`
   - [x] Move playerStats object from xpOrbs.js
   - [x] Move functions: gainXP, checkLevelUp, damagePlayer
   - [x] Update xpOrbs.js to import from PlayerStatsSystem

**Estimated Impact:**
- Removes ~50 lines of setter boilerplate ✅
- Clearer state ownership ✅
- Easier debugging ✅
- Foundation for further refactoring ✅

**Testing Checklist:**
- [x] Player movement still works
- [x] Size changes function correctly
- [x] XP collection and leveling works
- [x] Health damage applies properly
- [x] No console errors

**Status:** ✅ COMPLETED (December 27, 2025)

---

### Phase 2: Modularization (Medium Risk, Medium Impact)

**Goal:** Break down game.js and separate concerns

**Revised Assessment After Phase 1:**
- game.js is now 216 lines (down from 217 - minimal reduction so far)
- xpOrbs.js is now 82 lines (down from 116 - 29% reduction! ✅)
- New files: gameState.js (39 lines), PlayerStatsSystem.js (122 lines)
- **Total project complexity:** Slightly increased but much better organized
- **Phase 2 is OPTIONAL** - Phase 1 already provides significant benefits
- **Recommendation:** Only proceed with Phase 2 if game.js becomes unwieldy (>300 lines)

**Tasks:**

4. **Create InputManager**
   - [x] Create `src/managers/InputManager.js`
   - [x] Extract input setup from game.js create()
   - [x] Extract input handling from game.js update()
   - [x] Add methods: setupInput(), handleMovement(), handleActions()
   - [x] Update game.js to use InputManager

5. **Create CollisionManager**
   - [x] Create `src/managers/CollisionManager.js`
   - [x] Extract collision setup from game.js create()
   - [x] Add method: setupCollisions(scene, physics)
   - [x] Update game.js to use CollisionManager

6. **Split xpOrbs.js Logic**
   - [x] Create `src/systems/SpawnSystem.js`
   - [x] Move spawnXPOrb function
   - [x] Move upgradePlayerCar and enemy spawning logic
   - [x] Create `src/systems/MagnetismSystem.js`
   - [x] Move updateXPOrbMagnetism and constants
   - [x] Update game.js imports

7. **Create CameraManager**
   - [x] Create `src/managers/CameraManager.js`
   - [x] Extract camera setup from game.js create()
   - [x] Extract camera update from game.js update()
   - [x] Add methods: setupCamera(), updateCamera()

**Estimated Impact:**
- game.js reduced by ~80-100 lines ✅ (Actually reduced from 216 to 183 = 33 lines, 15% reduction)
- xpOrbs.js split into focused modules ✅ (Reduced from 82 to 30 lines = 63% reduction!)
- Clearer separation of concerns ✅
- Easier to add features ✅

**Testing Checklist:**
- [x] All Phase 1 tests still pass
- [x] Camera follows player correctly
- [x] Collisions work as expected
- [x] XP orb magnetism functions
- [x] Enemy spawning on level up works

**Status:** ✅ COMPLETED (December 27, 2025)

---

### Phase 3: Full Architecture (High Risk, High Impact)

**Goal:** Convert to proper Phaser scene and entity architecture

**Tasks:**

8. **Create Scene Classes**
   - [ ] Create `src/scenes/BootScene.js`
   - [ ] Move preload() logic to BootScene
   - [ ] Create `src/scenes/MainGameScene.js`
   - [ ] Move create() and update() to MainGameScene
   - [ ] Create `src/main.js` with Phaser config
   - [ ] Update scene configuration

9. **Convert to Entity Classes**
   - [ ] Create `src/entities/Player.js`
   - [ ] Extend Phaser.GameObjects.Sprite
   - [ ] Move player-specific logic from player.js
   - [ ] Add update() method for player behavior
   - [ ] Create `src/entities/Enemy.js`
   - [ ] Move enemy logic from enemies.js
   - [ ] Create `src/entities/Projectile.js`
   - [ ] Move projectile logic from projectiles.js
   - [ ] Create `src/entities/XPOrb.js`
   - [ ] Move orb logic from systems

10. **Create CombatSystem**
    - [ ] Create `src/systems/CombatSystem.js`
    - [ ] Move damageEnemy logic
    - [ ] Move damagePlayer logic
    - [ ] Add calculateDamage() method

11. **Create HUD Class**
    - [ ] Create `src/ui/HUD.js`
    - [ ] Move UI creation from ui.js
    - [ ] Add update() method
    - [ ] Create `src/ui/DebugDisplay.js`
    - [ ] Move debug text logic

12. **Update index.html**
    - [ ] Change script import to main.js
    - [ ] Verify asset paths
    - [ ] Test final build

**Estimated Impact:**
- Proper Phaser architecture
- Object-oriented design
- Highly maintainable
- Easy to extend with new features
- Better performance optimization options

**Testing Checklist:**
- [ ] Complete playthrough test
- [ ] All features function correctly
- [ ] No performance degradation
- [ ] Build process works
- [ ] Code is cleaner and more organized

---

## Implementation Guidelines

### Code Standards

**Module Pattern:**
```javascript
// System (stateless logic)
export class PlayerStatsSystem {
    constructor() {
        this.stats = { /* ... */ };
    }
    
    gainXP(amount) { /* ... */ }
}
```

**Entity Pattern:**
```javascript
// Entity (Phaser game object)
export class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
    
    update(delta) { /* ... */ }
}
```

**Manager Pattern:**
```javascript
// Manager (coordinates subsystems)
export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.setupInput();
    }
    
    setupInput() { /* ... */ }
    update() { /* ... */ }
}
```

### State Access Pattern

**Before (Anti-pattern):**
```javascript
let player;
export function setPlayer(p) { player = p; }
```

**After (Recommended):**
```javascript
import gameState from './utils/gameState.js';
// Access via: gameState.player
```

### Dependency Injection

Pass dependencies explicitly rather than importing globals:

```javascript
// Good
constructor(scene, playerStatsSystem) {
    this.scene = scene;
    this.statsSystem = playerStatsSystem;
}

// Avoid
import { playerStats } from './somewhere.js';
```

---

## Risk Mitigation

### Version Control Strategy

- [ ] Create feature branch: `refactor/architecture`
- [ ] Commit after each phase
- [ ] Tag stable points: `v1.0-phase1`, `v1.0-phase2`, etc.
- [ ] Keep main branch stable

### Testing Strategy

1. **Manual Testing** - Play through game after each phase
2. **Functionality Checklist** - Verify all features work
3. **Performance Check** - Ensure no FPS drops
4. **Console Monitoring** - Watch for errors/warnings

### Rollback Plan

- Each phase is independent
- Can stop after any phase
- Git tags allow easy rollback
- Keep original files until Phase 3 complete

---

## Success Metrics

### Code Quality
- [ ] No circular dependencies
- [ ] Clear module responsibilities
- [ ] Reduced file line counts
- [ ] Eliminated setter anti-pattern

### Maintainability
- [ ] New developer can understand structure in < 30 minutes
- [ ] Can add new enemy type in < 1 hour
- [ ] Can add new weapon in < 1 hour
- [ ] Tests can be added easily

### Performance
- [ ] No FPS degradation
- [ ] Consistent 60 FPS
- [ ] Memory usage stable

---

## Future Enhancements (Post-Refactor)

Once architecture is solid, these become easier:

1. **Save System** - PlayerStatsSystem makes this trivial
2. **Multiple Enemy Types** - Entity pattern supports this
3. **Weapon System** - Easy to add new projectile types
4. **Power-ups** - Systems pattern supports new mechanics
5. **Multiple Levels** - Scene architecture enables this
6. **Audio System** - Can add as new manager
7. **Particle Effects** - Can enhance without touching core logic
8. **Mobile Support** - InputManager can handle touch
9. **Multiplayer** - State architecture supports synchronization
10. **Unit Tests** - Isolated systems are testable

---

## Notes

- Start with Phase 1 - it's low risk and provides immediate benefits
- Each phase should be completed and tested before moving to the next
- Phase 3 is optional but provides the best long-term maintainability
- Keep this document updated as you progress
- Document any deviations from the plan

---

## Progress Tracking

**Phase 1:** ✅ **COMPLETED** (December 27, 2025)  
**Phase 2:** ✅ **COMPLETED** (December 27, 2025)  
**Phase 3:** ⬜ Not Started  

**Last Updated:** December 27, 2025

---

## Phase 1 Results & Insights

### What Was Accomplished
- ✅ Created central `gameState.js` singleton - eliminates all setter functions
- ✅ Refactored all 5 modules to use gameState instead of individual setters
- ✅ Extracted `PlayerStatsSystem.js` - separated player progression logic
- ✅ Reduced coupling between modules significantly
- ✅ All game functionality tested and working

### Files Modified
- `src/utils/gameState.js` (NEW)
- `src/systems/PlayerStatsSystem.js` (NEW)
- `src/player.js` - removed 5 setter functions
- `src/enemies.js` - removed 2 setter functions
- `src/projectiles.js` - removed 3 setter functions
- `src/xpOrbs.js` - removed 6 setter functions, extracted stats logic
- `src/game.js` - simplified initialization, cleaner imports

### Metrics
- **Lines of boilerplate removed:** ~45 lines
- **New abstractions added:** 2 (gameState, PlayerStatsSystem)
- **Setter functions eliminated:** 16
- **Build time:** No regression
- **Runtime performance:** No regression

### Key Learnings
1. **Central state pattern works well** - Much clearer than setter functions
2. **PlayerStatsSystem is highly reusable** - Can easily add save/load, stats UI, achievements
3. **Testing was smooth** - No major issues, just one import cleanup
4. **Phase 2 readiness** - Good foundation for extracting managers

### Updated File Metrics (Post Phase 1)
| File | Lines | Change | Status |
|------|-------|--------|--------|
| game.js | 216 | -1 | ⚠️ Still large but acceptable |
| xpOrbs.js | 82 | -34 | ✅ Much better (29% reduction) |
| player.js | 54 | -6 | ✅ Clean |
| enemies.js | 88 | -5 | ✅ Good |
| projectiles.js | 75 | -2 | ✅ Good |
| ui.js | 45 | 0 | ✅ Clean |
| config.js | 54 | 0 | ✅ Good |
| **NEW** gameState.js | 39 | +39 | ✅ Central state |
| **NEW** PlayerStatsSystem.js | 122 | +122 | ✅ Extracted system |

**Total:** 775 lines (was 662 lines) - +113 lines but much better organized

---

## Phase 2 Results & Insights

### What Was Accomplished
- ✅ Created 3 new managers: InputManager, CollisionManager, CameraManager
- ✅ Created 2 new systems: SpawnSystem, MagnetismSystem
- ✅ Reduced game.js from 216 to 183 lines (15% reduction)
- ✅ Reduced xpOrbs.js from 82 to 30 lines (63% reduction!)
- ✅ Separated all major concerns into focused modules
- ✅ All game functionality tested and working

### Files Created
- `src/managers/InputManager.js` (95 lines) - All input handling
- `src/managers/CollisionManager.js` (42 lines) - Physics collision setup
- `src/managers/CameraManager.js` (39 lines) - Camera behavior
- `src/systems/SpawnSystem.js` (83 lines) - XP orb and enemy spawning
- `src/systems/MagnetismSystem.js` (43 lines) - XP orb attraction

### Files Modified
- `src/game.js` - now uses managers, much cleaner
- `src/xpOrbs.js` - now just a thin wrapper around systems

### Updated File Metrics (Post Phase 2)
| File | Lines | Change | Status |
|------|-------|--------|--------|
| game.js | 183 | -33 | ✅ Much cleaner (15% reduction) |
| xpOrbs.js | 30 | -52 | ✅ Excellent (63% reduction!) |
| player.js | 54 | 0 | ✅ Clean |
| enemies.js | 88 | 0 | ✅ Good |
| projectiles.js | 75 | 0 | ✅ Good |
| ui.js | 45 | 0 | ✅ Clean |
| config.js | 54 | 0 | ✅ Good |
| **Managers** (3 files) | 176 | +176 | ✅ Well organized |
| **Systems** (3 files) | 248 | +126 | ✅ Focused logic |
| **Utils** (1 file) | 39 | 0 | ✅ Central state |

**Total:** 992 lines (was 775 lines) - +217 lines of new structure, but game.js and xpOrbs.js much more maintainable

### Key Improvements
1. **game.js is now a coordinator** - Sets up managers and delegates responsibilities
2. **xpOrbs.js is now minimal** - Just re-exports from systems for backwards compatibility
3. **Clear separation of concerns** - Input, collisions, camera, spawning, magnetism all isolated
4. **Easy to extend** - Adding new input schemes, collision types, spawn logic is now trivial
5. **Testable** - Each manager/system can be unit tested independently

### Architecture Quality
✅ **Single Responsibility** - Each file has one clear purpose  
✅ **Open/Closed Principle** - Easy to extend without modifying existing code  
✅ **Dependency Injection** - Managers receive scene/dependencies in constructor  
✅ **Clear Boundaries** - Managers vs Systems vs Utils clearly differentiated  
✅ **Maintainability** - Can modify input, camera, spawning independently

---

## Recommendations Going Forward

### Immediate Next Steps (Recommended)
1. **Start building features** - The architecture is now excellent for development
2. **Consider adding:**
   - Multiple weapon types (extend projectiles system)
   - Power-ups (create new PickupSystem)
   - Boss enemies (extend SpawnSystem)
   - Different biomes/levels (easy with scene architecture)
   
### When to Do Phase 3
- ⚠️ **Only if** you plan to add multiple distinct game scenes (menu, gameplay, game over, etc.)
- ⚠️ **Only if** you want to convert to full entity-based architecture
- ✅ **Current structure is production-ready** for a single-scene game
- ✅ **Phase 1 + Phase 2 provide excellent maintainability**

### Phase 1 + 2 vs Phase 3 Trade-offs

**Current State (Phase 1 + 2):**
- ✅ Clean, maintainable architecture
- ✅ Well-separated concerns
- ✅ Easy to add features
- ✅ Module-based approach (familiar to most developers)
- ⚠️ Still uses Phaser 3 scene lifecycle functions directly
- ⚠️ Game objects not fully OOP

**After Phase 3:**
- ✅ Full entity-based architecture
- ✅ Multiple scene support
- ✅ Complete OOP design
- ⚠️ More complex (classes for everything)
- ⚠️ Higher learning curve for new developers
- ⚠️ May be overkill for simple games

**Recommendation:** Stop at Phase 2 unless you have specific needs that Phase 3 addresses.

### Architecture Wins from Phase 1 + 2
✅ **Eliminated anti-patterns** - No more setter functions everywhere  
✅ **Clear state ownership** - gameState is the source of truth  
✅ **Separated concerns** - Each manager/system has one job  
✅ **Easy to extend** - Can add features without touching existing code  
✅ **Testable** - Systems can be unit tested independently  
✅ **Clean game.js** - Now just coordinates managers (183 lines)  
✅ **Minimal xpOrbs.js** - Now just a thin compatibility layer (30 lines)  
✅ **Professional structure** - Managers, Systems, Utils pattern is industry standard  

### Maintenance Tips
- Keep managers focused on coordination and setup
- Keep systems focused on pure logic and algorithms
- Use gameState for shared state access
- Follow the existing patterns when adding new features
- Don't over-engineer - current architecture handles most needs
- Consider Phase 3 only for multi-scene games or team projects
