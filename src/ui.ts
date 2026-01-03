/**
 * UI Manager
 * Manages basic UI elements including health and XP bars.
 * Singleton pattern for consistent state management across the game.
 * 
 * Note: This module is legacy code. Modern UI is handled by HUD class in src/ui/HUD.ts.
 */
import type { PlayerStats } from './types/game';

/**
 * Interface for UI elements created by the manager
 */
export interface UIElements {
    healthBar: Phaser.GameObjects.Rectangle;
    healthBarBackground: Phaser.GameObjects.Rectangle;
    xpBar: Phaser.GameObjects.Rectangle;
    xpBarBackground: Phaser.GameObjects.Rectangle;
    levelText: Phaser.GameObjects.Text;
}

class UIManager {
    private healthBar: Phaser.GameObjects.Rectangle | null;
    private healthBarBackground: Phaser.GameObjects.Rectangle | null;
    private xpBar: Phaser.GameObjects.Rectangle | null;
    private xpBarBackground: Phaser.GameObjects.Rectangle | null;

    constructor() {
        // Initialize UI element properties to null - elements are created per scene
        this.healthBar = null;
        this.healthBarBackground = null;
        this.xpBar = null;
        this.xpBarBackground = null;
    }

    /**
     * Create UI elements in the specified scene.
     * Creates health bar, XP bar, and level text display.
     * 
     * @param scene - The Phaser scene to create UI elements in
     * @returns Object containing references to all created UI elements
     */
    createUIElements(scene: Phaser.Scene): UIElements {
        const barWidth = 100;
        const barHeight = 8;
        
        this.healthBarBackground = scene.add.rectangle(512, 30, barWidth, barHeight, 0x333333);
        this.healthBar = scene.add.rectangle(512, 30, barWidth, barHeight, 0xFF0000);
        this.healthBarBackground.setDepth(1000);
        this.healthBar.setDepth(1000);
        this.healthBarBackground.setScrollFactor(0);
        this.healthBar.setScrollFactor(0);
        
        this.xpBarBackground = scene.add.rectangle(512, 50, barWidth, barHeight, 0x333333);
        this.xpBar = scene.add.rectangle(512, 50, barWidth, barHeight, 0x00FF00);
        this.xpBarBackground.setDepth(1000);
        this.xpBar.setDepth(1000);
        this.xpBarBackground.setScrollFactor(0);
        this.xpBar.setScrollFactor(0);
        
        const levelText = scene.add.text(50, 20, `LEVEL 1`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        levelText.setDepth(1000);
        levelText.setScrollFactor(0);
        
        return { 
            healthBar: this.healthBar, 
            healthBarBackground: this.healthBarBackground, 
            xpBar: this.xpBar, 
            xpBarBackground: this.xpBarBackground, 
            levelText 
        };
    }

    /**
     * Update the health and XP bars based on current player stats.
     * Scales the bars to reflect current health and XP percentages.
     * 
     * @param playerStats - Current player stats containing health, maxHealth, xp, and xpToLevel
     */
    updateUIBars(playerStats: PlayerStats): void {
        // Check if UI elements are initialized (only need to check the bars that are updated)
        if (!this.healthBar || !this.xpBar) {
            console.warn('UIManager: UI elements not initialized. Call createUIElements first.');
            return;
        }

        const barWidth = 100;
        
        const healthPercent = playerStats.health / playerStats.maxHealth;
        this.healthBar.setDisplayOrigin(barWidth / 2, 4);
        this.healthBar.setScale(healthPercent, 1);
        
        const xpPercent = playerStats.xp / playerStats.xpToLevel;
        this.xpBar.setDisplayOrigin(barWidth / 2, 4);
        this.xpBar.setScale(xpPercent, 1);
    }
}

// Export singleton instance
export default new UIManager();
