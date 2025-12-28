/**
 * Spawn System
 * Handles spawning of XP orbs and enemy spawning on level up
 */
import gameState from '../utils/gameState.js';
import playerStatsSystem from './PlayerStatsSystem.js';
import { gainXP } from '../xpOrbs.js';

export class SpawnSystem {
    constructor() {
        // Setup level up callback
        playerStatsSystem.setLevelUpCallback((level) => {
            this.onPlayerLevelUp(level);
        });
    }
    
    /**
     * Spawn an XP orb at the given location
     */
    spawnXPOrb(scene, x, y, xpValue) {
        const orb = scene.add.circle(x, y, 6, 0xFFD700);
        scene.physics.add.existing(orb);
        orb.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-100, -50)
        );
        orb.body.setCollideWorldBounds(true);
        orb.body.setBounce(0.5, 0.5);
        orb.xpValue = xpValue;
        
        gameState.xpOrbs.add(orb);
        scene.physics.add.collider(orb, gameState.platforms);
        scene.physics.add.overlap(gameState.player, orb, (p, o) => {
            gainXP(o.xpValue || 25);
            o.destroy();
        });
    }
    
    /**
     * Upgrade player car sprite based on level
     */
    upgradePlayerCar() {
        if (!gameState.player) return;
        
        const stats = playerStatsSystem.getStats();
        
        // Cars are car_1 through car_5 (levels 1-5)
        const carLevel = Math.min(stats.level, 5);
        const carTexture = `car_${carLevel}`;
        
        gameState.player.setTexture(carTexture);
    }
    
    /**
     * Handle player level up - upgrade car and spawn enemies
     */
    onPlayerLevelUp(level) {
        this.upgradePlayerCar();
        this.spawnEnemiesOnLevelUp();
    }
    
    /**
     * Spawn additional enemies when player levels up
     */
    spawnEnemiesOnLevelUp() {
        if (!gameState.spawnEnemyFunc || !gameState.scene || !gameState.player) {
            return;
        }
        
        const stats = playerStatsSystem.getStats();
        const enemiesToSpawn = Math.min(stats.level - 1, 3); // Spawn 0-3 additional enemies
        const spawnOffsets = [300, 800, 1600];
        
        for (let i = 0; i < enemiesToSpawn; i++) {
            const xOffset = spawnOffsets[i];
            const spawnX = gameState.player.x + xOffset;
            gameState.spawnEnemyFunc(gameState.scene, spawnX, 680);
        }
    }
}

// Export singleton instance
export default new SpawnSystem();
