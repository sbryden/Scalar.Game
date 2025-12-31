/**
 * Spawn System
 * Handles spawning of XP orbs and enemy spawning on level up
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import playerStatsSystem from './PlayerStatsSystem';
import { gainXP } from '../xpOrbs';

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
        
        // Disable gravity for orbs in underwater scenes
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        if (isUnderwater) {
            orb.body.setAllowGravity(false);
            // Give orbs a gentle floating motion
            orb.body.setVelocity(
                Phaser.Math.Between(-30, 30),
                Phaser.Math.Between(-30, 30)
            );
        }
        
        gameState.xpOrbs.add(orb);
        scene.physics.add.collider(orb, gameState.platforms);
        scene.physics.add.overlap(gameState.player, orb, (p, o) => {
            gainXP(o.xpValue || 25);
            o.destroy();
        });
    }
    
    /**
     * Upgrade player vehicle sprite based on level and environment
     */
    upgradePlayerCar() {
        if (!gameState.player) return;
        
        const stats = playerStatsSystem.getStats();
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        if (isUnderwater) {
            // Submarines: sub_1, sub_2, sub_3 (level 3+)
            let subLevel = 1;
            if (stats.level >= 3) {
                subLevel = 3;
            } else if (stats.level >= 2) {
                subLevel = 2;
            }
            const subTexture = `sub_${subLevel}`;
            gameState.player.setTexture(subTexture);
        } else {
            // Cars are car_1 through car_5 (levels 1-5)
            const carLevel = Math.min(stats.level, 5);
            const carTexture = `car_${carLevel}`;
            gameState.player.setTexture(carTexture);
        }
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
        
        // Determine enemy type based on current scene
        let enemyType = 'generic';
        if (gameState.currentSceneKey === 'MicroScene') {
            enemyType = 'micro';
        } else if (gameState.currentSceneKey === 'UnderwaterScene') {
            // 80% fish, 20% crabs
            enemyType = Math.random() < 0.8 ? 'fish' : 'crab';
        } else if (gameState.currentSceneKey === 'UnderwaterMicroScene') {
            enemyType = 'plankton';
        }
        
        for (let i = 0; i < enemiesToSpawn; i++) {
            const xOffset = spawnOffsets[i];
            const spawnX = gameState.player.x + xOffset;
            
            // For underwater, spawn fish at various heights, crabs on ground
            let spawnY = 680;
            if (gameState.currentSceneKey === 'UnderwaterScene') {
                if (enemyType === 'fish') {
                    spawnY = 300 + Math.random() * 300; // Random depth
                }
                // Re-roll enemy type for each spawn (80/20 split)
                enemyType = Math.random() < 0.8 ? 'fish' : 'crab';
            } else if (gameState.currentSceneKey === 'UnderwaterMicroScene') {
                spawnY = 300 + Math.random() * 200; // Plankton at various depths
            }
            
            gameState.spawnEnemyFunc(gameState.scene, spawnX, spawnY, enemyType);
        }
    }
}

// Export singleton instance
export default new SpawnSystem();
