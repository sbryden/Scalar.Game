import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import spawnSystem from './systems/SpawnSystem';
import magnetismSystem from './systems/MagnetismSystem';
import type { PlayerStats } from './types/game';

class XPOrbManager {
    getPlayerStats(): PlayerStats { 
        return playerStatsSystem.getStats(); 
    }
    
    updatePlayerStats(stats: PlayerStats): void { 
        playerStatsSystem.setStats(stats); 
    }

    spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
        spawnSystem.spawnXPOrb(scene, x, y, xpValue);
    }

    updateXPOrbMagnetism(): void {
        magnetismSystem.update();
    }

    gainXP(amount: number): void {
        playerStatsSystem.gainXP(amount);
    }

    checkLevelUp(): void {
        // Deprecated - now handled by PlayerStatsSystem
        // Kept for backwards compatibility but does nothing
    }

    damagePlayer(damage: number): void {
        playerStatsSystem.takeDamage(damage);
    }
}

// Export singleton instance
const xpOrbManager = new XPOrbManager();
export default xpOrbManager;
