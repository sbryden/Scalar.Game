# Plan: Jet Mech Power-Up on Level-Up

Implement a transformative power-up that becomes available after every player level-up starting at level 3 (after reaching level 2). The player can activate it within 15 seconds by pressing Enter. The player becomes a jet mech with water-style flight mechanics, cannonball projectiles, and a separate health pool (1000 HP) that decays over 60 seconds (~16.67 HP/sec) plus enemy damage. During transformation, player stats are preserved and continue to regenerate.

## Pre-requisites

0. **Update XP scaling** in [src/config/progression.ts](src/config/progression.ts): Set base XP requirement for level 1→2 to `750`, and `xpScalingFactor` to `1.25` (25% increase each level).

## Steps

1. **Add Jet Mech state to player types** in [src/types/game.ts](src/types/game.ts): Add `isJetMechMode`, `mechHealth`, `mechMaxHealth`, `mechAbilityAvailable`, `mechAbilityExpiresAt` properties to `PlayerStats` interface.

2. **Create Jet Mech config** in [src/config/combat.ts](src/config/combat.ts): Add `JET_MECH_CONFIG` with `maxHealth: 1000`, `healthDecayPerSecond: 16.67` (1000/60), `scale: 0.4` (boss-sized), `thrustPower` (similar to underwater), `projectileKey: 'land/jet_mech_projectile'`, `abilityWindowSeconds: 15`.

3. **Extend PlayerStatsSystem** in [src/systems/PlayerStatsSystem.ts](src/systems/PlayerStatsSystem.ts): Add `makeJetMechAvailable()`, `activateJetMech()`, `deactivateJetMech()`, `updateMechHealth(delta)`, `isJetMechAvailable()`, `isJetMechActive()`, `resetJetMechState()` methods. In `deactivateJetMech()`, add early return guard if `!isJetMechMode` to prevent double-call. Modify `takeDamage()` to redirect damage to mech health when active. Continue player health/stamina regen during mech mode. If player levels up while mech is active, reset mech health to full (1000 HP).

4. **Make ability available on level-up** in [src/managers/PlayerManager.ts](src/managers/PlayerManager.ts): Extend `onPlayerLevelUp()` callback: when `level > 2`, call `makeJetMechAvailable()` which sets `mechAbilityAvailable = true` and `mechAbilityExpiresAt = now + 15 seconds`. If mech is already active, reset mech health to full (1000 HP) instead.

5. **Add Enter key to activate mech** in [src/managers/InputManager.ts](src/managers/InputManager.ts): Listen for Enter key; when pressed and `isJetMechAvailable()` is true, call `activateJetMech()`, swap texture to `land/jet_mech`, scale up sprite.

6. **Implement water-style flight mechanics** in [src/managers/InputManager.ts](src/managers/InputManager.ts): When mech mode active, use water-style movement: holding jump/W/Space applies continuous upward thrust, holding S/Down applies downward thrust. No traditional jumping. Horizontal movement unchanged (A/D).

7. **Add cannonball projectile** in [src/managers/ProjectileManager.ts](src/managers/ProjectileManager.ts) and [src/config/combat.ts](src/config/combat.ts): Use `land/jet_mech_projectile` texture; modify `fireProjectile()` to use this projectile when in mech mode.

8. **Update HUD for mech availability** in [src/ui/HUD.ts](src/ui/HUD.ts): When `mechAbilityAvailable` is true (and mech not yet active), display flashing green text beneath XP bar: "Special Ability Available!" and "Press Enter to Activate". Update each frame to expire availability after 15 seconds.

9. **Update HUD for mech mode** in [src/ui/HUD.ts](src/ui/HUD.ts): When `isJetMechMode` is active, hide the 4 standard bars (health, stamina, fuel, XP) and display a single mech health bar spanning the combined width of all 4 bars; restore original bars when mech deactivates.

10. **Handle mech death** in [src/managers/PlayerManager.ts](src/managers/PlayerManager.ts): When mech health reaches 0, call `deactivateJetMech()`, restore player texture/scale, then trigger the same respawn behavior as death (player falls in from the top of the screen).

11. **Reset mech state on scene change** in [src/scenes/BaseGameScene.ts](src/scenes/BaseGameScene.ts) or scene `create()`: Call `resetJetMechState()` to clear `isJetMechMode`, `mechAbilityAvailable`, and restore player to normal mode. Ensures player returns to normal state when transitioning between scenes.

## Further Considerations

1. **Mech health decay timing**: Use scene's `update()` delta in `PlayerStatsSystem.updateMechHealth(delta)` for frame-rate independent decay.
