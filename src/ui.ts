let healthBar;
let healthBarBackground;
let xpBar;
let xpBarBackground;

export function createUIElements(scene) {
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

export function updateUIBars(playerStats) {
    const barWidth = 100;
    
    const healthPercent = playerStats.health / playerStats.maxHealth;
    healthBar.setDisplayOrigin(barWidth / 2, 4);
    healthBar.setScale(healthPercent, 1);
    
    const xpPercent = playerStats.xp / playerStats.xpToLevel;
    xpBar.setDisplayOrigin(barWidth / 2, 4);
    xpBar.setScale(xpPercent, 1);
}
