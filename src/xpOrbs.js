import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config.js';
import gameState from './utils/gameState.js';
import playerStatsSystem from './systems/PlayerStatsSystem.js';
import spawnSystem from './systems/SpawnSystem.js';
import magnetismSystem from './systems/MagnetismSystem.js';

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
