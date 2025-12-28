import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, ENEMY_CONFIG } from './config.js';
import gameState from './utils/gameState.js';

export function getPlayerSize() { return gameState.playerSize; }
export function getSizeChangeTimer() { return gameState.sizeChangeTimer; }
export function setSizeChangeTimer(t) { gameState.sizeChangeTimer = t; }

export function changeSize(newSize) {
    // Check cooldown
    if (gameState.sizeChangeTimer > 0) {
        return; // Can't change size yet
    }
    
    // Don't change if already that size
    if (newSize === gameState.playerSize) {
        return;
    }
    
    // Get old scale before changing
    const oldScale = SIZE_CONFIG[gameState.playerSize].scale;
    const newScale = SIZE_CONFIG[newSize].scale;
    
    // Apply new size
    gameState.playerSize = newSize;
    const config = SIZE_CONFIG[newSize];
    
    // Base scale for the tank sprite (0.25 to make it ~100px)
    const baseDisplayScale = 0.25;
    
    // Apply new scale
    gameState.player.setScale(baseDisplayScale * config.scale);
    gameState.player.body.updateFromGameObject();
    
    // Small jump to account for size change
    const sizeDifference = Math.abs(newScale - oldScale);
    const jumpPower = 50 + (sizeDifference * 150);
    gameState.player.body.setVelocityY(-jumpPower);
    
    // Scale enemies inversely
    const enemyScale = 1 / newScale;
    const enemyBaseHeight = 30;
    const enemyOldHeight = enemyBaseHeight * (1 / oldScale);
    const enemyNewHeight = enemyBaseHeight * enemyScale;
    const enemyHeightDifference = enemyNewHeight - enemyOldHeight;
    
    gameState.enemies.children.entries.forEach(enemy => {
        enemy.setScale(enemyScale);
        enemy.y -= enemyHeightDifference / 2;
        enemy.body.updateFromGameObject();
    });
    
    // Reset cooldown timer
    gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
}
