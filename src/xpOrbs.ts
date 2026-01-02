/**
 * XP Orb Module - Re-export of XPOrbManager
 * Provides backward-compatible function exports for the class-based XPOrbManager.
 * 
 * @deprecated This file maintains backward compatibility. Prefer importing from './managers/XPOrbManager'
 */
import xpOrbManager from './managers/XPOrbManager';
import type { PlayerStats } from './types/game';

/**
 * Get the current player stats.
 * 
 * @returns The current player stats including level, health, XP, and stamina
 */
export function getPlayerStats(): PlayerStats {
    return xpOrbManager.getPlayerStats();
}

/**
 * Update player stats.
 * 
 * @param stats - Partial player stats to update
 */
export function updatePlayerStats(stats: PlayerStats): void {
    xpOrbManager.updatePlayerStats(stats);
}

/**
 * Spawn an XP orb at the specified location.
 * 
 * @param scene - The Phaser scene to spawn the orb in
 * @param x - The x-coordinate for the orb spawn position
 * @param y - The y-coordinate for the orb spawn position
 * @param xpValue - The XP value of the orb
 */
export function spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
    xpOrbManager.spawnXPOrb(scene, x, y, xpValue);
}

/**
 * Update XP orb magnetism - attract orbs to player if in range.
 */
export function updateXPOrbMagnetism(): void {
    xpOrbManager.updateXPOrbMagnetism();
}

/**
 * Add XP to the player.
 * 
 * @param amount - The amount of XP to add
 */
export function gainXP(amount: number): void {
    xpOrbManager.gainXP(amount);
}

/**
 * Check if player should level up.
 * 
 * @deprecated This method is kept for backwards compatibility but does nothing.
 * Level up checking is now handled automatically by PlayerStatsSystem.
 */
export function checkLevelUp(): void {
    xpOrbManager.checkLevelUp();
}

/**
 * Apply damage to the player.
 * 
 * @param damage - The amount of damage to apply
 */
export function damagePlayer(damage: number): void {
    xpOrbManager.damagePlayer(damage);
}

// Export the singleton instance as default for direct class access
export default xpOrbManager;
