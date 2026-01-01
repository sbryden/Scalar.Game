/**
 * Spawn System
 * Handles spawning of XP orbs
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import playerStatsSystem from './PlayerStatsSystem';
import xpOrbManager from '../xpOrbs';
import type { XPOrb } from '../types/game';

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
    spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
        const orb = scene.add.circle(x, y, 6, 0xFFD700) as XPOrb;
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
        
        gameState.xpOrbs!.add(orb);
        scene.physics.add.collider(orb, gameState.platforms!);
        scene.physics.add.overlap(gameState.player!, orb, (p, o) => {
            const xpOrb = o as XPOrb;
            xpOrbManager.gainXP(xpOrb.xpValue || 25);
            xpOrb.destroy();
        });
    }
    
    /**
     * Upgrade player vehicle sprite based on level and environment
     */
    upgradePlayerCar(): void {
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
     * Handle player level up - upgrade car only
     */
    onPlayerLevelUp(level: number): void {
        this.upgradePlayerCar();
    }
}

// Export singleton instance
export default new SpawnSystem();
