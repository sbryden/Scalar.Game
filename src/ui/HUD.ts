/**
 * HUD (Heads-Up Display)
 * Manages health bar, XP bar, stamina bar, and level display
 */
import Phaser from 'phaser';
import { STAMINA_UI_CONFIG } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
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
    mapLevelText: Phaser.GameObjects.Text | null;
    bossCountText: Phaser.GameObjects.Text | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.healthBar = null;
        this.healthBarBackground = null;
        this.xpBar = null;
        this.xpBarBackground = null;
        this.staminaBar = null;
        this.staminaBarBackground = null;
        this.levelText = null;
        this.mapLevelText = null;
        this.bossCountText = null;
        
        this.create();
    }
    
    create(): void {
        const barWidth = 100;
        const barHeight = 8;
        const barCenterX = 512;
        const healthBarY = 30;
        const xpBarY = 50;
        const staminaBarY = 70;
        
        // Health bar
        this.healthBarBackground = this.scene.add.rectangle(barCenterX, healthBarY, barWidth, barHeight, 0x333333);
        this.healthBar = this.scene.add.rectangle(barCenterX, healthBarY, barWidth, barHeight, 0xFF0000);
        this.healthBarBackground.setDepth(1000);
        this.healthBar.setDepth(1000);
        this.healthBarBackground.setScrollFactor(0);
        this.healthBar.setScrollFactor(0);
        
        // XP bar
        this.xpBarBackground = this.scene.add.rectangle(barCenterX, xpBarY, barWidth, barHeight, 0x333333);
        this.xpBar = this.scene.add.rectangle(barCenterX, xpBarY, barWidth, barHeight, 0x00FF00);
        this.xpBarBackground.setDepth(1000);
        this.xpBar.setDepth(1000);
        this.xpBarBackground.setScrollFactor(0);
        this.xpBar.setScrollFactor(0);
        
        // Stamina bar
        this.staminaBarBackground = this.scene.add.rectangle(barCenterX, staminaBarY, barWidth, barHeight, 0x333333);
        this.staminaBar = this.scene.add.rectangle(barCenterX, staminaBarY, barWidth, barHeight, STAMINA_UI_CONFIG.colors.normal);
        this.staminaBarBackground.setDepth(1000);
        this.staminaBar.setDepth(1000);
        this.staminaBarBackground.setScrollFactor(0);
        this.staminaBar.setScrollFactor(0);
        
        // Level text (player level)
        this.levelText = this.scene.add.text(50, 20, 'LEVEL 1', {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.levelText.setDepth(1000);
        this.levelText.setScrollFactor(0);
        
        // Map level text
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        this.mapLevelText = this.scene.add.text(50, 50, `MAP ${mapLevel}`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        this.mapLevelText.setDepth(1000);
        this.mapLevelText.setScrollFactor(0);
        
        // Boss count text (only visible in boss mode)
        this.bossCountText = this.scene.add.text(50, 80, '', {
            fontSize: '20px',
            color: '#FF6B6B',
            fontStyle: 'bold'
        });
        this.bossCountText.setDepth(1000);
        this.bossCountText.setScrollFactor(0);
        this.bossCountText.setVisible(false);
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
            this.staminaBar?.setFillStyle(STAMINA_UI_CONFIG.colors.depleted);
        } else if (staminaPercent <= 0.2) {
            // Exhaustion threshold - orange
            this.staminaBar?.setFillStyle(STAMINA_UI_CONFIG.colors.exhaustion);
        } else {
            // Normal - blue
            this.staminaBar?.setFillStyle(STAMINA_UI_CONFIG.colors.normal);
        }
        
        // Update map level text
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        this.mapLevelText?.setText(`MAP ${mapLevel}`);
    }
    
    /**
     * Update boss count display (only shown in boss mode)
     */
    updateBossCount(defeated: number, total: number): void {
        if (this.bossCountText) {
            this.bossCountText.setText(`BOSSES: ${defeated}/${total}`);
            this.bossCountText.setVisible(true);
        }
    }
    
    /**
     * Hide boss count display (for normal mode)
     */
    hideBossCount(): void {
        this.bossCountText?.setVisible(false);
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
        if (this.mapLevelText) this.mapLevelText.destroy();
        if (this.bossCountText) this.bossCountText.destroy();
    }
}
