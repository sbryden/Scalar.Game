/**
 * Player Module - Re-export of PlayerManager
 * Provides backward-compatible function exports for the class-based PlayerManager.
 * 
 * @deprecated This file maintains backward compatibility. Prefer importing from './managers/PlayerManager'
 */
import playerManager from './managers/PlayerManager';
import type { PlayerSize } from './types/game';

/**
 * Get the current player size.
 * 
 * @returns The current PlayerSize ('small' or 'normal')
 */
export function getPlayerSize(): PlayerSize {
    return playerManager.getPlayerSize();
}

/**
 * Get the current size change cooldown timer.
 * 
 * @returns The remaining cooldown time in milliseconds
 */
export function getSizeChangeTimer(): number {
    return playerManager.getSizeChangeTimer();
}

/**
 * Set the size change cooldown timer.
 * 
 * @param t - The cooldown time in milliseconds
 */
export function setSizeChangeTimer(t: number): void {
    playerManager.setSizeChangeTimer(t);
}

/**
 * Change the player's size.
 * Handles size transitions, scene changes, and cooldown management.
 * 
 * @param direction - The direction to change size ('smaller', 'larger', or a specific PlayerSize)
 */
export function changeSize(direction: 'smaller' | 'larger' | PlayerSize): void {
    playerManager.changeSize(direction);
}

// Export the singleton instance as default for direct class access
export default playerManager;
