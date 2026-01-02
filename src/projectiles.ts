/**
 * Projectile Module - Re-export of ProjectileManager
 * Provides backward-compatible function exports for the class-based ProjectileManager.
 * 
 * @deprecated This file maintains backward compatibility. Prefer importing from './managers/ProjectileManager'
 */
import projectileManager from './managers/ProjectileManager';
import type { WASDKeys, Enemy } from './types/game';

/**
 * Set the input references for projectile firing.
 * Stores cursor keys and WASD keys in gameState for direction detection.
 * 
 * @param c - The cursor keys from Phaser input
 * @param w - The WASD keys from Phaser input
 */
export function setInputs(c: Phaser.Types.Input.Keyboard.CursorKeys, w: WASDKeys): void {
    projectileManager.setInputs(c, w);
}

/**
 * Fire a projectile from the player.
 * Handles cooldown, direction detection, underwater behavior, and stats tracking.
 * 
 * @param scene - The Phaser scene to spawn the projectile in
 */
export function fireProjectile(scene: Phaser.Scene): void {
    projectileManager.fireProjectile(scene);
}

/**
 * Update all active projectiles.
 * Destroys projectiles that exceed their max range or go off-world.
 */
export function updateProjectiles(): void {
    projectileManager.updateProjectiles();
}

/**
 * Fire an enemy projectile from an enemy toward the player.
 * Handles range checking, cooldown, and direction calculation.
 * 
 * @param scene - The Phaser scene to spawn the projectile in
 * @param enemy - The enemy firing the projectile
 * @param gameTime - Current game time in milliseconds
 */
export function fireEnemyProjectile(scene: Phaser.Scene, enemy: Enemy, gameTime: number): void {
    projectileManager.fireEnemyProjectile(scene, enemy, gameTime);
}

// Export the singleton instance as default for direct class access
export default projectileManager;
