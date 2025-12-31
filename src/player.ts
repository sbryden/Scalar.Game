import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, ENEMY_CONFIG } from './config';
import gameState from './utils/gameState';

export function getPlayerSize() { return gameState.playerSize; }
export function getSizeChangeTimer() { return gameState.sizeChangeTimer; }
export function setSizeChangeTimer(t) { gameState.sizeChangeTimer = t; }

export function changeSize(direction) {
    // Check cooldown
    if (gameState.sizeChangeTimer > 0) {
        return; // Can't change size yet
    }
    
    const currentSize = gameState.playerSize;
    const currentScene = gameState.currentSceneKey;
    
    // Underwater scenes only allow small and normal sizes (no large)
    const isUnderwater = currentScene === 'UnderwaterScene' || currentScene === 'UnderwaterMicroScene';
    const sizeOrder = isUnderwater ? ['small', 'normal'] : ['small', 'normal', 'large'];
    const currentIndex = sizeOrder.indexOf(currentSize);
    
    let newSize;
    if (direction === 'smaller') {
        // Can't go smaller than small
        if (currentIndex <= 0) return;
        newSize = sizeOrder[currentIndex - 1];
    } else if (direction === 'larger') {
        // Can't go larger than max for current environment
        if (currentIndex >= sizeOrder.length - 1) return;
        newSize = sizeOrder[currentIndex + 1];
    } else {
        // Direct size specification (for backwards compatibility)
        newSize = direction;
    }
    
    // Don't change if already that size
    if (newSize === currentSize) {
        return;
    }
    
    // Check for scene transitions
    const oldSize = currentSize;
    
    // Land environment transitions
    // Transition to MicroScene when going to small from MainGameScene
    if (newSize === 'small' && currentScene === 'MainGameScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene.scene.start('MicroScene');
        return;
    }
    
    // Transition back to MainGameScene when going to normal from MicroScene
    if (newSize === 'normal' && currentScene === 'MicroScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene.scene.start('MainGameScene');
        return;
    }
    
    // Underwater environment transitions
    // Transition to UnderwaterMicroScene when going to small from UnderwaterScene
    if (newSize === 'small' && currentScene === 'UnderwaterScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene.scene.start('UnderwaterMicroScene');
        return;
    }
    
    // Transition back to UnderwaterScene when going to normal from UnderwaterMicroScene
    if (newSize === 'normal' && currentScene === 'UnderwaterMicroScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene.scene.start('UnderwaterScene');
        return;
    }
    
    // Get old scale before changing
    const oldScale = SIZE_CONFIG[oldSize].scale;
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
