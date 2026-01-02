/**
 * Player Manager
 * Manages all player-related functionality including size changes and state.
 * Singleton pattern for consistent state management across the game.
 */
import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, PHYSICS_CONFIG } from '../config';
import gameState from '../utils/gameState';
import type { PlayerSize } from '../types/game';

class PlayerManager {
    constructor() {
        // No state to initialize - all player data is managed through gameState
    }

    /**
     * Get the current player size.
     * 
     * @returns The current PlayerSize ('small' or 'normal')
     */
    getPlayerSize(): PlayerSize {
        return gameState.playerSize;
    }

    /**
     * Get the current size change cooldown timer.
     * 
     * @returns The remaining cooldown time in milliseconds
     */
    getSizeChangeTimer(): number {
        return gameState.sizeChangeTimer;
    }

    /**
     * Set the size change cooldown timer.
     * 
     * @param t - The cooldown time in milliseconds
     */
    setSizeChangeTimer(t: number): void {
        gameState.sizeChangeTimer = t;
    }

    /**
     * Change the player's size.
     * Handles size transitions, scene changes, and cooldown management.
     * 
     * @param direction - The direction to change size ('smaller', 'larger', or a specific PlayerSize)
     */
    changeSize(direction: 'smaller' | 'larger' | PlayerSize): void {
        // Check cooldown
        if (gameState.sizeChangeTimer > 0) {
            return; // Can't change size yet
        }
        
        const currentSize = gameState.playerSize;
        const currentScene = gameState.currentSceneKey;
        
        // All scenes only allow small and normal sizes
        const sizeOrder: PlayerSize[] = ['small', 'normal'];
        const currentIndex = sizeOrder.indexOf(currentSize);
        
        let newSize: PlayerSize;
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
        gameState.playerSize = newSize;
        const config = SIZE_CONFIG[newSize];
        if (!config) return;
        
        // Base scale for the tank sprite
        const baseDisplayScale = PHYSICS_CONFIG.player.baseDisplayScale;
        
        // Apply new scale
        const player = gameState.player;
        if (!player) return;
        
        player.setScale(baseDisplayScale * config.scale);
        player.body.updateFromGameObject();
        
        // Small jump to account for size change
        player.body.setVelocityY(PHYSICS_CONFIG.player.sizeChangeJumpVelocity);
        
        // Reset cooldown timer
        gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
    }
}

// Export singleton instance
export default new PlayerManager();
