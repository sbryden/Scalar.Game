import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import spawnSystem from './systems/SpawnSystem';
import magnetismSystem from './systems/MagnetismSystem';
import type { PlayerStats } from './types/game';

export function getPlayerStats(): PlayerStats { return playerStatsSystem.getStats(); }
export function updatePlayerStats(stats: PlayerStats): void { playerStatsSystem.setStats(stats); }

// Re-export spawn functions for backwards compatibility
export function spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
    spawnSystem.spawnXPOrb(scene, x, y, xpValue);
}

export function updateXPOrbMagnetism(): void {
    magnetismSystem.update();
}

export function gainXP(amount: number): void {
    playerStatsSystem.gainXP(amount);
}

export function checkLevelUp(): void {
    // Deprecated - now handled by PlayerStatsSystem
    // Kept for backwards compatibility but does nothing
}

export function damagePlayer(damage: number): void {
    playerStatsSystem.takeDamage(damage);
}
