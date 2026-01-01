/**
 * HUD (Heads-Up Display)
 * Manages health bar, XP bar, stamina bar, and level display
 */
import Phaser from 'phaser';
import type { PlayerStats } from '../types/game';

export class HUD {
    scene: Phaser.Scene;
    healthBar: Phaser.GameObjects.Rectangle | null;
    healthBarBackground: Phaser.GameObjects.Rectangle | null;
    xpBar: Phaser.GameObjects.Rectangle | null;
    xpBarBackground: Phaser.GameObjects.Rectangle | null;
    staminaBar: Phaser.GameObjects.Rectangle | null;
    staminaBarBackground: Phaser.GameObjects.Rectangle | null;
    levelText: Phaser.GameObjects.Text | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.healthBar = null;
        this.healthBarBackground = null;
        this.xpBar = null;
        this.xpBarBackground = null;
        this.staminaBar = null;
        this.staminaBarBackground = null;
        this.levelText = null;
        
        this.create();
    }
    
    create(): void {
        const barWidth = 100;
        const barHeight = 8;
        
        // Health bar
        this.healthBarBackground = this.scene.add.rectangle(512, 30, barWidth, barHeight, 0x333333);
        this.healthBar = this.scene.add.rectangle(512, 30, barWidth, barHeight, 0xFF0000);
        this.healthBarBackground.setDepth(1000);
        this.healthBar.setDepth(1000);
        this.healthBarBackground.setScrollFactor(0);
        this.healthBar.setScrollFactor(0);
        
        // XP bar
        this.xpBarBackground = this.scene.add.rectangle(512, 50, barWidth, barHeight, 0x333333);
        this.xpBar = this.scene.add.rectangle(512, 50, barWidth, barHeight, 0x00FF00);
        this.xpBarBackground.setDepth(1000);
        this.xpBar.setDepth(1000);
        this.xpBarBackground.setScrollFactor(0);
        this.xpBar.setScrollFactor(0);
        
        // Stamina bar
        this.staminaBarBackground = this.scene.add.rectangle(512, 70, barWidth, barHeight, 0x333333);
        this.staminaBar = this.scene.add.rectangle(512, 70, barWidth, barHeight, 0x00BFFF);
        this.staminaBarBackground.setDepth(1000);
        this.staminaBar.setDepth(1000);
        this.staminaBarBackground.setScrollFactor(0);
        this.staminaBar.setScrollFactor(0);
        
        // Level text
        this.levelText = this.scene.add.text(50, 20, 'LEVEL 1', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.levelText.setDepth(1000);
        this.levelText.setScrollFactor(0);
    }
    
    /**
     * Update health, XP, and stamina bars based on player stats
     */
    update(playerStats: PlayerStats): void {
        const barWidth = 100;
        
        // Update health bar
        const healthPercent = playerStats.health / playerStats.maxHealth;
        this.healthBar?.setDisplayOrigin(barWidth / 2, 4);
        this.healthBar?.setScale(healthPercent, 1);
        
        // Update XP bar
        const xpPercent = playerStats.xp / playerStats.xpToLevel;
        this.xpBar?.setDisplayOrigin(barWidth / 2, 4);
        this.xpBar?.setScale(xpPercent, 1);
        
        // Update stamina bar
        const staminaPercent = playerStats.stamina / playerStats.maxStamina;
        this.staminaBar?.setDisplayOrigin(barWidth / 2, 4);
        this.staminaBar?.setScale(staminaPercent, 1);
        
        // Color code stamina bar based on percentage
        if (staminaPercent <= 0) {
            // Depleted - red
            this.staminaBar?.setFillStyle(0xFF0000);
        } else if (staminaPercent <= 0.2) {
            // Exhaustion threshold - orange
            this.staminaBar?.setFillStyle(0xFF8800);
        } else {
            // Normal - blue
            this.staminaBar?.setFillStyle(0x00BFFF);
        }
    }
    
    /**
     * Clean up HUD elements
     */
    destroy(): void {
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBackground) this.healthBarBackground.destroy();
        if (this.xpBar) this.xpBar.destroy();
        if (this.xpBarBackground) this.xpBarBackground.destroy();
        if (this.staminaBar) this.staminaBar.destroy();
        if (this.staminaBarBackground) this.staminaBarBackground.destroy();
        if (this.levelText) this.levelText.destroy();
    }
}
