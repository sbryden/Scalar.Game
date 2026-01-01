import type { PlayerStats } from './types/game';

interface UIElements {
    healthBar: Phaser.GameObjects.Rectangle;
    healthBarBackground: Phaser.GameObjects.Rectangle;
    xpBar: Phaser.GameObjects.Rectangle;
    xpBarBackground: Phaser.GameObjects.Rectangle;
    levelText: Phaser.GameObjects.Text;
}

class UIManager {
    private healthBar: Phaser.GameObjects.Rectangle | null = null;
    private healthBarBackground: Phaser.GameObjects.Rectangle | null = null;
    private xpBar: Phaser.GameObjects.Rectangle | null = null;
    private xpBarBackground: Phaser.GameObjects.Rectangle | null = null;

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

    updateUIBars(playerStats: PlayerStats): void {
        if (!this.healthBar || !this.xpBar) return;
        
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
const uiManager = new UIManager();
export default uiManager;
