/**
 * Enemy Module - Re-export of EnemyManager
 * Provides backward-compatible function exports for the class-based EnemyManager.
 * 
 * @deprecated This file maintains backward compatibility. Prefer importing from './managers/EnemyManager'
 */
import enemyManager from './managers/EnemyManager';
import type { Enemy, Projectile } from './types/game';

/**
 * Helper function to check if an enemy type is a swimming enemy.
 * Swimming enemies can move freely in all directions and don't have gravity.
 * 
 * @param enemyType - The type identifier of the enemy
 * @returns True if the enemy is a swimming type
 */
export function isSwimmingEnemy(enemyType: string): boolean {
    return enemyManager.isSwimmingEnemy(enemyType);
}

/**
 * Spawn a new enemy at the specified location.
 * Applies difficulty and level-based multipliers to enemy stats.
 * 
 * @param scene - The Phaser scene to spawn the enemy in
 * @param x - The x-coordinate for the enemy spawn position
 * @param y - The y-coordinate for the enemy spawn position
 * @param enemyType - The type of enemy to spawn (default: "generic")
 * @returns The spawned Enemy sprite
 * @throws Error if enemy type is unknown or gameState.enemies is not initialized
 */
export function spawnEnemy(scene: Phaser.Scene, x: number, y: number, enemyType: string = "generic"): Enemy {
    return enemyManager.spawnEnemy(scene, x, y, enemyType);
}

/**
 * Update enemy AI behavior for a single enemy.
 * Handles chase detection, AI state transitions, and delegates to appropriate AI functions.
 * 
 * @param enemy - The enemy to update
 * @param gameTime - Current game time in milliseconds
 */
export function updateEnemyAI(enemy: Enemy, gameTime: number): void {
    enemyManager.updateEnemyAI(enemy, gameTime);
}

/**
 * Apply damage to an enemy from a projectile.
 * Delegates to the combat system for actual damage handling.
 * 
 * @param projectile - The projectile that hit the enemy
 * @param enemy - The enemy that was hit
 */
export async function damageEnemy(projectile: Projectile, enemy: Enemy): Promise<void> {
    return enemyManager.damageEnemy(projectile, enemy);
}

// Export the singleton instance as default for direct class access
export default enemyManager;
