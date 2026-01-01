/**
 * Difficulty Helper Functions
 * Utility functions for difficulty-related calculations
 */
import { HARD_MODE_CONFIG } from '../config';
import playerStatsSystem from '../systems/PlayerStatsSystem';

/**
 * Calculate enemy spawn interval based on current difficulty
 * @param baseInterval - The base spawn interval in pixels (default: 300)
 * @returns The calculated spawn interval adjusted for current difficulty
 */
export function getEnemySpawnInterval(baseInterval: number = 300): number {
    const isHardMode = playerStatsSystem.difficulty === 'hard';
    return isHardMode ? baseInterval / HARD_MODE_CONFIG.enemySpawnMultiplier : baseInterval;
}
