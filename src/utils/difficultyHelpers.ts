/**
 * Difficulty Helper System
 * Manages difficulty-related calculations and adjustments.
 * Singleton pattern for consistent state management across the game.
 */
import { HARD_MODE_CONFIG } from '../config';
import playerStatsSystem from '../systems/PlayerStatsSystem';

export class DifficultyHelper {
    constructor() {
        // No state to initialize - all calculations based on current game state
    }

    /**
     * Calculate enemy spawn interval based on current difficulty.
     * In hard mode, enemies spawn more frequently by dividing the base interval.
     * 
     * @param baseInterval - The base spawn interval in pixels (default: 300)
     * @returns The calculated spawn interval adjusted for current difficulty
     */
    getEnemySpawnInterval(baseInterval: number = 300): number {
        const isHardMode = playerStatsSystem.difficulty === 'hard';
        return isHardMode ? baseInterval / HARD_MODE_CONFIG.enemySpawnMultiplier : baseInterval;
    }
}

// Export singleton instance
export default new DifficultyHelper();
