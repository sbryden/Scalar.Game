/**
 * HUD (Heads-Up Display)
 * Manages health bar, XP bar, and level display
 */
export class HUD {
    scene: any;
    healthBar: any;
    healthBarBackground: any;
    xpBar: any;
    xpBarBackground: any;
    levelText: any;

    constructor(scene) {
        this.scene = scene;
        this.healthBar = null;
        this.healthBarBackground = null;
        this.xpBar = null;
        this.xpBarBackground = null;
        this.levelText = null;
        
        this.create();
    }
    
    create() {
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
     * Update health and XP bars based on player stats
     */
    update(playerStats) {
        const barWidth = 100;
        
        // Update health bar
        const healthPercent = playerStats.health / playerStats.maxHealth;
        this.healthBar.setDisplayOrigin(barWidth / 2, 4);
        this.healthBar.setScale(healthPercent, 1);
        
        // Update XP bar
        const xpPercent = playerStats.xp / playerStats.xpToLevel;
        this.xpBar.setDisplayOrigin(barWidth / 2, 4);
        this.xpBar.setScale(xpPercent, 1);
    }
    
    /**
     * Clean up HUD elements
     */
    destroy() {
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBackground) this.healthBarBackground.destroy();
        if (this.xpBar) this.xpBar.destroy();
        if (this.xpBarBackground) this.xpBarBackground.destroy();
        if (this.levelText) this.levelText.destroy();
    }
}
