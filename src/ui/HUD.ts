/**
 * HUD (Heads-Up Display)
 * Manages health bar, XP bar, stamina bar, fuel bar, and level display
 */
import Phaser from 'phaser';
import { STAMINA_UI_CONFIG, FUEL_UI_CONFIG } from '../config';
import stageProgressionSystem from '../systems/StageProgressionSystem';
import { getFuelSystem } from '../systems/FuelSystem';
import type { PlayerStats } from '../types/game';

export class HUD {
    scene: Phaser.Scene;
    healthBar: Phaser.GameObjects.Rectangle | null;
    healthBarBackground: Phaser.GameObjects.Rectangle | null;
    healthLabel: Phaser.GameObjects.Text | null;
    xpBar: Phaser.GameObjects.Rectangle | null;
    xpBarBackground: Phaser.GameObjects.Rectangle | null;
    xpLabel: Phaser.GameObjects.Text | null;
    staminaBar: Phaser.GameObjects.Rectangle | null;
    staminaBarBackground: Phaser.GameObjects.Rectangle | null;
    staminaLabel: Phaser.GameObjects.Text | null;
    fuelBar: Phaser.GameObjects.Rectangle | null;
    fuelBarBackground: Phaser.GameObjects.Rectangle | null;
    fuelLabel: Phaser.GameObjects.Text | null;
    fuelCooldownText: Phaser.GameObjects.Text | null;
    stageText: Phaser.GameObjects.Text | null;
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
        this.healthLabel = null;
        this.xpBar = null;
        this.xpBarBackground = null;
        this.xpLabel = null;
        this.staminaBar = null;
        this.staminaBarBackground = null;
        this.staminaLabel = null;
        this.fuelBar = null;
        this.fuelBarBackground = null;
        this.fuelLabel = null;
        this.fuelCooldownText = null;
        this.stageText = null;
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
        
        // Horizontal top bar layout configuration
        const margin = 80; // Left/right margins
        const totalBarWidth = cameraWidth - (margin * 2);
        const slotWidth = totalBarWidth / 4; // 4 slots: HP, STA, FUEL, XP
        const barHeight = 10;
        const labelY = 8;
        const barY = 32; // Increased spacing for bigger labels
        const barWidthInSlot = slotWidth - 20; // Leave padding between slots
        
        // Label style (pixel-friendly: bold, white with black stroke)
        const labelStyle = {
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        };
        
        // Calculate slot positions (HP, STA, FUEL, XP order)
        const slot1X = margin + slotWidth * 0.5; // HP slot
        const slot2X = margin + slotWidth * 1.5; // STA slot
        const slot3X = margin + slotWidth * 2.5; // FUEL slot
        const slot4X = margin + slotWidth * 3.5; // XP slot
        
        // --- HEALTH SLOT (HP) ---
        this.healthLabel = this.scene.add.text(slot1X, labelY, 'HP', labelStyle);
        this.healthLabel.setOrigin(0.5, 0);
        this.healthLabel.setDepth(1000);
        this.healthLabel.setScrollFactor(0);
        
        this.healthBarBackground = this.scene.add.rectangle(slot1X, barY, barWidthInSlot, barHeight, 0x333333);
        this.healthBar = this.scene.add.rectangle(slot1X, barY, barWidthInSlot, barHeight, 0xFF0000);
        this.healthBarBackground.setDepth(1000);
        this.healthBar.setDepth(1000);
        this.healthBarBackground.setScrollFactor(0);
        this.healthBar.setScrollFactor(0);
        
        // --- STAMINA SLOT (STA) ---
        this.staminaLabel = this.scene.add.text(slot2X, labelY, 'STA', labelStyle);
        this.staminaLabel.setOrigin(0.5, 0);
        this.staminaLabel.setDepth(1000);
        this.staminaLabel.setScrollFactor(0);
        
        this.staminaBarBackground = this.scene.add.rectangle(slot2X, barY, barWidthInSlot, barHeight, 0x333333);
        this.staminaBar = this.scene.add.rectangle(slot2X, barY, barWidthInSlot, barHeight, STAMINA_UI_CONFIG.colors.normal);
        this.staminaBarBackground.setDepth(1000);
        this.staminaBar.setDepth(1000);
        this.staminaBarBackground.setScrollFactor(0);
        this.staminaBar.setScrollFactor(0);
        
        // --- FUEL SLOT (FUEL) ---
        this.fuelLabel = this.scene.add.text(slot3X, labelY, 'FUEL', labelStyle);
        this.fuelLabel.setOrigin(0.5, 0);
        this.fuelLabel.setDepth(1000);
        this.fuelLabel.setScrollFactor(0);
        
        this.fuelBarBackground = this.scene.add.rectangle(slot3X, barY, barWidthInSlot, barHeight, 0x333333);
        this.fuelBar = this.scene.add.rectangle(slot3X, barY, barWidthInSlot, barHeight, FUEL_UI_CONFIG.colors.normal);
        this.fuelBarBackground.setDepth(1000);
        this.fuelBar.setDepth(1000);
        this.fuelBarBackground.setScrollFactor(0);
        this.fuelBar.setScrollFactor(0);
        
        // Fuel cooldown text (shown during initial cooldown, positioned near fuel bar)
        this.fuelCooldownText = this.scene.add.text(slot3X, barY + 15, '', {
            fontSize: '12px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.fuelCooldownText.setOrigin(0.5, 0);
        this.fuelCooldownText.setDepth(1000);
        this.fuelCooldownText.setScrollFactor(0);
        this.fuelCooldownText.setVisible(false);
        
        // --- XP SLOT (LEVEL) ---
        this.xpLabel = this.scene.add.text(slot4X, labelY, 'LEVEL: 1', labelStyle);
        this.xpLabel.setOrigin(0.5, 0);
        this.xpLabel.setDepth(1000);
        this.xpLabel.setScrollFactor(0);
        
        this.xpBarBackground = this.scene.add.rectangle(slot4X, barY, barWidthInSlot, barHeight, 0x333333);
        this.xpBar = this.scene.add.rectangle(slot4X, barY, barWidthInSlot, barHeight, 0x00FF00);
        this.xpBarBackground.setDepth(1000);
        this.xpBar.setDepth(1000);
        this.xpBarBackground.setScrollFactor(0);
        this.xpBar.setScrollFactor(0);
        
        // --- AUXILIARY HUD ELEMENTS ---
        
        // Stage text - positioned at bottom right
        const currentStage = stageProgressionSystem.getCurrentStage();
        this.stageText = this.scene.add.text(cameraWidth - 15, cameraHeight - 15, `STAGE ${currentStage}`, {
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.stageText.setOrigin(1, 1); // Anchor to bottom right
        this.stageText.setDepth(1000);
        this.stageText.setScrollFactor(0);
        
        // Boss count text (only visible in boss mode) - positioned on the left side
        this.bossCountText = this.scene.add.text(15, 50, '', {
            fontSize: '16px',
            color: '#FF6B6B',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.bossCountText.setDepth(1000);
        this.bossCountText.setScrollFactor(0);
        this.bossCountText.setVisible(false);
        
        // Pause button (top-right corner)
        this.pauseButton = this.scene.add.text(cameraWidth - 40, 15, '⏸️', {
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
        const cameraWidth = this.scene.cameras.main.width;
        const margin = 80;
        const totalBarWidth = cameraWidth - (margin * 2);
        const slotWidth = totalBarWidth / 4;
        const barWidthInSlot = slotWidth - 20;
        
        // Update health bar
        const healthPercent = playerStats.health / playerStats.maxHealth;
        this.healthBar?.setDisplayOrigin(barWidthInSlot / 2, 5);
        this.healthBar?.setScale(healthPercent, 1);
        
        // Update stamina bar
        const staminaPercent = playerStats.stamina / playerStats.maxStamina;
        this.staminaBar?.setDisplayOrigin(barWidthInSlot / 2, 5);
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
        this.fuelBar?.setDisplayOrigin(barWidthInSlot / 2, 5);
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
        
        // Update XP bar
        const xpPercent = playerStats.xp / playerStats.xpToLevel;
        this.xpBar?.setDisplayOrigin(barWidthInSlot / 2, 5);
        this.xpBar?.setScale(xpPercent, 1);
        
        // Update XP label to show current player level
        this.xpLabel?.setText(`LEVEL: ${playerStats.level}`);
        
        // Update stage text
        const currentStage = stageProgressionSystem.getCurrentStage();
        this.stageText?.setText(`STAGE ${currentStage}`);
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
        if (this.healthLabel) this.healthLabel.destroy();
        if (this.xpBar) this.xpBar.destroy();
        if (this.xpBarBackground) this.xpBarBackground.destroy();
        if (this.xpLabel) this.xpLabel.destroy();
        if (this.staminaBar) this.staminaBar.destroy();
        if (this.staminaBarBackground) this.staminaBarBackground.destroy();
        if (this.staminaLabel) this.staminaLabel.destroy();
        if (this.fuelBar) this.fuelBar.destroy();
        if (this.fuelBarBackground) this.fuelBarBackground.destroy();
        if (this.fuelLabel) this.fuelLabel.destroy();
        if (this.fuelCooldownText) this.fuelCooldownText.destroy();
        if (this.stageText) this.stageText.destroy();
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
