/**
 * Player Manager
 * Manages all player-related functionality including size changes and state.
 * Singleton pattern for consistent state management across the game.
 */
import { SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, PHYSICS_CONFIG } from '../config';
import gameState from '../utils/gameState';
import { getFuelSystem } from '../systems/FuelSystem';
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
     * Supports 3-tier system: small (micro) → normal → large (macro)
     * 
     * @param direction - The direction to change size ('smaller', 'larger', or a specific PlayerSize)
     */
    changeSize(direction: 'smaller' | 'larger' | PlayerSize): void {
        // Check cooldown
        if (gameState.sizeChangeTimer > 0) {
            return; // Can't change size yet
        }
        
        // Check fuel system
        const fuelSystem = getFuelSystem();
        if (!fuelSystem.canTransform()) {
            // Show warning or feedback that fuel is depleted
            console.log('Cannot transform: insufficient fuel or cooldown active');
            return;
        }
        
        const currentSize = gameState.playerSize;
        const currentScene = gameState.currentSceneKey;
        
        // 3-tier size system: small (micro) → normal → large (macro)
        const sizeOrder: PlayerSize[] = ['small', 'normal', 'large'];
        const currentIndex = sizeOrder.indexOf(currentSize);
        
        let newSize: PlayerSize;
        if (direction === 'smaller') {
            // Can't go smaller than small
            if (currentIndex <= 0) return;
            newSize = sizeOrder[currentIndex - 1]!;
        } else if (direction === 'larger') {
            // Can't go larger than large
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
        
        // Consume fuel for the transformation
        if (!fuelSystem.consumeFuel()) {
            console.log('Cannot transform: insufficient fuel');
            return;
        }
        
        // === LAND ENVIRONMENT TRANSITIONS ===
        
        // MicroScene (small) ← MainGameScene (normal)
        if (newSize === 'small' && currentScene === 'MainGameScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('MicroScene');
            return;
        }
        
        // MicroScene (small) → MainGameScene (normal)
        if (newSize === 'normal' && currentScene === 'MicroScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('MainGameScene');
            return;
        }
        
        // MainGameScene (normal) → MainGameMacroScene (large)
        if (newSize === 'large' && currentScene === 'MainGameScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('MainGameMacroScene');
            return;
        }
        
        // MainGameMacroScene (large) → MainGameScene (normal)
        if (newSize === 'normal' && currentScene === 'MainGameMacroScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('MainGameScene');
            return;
        }
        
        // === UNDERWATER ENVIRONMENT TRANSITIONS ===
        
        // UnderwaterMicroScene (small) ← UnderwaterScene (normal)
        if (newSize === 'small' && currentScene === 'UnderwaterScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('UnderwaterMicroScene');
            return;
        }
        
        // UnderwaterMicroScene (small) → UnderwaterScene (normal)
        if (newSize === 'normal' && currentScene === 'UnderwaterMicroScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('UnderwaterScene');
            return;
        }
        
        // UnderwaterScene (normal) → UnderwaterMacroScene (large)
        if (newSize === 'large' && currentScene === 'UnderwaterScene') {
            gameState.playerSize = newSize;
            gameState.sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
            gameState.scene?.scene.start('UnderwaterMacroScene');
            return;
        }
        
        // UnderwaterMacroScene (large) → UnderwaterScene (normal)
        if (newSize === 'normal' && currentScene === 'UnderwaterMacroScene') {
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
