/**
 * HUD (Heads-Up Display)
 * Manages health bar, XP bar, stamina bar, fuel bar, and level display
 */
import Phaser from 'phaser';
import { STAMINA_UI_CONFIG, FUEL_UI_CONFIG } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { getFuelSystem } from '../systems/FuelSystem';
import type { PlayerStats } from '../types/game';

export class HUD {
    scene: Phaser.Scene;
    healthBar: Phaser.GameObjects.Rectangle | null;
    healthBarBackground: Phaser.GameObjects.Rectangle | null;
    xpBar: Phaser.GameObjects.Rectangle | null;
    xpBarBackground: Phaser.GameObjects.Rectangle | null;
    staminaBar: Phaser.GameObjects.Rectangle | null;
    staminaBarBackground: Phaser.GameObjects.Rectangle | null;
    fuelBar: Phaser.GameObjects.Rectangle | null;
    fuelBarBackground: Phaser.GameObjects.Rectangle | null;
    fuelCooldownText: Phaser.GameObjects.Text | null;
    levelText: Phaser.GameObjects.Text | null;
    mapLevelText: Phaser.GameObjects.Text | null;
    bossCountText: Phaser.GameObjects.Text | null;
    pauseButton: Phaser.GameObjects.Text | null;
    pauseOverlay: Phaser.GameObjects.Rectangle | null;
    resumeButton: Phaser.GameObjects.Text | null;
    menuButton: Phaser.GameObjects.Text | null;
    isPaused: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.healthBar = null;
        this.healthBarBackground = null;
        this.xpBar = null;
        this.xpBarBackground = null;
        this.staminaBar = null;
        this.staminaBarBackground = null;
        this.fuelBar = null;
        this.fuelBarBackground = null;
        this.fuelCooldownText = null;
        this.levelText = null;
        this.mapLevelText = null;
        this.bossCountText = null;
        this.pauseButton = null;
        this.pauseOverlay = null;
        this.resumeButton = null;
        this.menuButton = null;
        
        this.create();
    }
    
    create(): void {
        const cameraWidth = this.scene.cameras.main.width;
        const cameraHeight = this.scene.cameras.main.height;
        const barWidth = 100;
        const barHeight = 8;
        const barCenterX = cameraWidth / 2;
        const healthBarY = 30;
        const xpBarY = 50;
        const staminaBarY = 70;
        const fuelBarY = 90;
        
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
        
        // Fuel bar
        this.fuelBarBackground = this.scene.add.rectangle(barCenterX, fuelBarY, barWidth, barHeight, 0x333333);
        this.fuelBar = this.scene.add.rectangle(barCenterX, fuelBarY, barWidth, barHeight, FUEL_UI_CONFIG.colors.normal);
        this.fuelBarBackground.setDepth(1000);
        this.fuelBar.setDepth(1000);
        this.fuelBarBackground.setScrollFactor(0);
        this.fuelBar.setScrollFactor(0);
        
        // Fuel cooldown text (shown during initial cooldown)
        this.fuelCooldownText = this.scene.add.text(barCenterX + 60, fuelBarY - 4, '', {
            fontSize: '12px',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        this.fuelCooldownText.setDepth(1000);
        this.fuelCooldownText.setScrollFactor(0);
        this.fuelCooldownText.setVisible(false);
        
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
        
        // Pause button (top-right corner)
        this.pauseButton = this.scene.add.text(cameraWidth - 50, 20, '⏸️', {
            fontSize: '32px',
            color: '#FFFFFF'
        });
        this.pauseButton.setDepth(1000);
        this.pauseButton.setScrollFactor(0);
        this.pauseButton.setInteractive();
        this.pauseButton.on('pointerdown', () => this.togglePause());
        
        // Pause overlay (semi-transparent background)
        this.pauseOverlay = this.scene.add.rectangle(cameraWidth / 2, cameraHeight / 2, cameraWidth, cameraHeight, 0x000000, 0.7);
        this.pauseOverlay.setDepth(1500);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setVisible(false);
        
        // Resume button
        this.resumeButton = this.scene.add.text(cameraWidth / 2, cameraHeight / 2 - 50, 'RESUME', {
            fontSize: '36px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.resumeButton.setDepth(1500);
        this.resumeButton.setScrollFactor(0);
        this.resumeButton.setOrigin(0.5);
        this.resumeButton.setInteractive();
        this.resumeButton.on('pointerdown', () => this.togglePause());
        this.resumeButton.setVisible(false);
        
        // Back to menu button
        this.menuButton = this.scene.add.text(cameraWidth / 2, cameraHeight / 2 + 50, 'MAIN MENU', {
            fontSize: '36px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.menuButton.setDepth(1500);
        this.menuButton.setScrollFactor(0);
        this.menuButton.setOrigin(0.5);
        this.menuButton.setInteractive();
        this.menuButton.on('pointerdown', () => this.goToMainMenu());
        this.menuButton.setVisible(false);
        
        // Add ESC key for pause
        this.scene.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    }
    
    /**
     * Update health, XP, stamina, and fuel bars based on player stats
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
        
        // Update fuel bar
        const fuelSystem = getFuelSystem();
        const fuelPercent = fuelSystem.getFuelPercent();
        this.fuelBar?.setDisplayOrigin(barWidth / 2, 4);
        this.fuelBar?.setScale(fuelPercent, 1);
        
        // Get fuel system state for cooldown display
        const fuelState = fuelSystem.getState();
        
        // Show cooldown text if in initial cooldown
        if (fuelState.initialCooldownRemaining > 0) {
            const cooldownSeconds = fuelSystem.getInitialCooldownSeconds();
            this.fuelCooldownText?.setText(`${cooldownSeconds}s`);
            this.fuelCooldownText?.setVisible(true);
        } else {
            this.fuelCooldownText?.setVisible(false);
        }
        
        // Color code fuel bar based on percentage
        if (fuelPercent <= 0) {
            // Depleted - red
            this.fuelBar?.setFillStyle(FUEL_UI_CONFIG.colors.depleted);
        } else if (fuelPercent > 0 && fuelPercent <= 0.25) {
            // Low fuel threshold - orange
            this.fuelBar?.setFillStyle(FUEL_UI_CONFIG.colors.lowFuel);
        } else {
            // Normal - gold
            this.fuelBar?.setFillStyle(FUEL_UI_CONFIG.colors.normal);
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
        if (this.fuelBar) this.fuelBar.destroy();
        if (this.fuelBarBackground) this.fuelBarBackground.destroy();
        if (this.fuelCooldownText) this.fuelCooldownText.destroy();
        if (this.levelText) this.levelText.destroy();
        if (this.mapLevelText) this.mapLevelText.destroy();
        if (this.bossCountText) this.bossCountText.destroy();
        if (this.pauseButton) this.pauseButton.destroy();
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.resumeButton) this.resumeButton.destroy();
        if (this.menuButton) this.menuButton.destroy();
    }
    
    /**
     * Toggle pause state
     */
    togglePause(): void {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pause the game physics and time
            this.scene.physics.pause();
            this.scene.time.paused = true;
            this.pauseOverlay?.setVisible(true);
            this.resumeButton?.setVisible(true);
            this.menuButton?.setVisible(true);
        } else {
            // Resume the game
            this.scene.physics.resume();
            this.scene.time.paused = false;
            this.pauseOverlay?.setVisible(false);
            this.resumeButton?.setVisible(false);
            this.menuButton?.setVisible(false);
        }
    }
    
    /**
     * Go back to main menu
     */
    goToMainMenu(): void {
        // Resume physics and time first
        this.scene.physics.resume();
        this.scene.time.paused = false;
        // Stop all game scenes and start menu
        this.scene.scene.stop('MainGameScene');
        this.scene.scene.stop('MicroScene');
        this.scene.scene.stop('UnderwaterScene');
        this.scene.scene.stop('UnderwaterMicroScene');
        this.scene.scene.start('MenuScene');
    }
}
