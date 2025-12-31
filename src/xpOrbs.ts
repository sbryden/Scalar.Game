import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import spawnSystem from './systems/SpawnSystem';
import magnetismSystem from './systems/MagnetismSystem';

export function getPlayerStats() { return playerStatsSystem.getStats(); }
export function updatePlayerStats(stats) { playerStatsSystem.setStats(stats); }

// Re-export spawn functions for backwards compatibility
export function spawnXPOrb(scene, x, y, xpValue) {
    spawnSystem.spawnXPOrb(scene, x, y, xpValue);
}

export function updateXPOrbMagnetism() {
    magnetismSystem.update();
}

export function gainXP(amount) {
    playerStatsSystem.gainXP(amount);
}

export function checkLevelUp() {
    // Deprecated - now handled by PlayerStatsSystem
    // Kept for backwards compatibility but does nothing
}

export function damagePlayer(damage) {
    playerStatsSystem.takeDamage(damage);
}
