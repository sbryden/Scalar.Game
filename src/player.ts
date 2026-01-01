import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, ENEMY_CONFIG, PHYSICS_CONFIG } from './config';
import gameState from './utils/gameState';
import type { PlayerSize, Enemy } from './types/game';

export function getPlayerSize(): PlayerSize { return gameState.playerSize; }
export function getSizeChangeTimer(): number { return gameState.sizeChangeTimer; }
export function setSizeChangeTimer(t: number): void { gameState.sizeChangeTimer = t; }

export function changeSize(direction: 'smaller' | 'larger' | PlayerSize): void {
    // Check cooldown
    if (gameState.sizeChangeTimer > 0) {
        return; // Can't change size yet
    }
    
    const currentSize = gameState.playerSize;
    const currentScene = gameState.currentSceneKey;
    
    // All scenes only allow small and normal sizes
    const sizeOrder: PlayerSize[] = ['small', 'normal'];
    const currentIndex = sizeOrder.indexOf(currentSize);
    
    let newSize: string;
    if (direction === 'smaller') {
        // Can't go smaller than small
        if (currentIndex <= 0) return;
        newSize = sizeOrder[currentIndex - 1]!;
    } else if (direction === 'larger') {
        // Can't go larger than normal
        if (currentIndex >= sizeOrder.length - 1) return;
        newSize = sizeOrder[currentIndex + 1]!;
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
        gameState.scene?.scene.start('MicroScene');
        return;
    }
    
    // Transition back to MainGameScene when going to normal from MicroScene
    if (newSize === 'normal' && currentScene === 'MicroScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene?.scene.start('MainGameScene');
        return;
    }
    
    // Underwater environment transitions
    // Transition to UnderwaterMicroScene when going to small from UnderwaterScene
    if (newSize === 'small' && currentScene === 'UnderwaterScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene?.scene.start('UnderwaterMicroScene');
        return;
    }
    
    // Transition back to UnderwaterScene when going to normal from UnderwaterMicroScene
    if (newSize === 'normal' && currentScene === 'UnderwaterMicroScene') {
        gameState.playerSize = newSize;
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
        gameState.scene?.scene.start('UnderwaterScene');
        return;
    }
    
    // Apply new size (simplified - no complex scaling needed)
    gameState.playerSize = newSize as PlayerSize;
    const config = SIZE_CONFIG[newSize];
    
    // Base scale for the tank sprite
    const baseDisplayScale = PHYSICS_CONFIG.player.baseDisplayScale;
    
    // Apply new scale
    const player = gameState.player;
    if (!player) return;
    
    player.setScale(baseDisplayScale * config.scale);
    player.body.updateFromGameObject();
    
    // Small jump to account for size change
    gameState.player.body.setVelocityY(PHYSICS_CONFIG.player.sizeChangeJumpVelocity);
    
    // Reset cooldown timer
    gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
}
