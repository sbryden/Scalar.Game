## Implementation Plan: Melee Attack System

Based on my analysis of the codebase, here's a comprehensive plan to implement the melee attack mechanism:

## 🎯 Goal
Implement a melee attack mode where:
- Holding **Shift** activates "melee attack mode"
- In melee mode: player takes minimal damage, enemy takes full damage
- Outside melee mode: player takes full damage, enemy only takes damage if player is moving toward them
- Enemy aggro is triggered on collision

## 📋 Implementation Steps

### 1. **Update Type Definitions**
- [ ] Add `isMeleeMode: boolean` to Player interface in [types/game.ts](src/types/game.ts)
- [ ] Add `stunVelocity?: { x: number; y: number }` to Player interface (for existing stun system compatibility)

### 2. **Update Configuration**
- [ ] Add melee attack configuration to [config.ts](src/config.ts):
  - `meleeModeDamageReduction` (e.g., 0.2 for 20% damage taken)
  - `meleeModePlayerDamage` (damage dealt to enemy in melee mode)
  - `passiveModePlayerDamage` (damage dealt when moving toward enemy without melee mode)
  - `requiredApproachSpeed` (minimum velocity toward enemy for passive damage)

### 3. **Update Input Manager**
- [ ] Add Shift key detection in [managers/InputManager.ts](src/managers/InputManager.ts)
- [ ] Track Shift key state (held down vs released)
- [ ] Store melee mode state in `gameState.player.isMeleeMode`
- [ ] Add visual feedback when entering/exiting melee mode (optional: tint or glow effect)

### 4. **Update Combat System Logic**
- [ ] Modify `handlePlayerEnemyCollision()` in [systems/CombatSystem.ts](src/systems/CombatSystem.ts):
  - **Check if player is in melee mode** (`player.isMeleeMode`)
  - **Calculate player's velocity toward enemy** (dot product of velocity vector and direction to enemy)
  - **Apply damage based on mode:**
    - Melee mode: enemy takes full melee damage, player takes reduced damage
    - Non-melee mode moving toward enemy: enemy takes partial damage, player takes full damage
    - Non-melee mode moving away: enemy takes no damage, player takes full damage
  - Keep existing aggro trigger on collision
  - Maintain existing knockback and stun mechanics

### 5. **Helper Function for Movement Direction**
- [ ] Create `isPlayerMovingTowardEnemy()` utility function:
  - Calculate angle from player to enemy
  - Calculate player's current velocity angle
  - Use dot product to determine if player is moving toward (positive) or away (negative)
  - Return true if moving toward with sufficient speed

### 6. **Visual Feedback**
- [ ] Add visual indicator when melee mode is active:
  - Tint player sprite (e.g., add blue/white glow)
  - Add particle effect or aura (optional enhancement)
  - Update HUD to show "MELEE MODE" text (optional)

### 7. **Testing & Balancing**
- [ ] Test melee mode activation/deactivation
- [ ] Test damage calculations in both modes
- [ ] Test movement direction detection accuracy
- [ ] Verify aggro triggers work correctly
- [ ] Balance damage values for gameplay feel
- [ ] Ensure knockback still works properly

## 🔧 Technical Details

### Key Files to Modify:
1. **[src/types/game.ts](src/types/game.ts)** - Add `isMeleeMode` to Player interface
2. **[src/config.ts](src/config.ts)** - Add melee combat config values
3. **[src/managers/InputManager.ts](src/managers/InputManager.ts)** - Track Shift key state
4. **[src/systems/CombatSystem.ts](src/systems/CombatSystem.ts)** - Core collision logic changes

### Current Collision Flow:
```
CollisionManager.setupCollisions() 
  ↓
physics.add.collider(player, enemies, callback)
  ↓
combatSystem.handlePlayerEnemyCollision(player, enemy)
  ↓
Applies damage + knockback to both entities
```

### New Collision Logic:
```typescript
if (player.isMeleeMode) {
  // Player holding Shift - melee attack mode
  enemy.health -= meleeModePlayerDamage;
  player.health -= enemyDamage * meleeModeDamageReduction;
} else {
  // Player not holding Shift - check movement direction
  if (isPlayerMovingTowardEnemy(player, enemy)) {
    enemy.health -= passiveModePlayerDamage;
  }
  player.health -= enemyDamage; // Full damage to player
}
```

### Movement Detection Algorithm:
```typescript
// Calculate if player is moving toward enemy
const directionToEnemy = {
  x: enemy.x - player.x,
  y: enemy.y - player.y
};
const playerVelocity = {
  x: player.body.velocity.x,
  y: player.body.velocity.y
};

// Dot product: positive = moving toward, negative = moving away
const dotProduct = 
  (directionToEnemy.x * playerVelocity.x) + 
  (directionToEnemy.y * playerVelocity.y);

return dotProduct > requiredApproachSpeed;
```

## ⚖️ Recommended Balance Values:
```typescript
PLAYER_COMBAT_CONFIG: {
  baseMeleeDamage: 5,              // Current value
  meleeModePlayerDamage: 15,       // Damage in melee mode (3x base)
  passiveModePlayerDamage: 3,      // Damage when moving toward without melee
  meleeModeDamageReduction: 0.25,  // Player takes 25% damage in melee mode
  requiredApproachSpeed: 50,       // Minimum velocity toward enemy for passive damage
  // ... existing values
}
```

## 📝 Implementation Notes

This plan maintains the existing collision, knockback, and stun systems while adding the new melee attack mechanics on top. The implementation is modular and won't break existing functionality.

### Considerations:
- The movement detection uses dot product for accurate directional checking
- Melee mode provides significant damage reduction to encourage aggressive play
- Passive collision damage (when moving toward enemy) provides minor punishment for careless movement
- All existing systems (aggro, knockback, stun) remain intact
- Visual feedback helps players understand when melee mode is active
