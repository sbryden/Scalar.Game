/**
 * XP Orb Manager
 * Manages all XP orb-related functionality including spawning, magnetism, and player stats.
 * Singleton pattern for consistent state management across the game.
 */
import spawnSystem from '../systems/SpawnSystem';
import magnetismSystem from '../systems/MagnetismSystem';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import type { PlayerStats } from '../types/game';

class XPOrbManager {
    constructor() {
        // No state to initialize - XP orb data is managed through gameState.xpOrbs group
        // Player stats are managed through PlayerStatsSystem
    }

    /**
     * Get the current player stats.
     * Delegates to PlayerStatsSystem for state management.
     * 
     * @returns The current player stats including level, health, XP, and stamina
     */
    getPlayerStats(): PlayerStats {
        return playerStatsSystem.getStats();
    }

    /**
     * Update player stats.
     * Delegates to PlayerStatsSystem for state management.
     * 
     * @param stats - Partial player stats to update
     */
    updatePlayerStats(stats: Partial<PlayerStats>): void {
        playerStatsSystem.setStats(stats);
    }

    /**
     * Spawn an XP orb at the specified location.
     * Delegates to SpawnSystem for spawning logic.
     * 
     * @param scene - The Phaser scene to spawn the orb in
     * @param x - The x-coordinate for the orb spawn position
     * @param y - The y-coordinate for the orb spawn position
     * @param xpValue - The XP value of the orb
     */
    spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
        spawnSystem.spawnXPOrb(scene, x, y, xpValue);
    }

    /**
     * Update XP orb magnetism - attract orbs to player if in range.
     * Delegates to MagnetismSystem for magnetism logic.
     */
    updateXPOrbMagnetism(): void {
        magnetismSystem.update();
    }

    /**
     * Add XP to the player.
     * Delegates to PlayerStatsSystem for XP management.
     * 
     * @param amount - The amount of XP to add
     */
    gainXP(amount: number): void {
        playerStatsSystem.gainXP(amount);
    }

    /**
     * Check if player should level up.
     * Delegates to PlayerStatsSystem for level progression.
     * 
     * @deprecated This method is kept for backwards compatibility but does nothing.
     * Level up checking is now handled automatically by PlayerStatsSystem.
     */
    checkLevelUp(): void {
        // Deprecated - now handled by PlayerStatsSystem
        // Kept for backwards compatibility but does nothing
    }

    /**
     * Apply damage to the player.
     * Delegates to PlayerStatsSystem for damage handling.
     * 
     * @param damage - The amount of damage to apply
     */
    damagePlayer(damage: number): void {
        playerStatsSystem.takeDamage(damage);
    }
}

// Export singleton instance
export default new XPOrbManager();
