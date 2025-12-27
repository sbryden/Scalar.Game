import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, ENEMY_CONFIG } from './config.js';

let player;
let enemies;
let playerSize = 'normal';
let sizeChangeTimer = 0;

export function setPlayer(p) { player = p; }
export function setEnemies(e) { enemies = e; }
export function getPlayerSize() { return playerSize; }
export function getSizeChangeTimer() { return sizeChangeTimer; }
export function setSizeChangeTimer(t) { sizeChangeTimer = t; }

export function changeSize(newSize) {
    // Check cooldown
    if (sizeChangeTimer > 0) {
        return; // Can't change size yet
    }
    
    // Don't change if already that size
    if (newSize === playerSize) {
        return;
    }
    
    // Get old scale before changing
    const oldScale = SIZE_CONFIG[playerSize].scale;
    const newScale = SIZE_CONFIG[newSize].scale;
    
    // Apply new size
    playerSize = newSize;
    const config = SIZE_CONFIG[newSize];
    
    // Adjust Y position to keep feet on the ground
    const baseHeight = 40;
    const oldHeight = baseHeight * oldScale;
    const newHeight = baseHeight * newScale;
    const heightDifference = newHeight - oldHeight;
    
    player.y -= heightDifference / 2;
    player.setScale(config.scale);
    player.setFillStyle(config.color);
    player.body.updateFromGameObject();
    
    // Scale enemies inversely
    const enemyScale = 1 / newScale;
    const enemyBaseHeight = 30;
    const enemyOldHeight = enemyBaseHeight * (1 / oldScale);
    const enemyNewHeight = enemyBaseHeight * enemyScale;
    const enemyHeightDifference = enemyNewHeight - enemyOldHeight;
    
    enemies.children.entries.forEach(enemy => {
        enemy.setScale(enemyScale);
        enemy.y -= enemyHeightDifference / 2;
        enemy.body.updateFromGameObject();
    });
    
    // Reset cooldown timer
    sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
}
