# TypeScript Type Refactor Plan

## Overview
Systematic elimination of `any` types and improvement of type safety across the codebase.

---

## Implementation Phases

### Phase 1: Create Type Definitions ✅
- [x] Create `src/types/game.d.ts` for game-specific interfaces
- [x] Define interfaces for: Player, Enemy, Projectile, XPOrb, PlayerStats
- [x] Define type aliases for: Difficulty, PlayerSize, SceneKey
- [x] Define WASDKeys interface for input types

### Phase 2: Fix Core Game State ✅
- [x] Add proper types to `GameState` class properties
- [x] Create interfaces for all Phaser groups and sprites
- [x] Type the scene, cursors, and input objects properly
- [x] Add proper function reference types

### Phase 3: Fix UI Components ✅
- [x] Add proper constructor parameter types to HUD class
- [x] Type all HUD properties (Phaser.GameObjects.Rectangle, etc.)
- [x] Add proper constructor parameter types to DebugDisplay class
- [x] Type all DebugDisplay properties
- [x] Add return types to all UI methods

### Phase 4: Fix Systems ✅
- [x] Type PlayerStatsSystem stats property with interface
- [x] Add proper callback types (onLevelUp, onGameOver)
- [x] Type SpawnSystem methods properly
- [x] Type CombatSystem methods properly
- [x] Type MagnetismSystem methods properly
- [x] Add return types to all system methods

### Phase 5: Fix Managers ✅
- [x] Fix InputManager wasdKeys type (use WASDKeys interface)
- [x] Add return types to all manager methods
- [x] Ensure all manager properties are properly typed
- [x] Add Phaser types for CollisionManager
- [x] Add proper types for CameraManager

### Phase 6: Fix Scene Classes ✅
- [x] Remove null assignments in constructors (properties use ! assertions)
- [x] Ensure proper initialization in create() methods
- [x] Add Enemy type import to scene files
- [x] Fix scene shutdown type casting

---

## Remaining Work

### Phase 7: Add Return Types to Legacy Modules ✅
- [x] Add explicit return types to all functions in `player.ts`
- [x] Add explicit return types to all functions in `enemies.ts`
- [x] Add explicit return types to all functions in `projectiles.ts`
- [x] Add explicit return types to all functions in `xpOrbs.ts`
- [x] Add explicit return types to all functions in `ui.ts`
- [x] Add explicit return types to MenuScene methods
- [x] Convert imports to `import type` for type-only imports (fixes verbatimModuleSyntax errors)

### Phase 8: Enable Strict Mode ⚠️ BLOCKED
**Status:** Requires Phase 7 completion + additional work (100+ type errors)

**Blockers:**
- [ ] Enable `"strict": true` in tsconfig.json
- [ ] Enable `"noImplicitAny": true` 
- [ ] Fix implicit any types in function-based modules (Phase 7 prerequisite)
- [ ] Add proper Phaser type extensions
- [ ] Fix Phaser Body type union issues

**Specific Issues:**
1. **Function Module Refactoring**: Files like `player.ts`, `enemies.ts`, `projectiles.ts`, `xpOrbs.ts`, `ui.ts` use plain functions and need proper type signatures (Phase 7 addresses this)

2. **Phaser Body Type Issues**: Union type `Body | StaticBody` doesn't have common methods like `setVelocityX`. Need custom type guards.

3. **Extended Property Types**: Custom properties on Phaser objects (e.g., `lastDamageTime`, `stunVelocity`, `xpValue`) need proper interface extensions.

4. **SavedEnemy Interface**: Missing properties: `startX`, `startY`, `direction`, `floatAngle`

5. **Scene Type Casting**: Enemy restoration needs proper casting from `GameObject` to `Enemy`

### Phase 9: Refactor Function Modules to Classes 🔮 FUTURE
- [ ] Convert `player.ts` to class-based module
- [ ] Convert `enemies.ts` to class-based module
- [ ] Convert `projectiles.ts` to class-based module
- [ ] Convert `xpOrbs.ts` to class-based module
- [ ] Convert `ui.ts` to class-based module
- [ ] Would improve consistency and testability

### Phase 10: Extract Magic Numbers 🔮 FUTURE
- [ ] Create constants file for all hardcoded values
- [ ] Update references throughout codebase
- [ ] Improve maintainability

---

## Summary

### ✅ Completed Work
- **Type Definitions**: Created comprehensive `src/types/game.ts` with all game interfaces
- **GameState**: Eliminated ALL `any` types (12 properties fixed) with proper Phaser types
- **UI Components**: Fully typed HUD and DebugDisplay (8 `any` types removed)
- **Systems**: Fully typed PlayerStatsSystem, CombatSystem, SpawnSystem, MagnetismSystem
- **Managers**: Fully typed InputManager, CollisionManager, CameraManager
- **Scenes**: Fixed constructor patterns, added proper type imports
- **Return Types**: Added return types to all class methods AND legacy function modules
- **Function Modules**: Added parameter types and return types to `player.ts`, `enemies.ts`, `projectiles.ts`, `xpOrbs.ts`, `ui.ts`
- **MenuScene**: Added parameter types and return types to all methods

### 📊 Current Status
- **Intentional `any` types remaining**: 2 (in `CombatSystem.calculateDamage` for extensibility)
- **Build status**: ✅ Passing with current settings
- **Functionality**: ✅ No breaking changes
- **Type safety improvement**: ~85% of explicit `any` types eliminated

### 🚧 Remaining Issues
- **Strict mode**: ❌ Would reveal 95+ errors requiring comprehensive refactor
- **Phaser extensions**: Custom properties need proper type declarations
- **Type guards**: Need guards for Phaser Body type unions
- **SavedEnemy**: Missing properties in interface (startX, startY, direction, floatAngle)

### 🎯 Next Steps (Future PR)
1. **Phase 8 Prerequisites**: Create Phaser type extensions for custom properties (lastDamageTime, stunVelocity, xpValue)
2. **Phase 8 Prerequisites**: Extend SavedEnemy interface with missing properties
3. **Phase 8 Prerequisites**: Add type guards for Phaser.Physics.Arcade.Body
4. **Phase 8**: Enable `noImplicitAny` gradually, file by file
5. **Phase 8**: Eventually enable full `strict` mode
6. **Phase 9-10**: Consider class refactoring and constant extraction

---

## Notes
- All changes are committed to `typescript-typing` branch
- Build verified with `npm run build` - passes successfully
- TypeScript check with `npx tsc --noEmit` reveals ~95 errors remaining for strict mode
- Renamed `src/types/game.d.ts` to `src/types/game.ts` for proper module imports
- All type-only imports converted to `import type` syntax to fix verbatimModuleSyntax warnings