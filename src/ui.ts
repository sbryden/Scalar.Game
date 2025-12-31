import type { PlayerStats } from './types/game';

let healthBar: Phaser.GameObjects.Rectangle;
let healthBarBackground: Phaser.GameObjects.Rectangle;
let xpBar: Phaser.GameObjects.Rectangle;
let xpBarBackground: Phaser.GameObjects.Rectangle;

interface UIElements {
    healthBar: Phaser.GameObjects.Rectangle;
    healthBarBackground: Phaser.GameObjects.Rectangle;
    xpBar: Phaser.GameObjects.Rectangle;
    xpBarBackground: Phaser.GameObjects.Rectangle;
    levelText: Phaser.GameObjects.Text;
}

export function createUIElements(scene: Phaser.Scene): UIElements {
    const barWidth = 100;
    const barHeight = 8;
    
    healthBarBackground = scene.add.rectangle(512, 30, barWidth, barHeight, 0x333333);
    healthBar = scene.add.rectangle(512, 30, barWidth, barHeight, 0xFF0000);
    healthBarBackground.setDepth(1000);
    healthBar.setDepth(1000);
    healthBarBackground.setScrollFactor(0);
    healthBar.setScrollFactor(0);
    
    xpBarBackground = scene.add.rectangle(512, 50, barWidth, barHeight, 0x333333);
    xpBar = scene.add.rectangle(512, 50, barWidth, barHeight, 0x00FF00);
    xpBarBackground.setDepth(1000);
    xpBar.setDepth(1000);
    xpBarBackground.setScrollFactor(0);
    xpBar.setScrollFactor(0);
    
    const levelText = scene.add.text(50, 20, `LEVEL 1`, {
        fontSize: '24px',
        color: '#FFFFFF',
        fontStyle: 'bold'
    });
    levelText.setDepth(1000);
    levelText.setScrollFactor(0);
    
    return { healthBar, healthBarBackground, xpBar, xpBarBackground, levelText };
}

export function updateUIBars(playerStats: PlayerStats): void {
    const barWidth = 100;
    
    const healthPercent = playerStats.health / playerStats.maxHealth;
    healthBar.setDisplayOrigin(barWidth / 2, 4);
    healthBar.setScale(healthPercent, 1);
    
    const xpPercent = playerStats.xp / playerStats.xpToLevel;
    xpBar.setDisplayOrigin(barWidth / 2, 4);
    xpBar.setScale(xpPercent, 1);
}
