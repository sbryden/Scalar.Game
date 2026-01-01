/**
 * Spawn System
 * Handles spawning of XP orbs
 */
import Phaser from 'phaser';
import gameState from '../utils/gameState';
import playerStatsSystem from './PlayerStatsSystem';
import { gainXP } from '../xpOrbs';
import { XP_CONFIG } from '../config';
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
        const orb = scene.add.circle(x, y, XP_CONFIG.orb.radius, XP_CONFIG.orb.color) as XPOrb;
        scene.physics.add.existing(orb);
        orb.body.setVelocity(
            Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.xRange, XP_CONFIG.orb.spawnVelocity.xRange),
            Phaser.Math.Between(XP_CONFIG.orb.spawnVelocity.yMin, XP_CONFIG.orb.spawnVelocity.yMax)
        );
        orb.body.setCollideWorldBounds(true);
        orb.body.setBounce(XP_CONFIG.orb.bounce, XP_CONFIG.orb.bounce);
        orb.xpValue = xpValue;
        
        // Disable gravity for orbs in underwater scenes
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        if (isUnderwater) {
            orb.body.setAllowGravity(false);
            // Give orbs a gentle floating motion
            orb.body.setVelocity(
                Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.underwaterRange, XP_CONFIG.orb.spawnVelocity.underwaterRange),
                Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.underwaterRange, XP_CONFIG.orb.spawnVelocity.underwaterRange)
            );
        }
        
        gameState.xpOrbs!.add(orb);
        scene.physics.add.collider(orb, gameState.platforms!);
        scene.physics.add.overlap(gameState.player!, orb, (p, o) => {
            const xpOrb = o as XPOrb;
            gainXP(xpOrb.xpValue || XP_CONFIG.orb.defaultValue);
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
            if (stats.level >= XP_CONFIG.vehicleUpgrade.submarineLevel3Threshold) {
                subLevel = 3;
            } else if (stats.level >= XP_CONFIG.vehicleUpgrade.submarineLevel2Threshold) {
                subLevel = 2;
            }
            const subTexture = `sub_${subLevel}`;
            gameState.player.setTexture(subTexture);
        } else {
            // Cars are car_1 through car_5 (levels 1-5)
            const carLevel = Math.min(stats.level, XP_CONFIG.vehicleUpgrade.maxCarLevel);
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
