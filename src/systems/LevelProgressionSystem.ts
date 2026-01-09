/**
 * Level Progression System
 * Manages map level progression and difficulty scaling
 */
import { LEVEL_SYSTEM_CONFIG } from '../config';
import gameState from '../utils/GameContext';

class LevelProgressionSystem {
    /**
     * Get the current map level
     */
    getCurrentLevel(): number {
        return gameState.currentMapLevel;
    }

    /**
     * Set the map level (used when starting game or advancing levels)
     */
    setLevel(level: number): void {
        gameState.currentMapLevel = Math.max(1, Math.min(level, LEVEL_SYSTEM_CONFIG.maxLevel));
    }

    /**
     * Advance to the next level
     */
    advanceToNextLevel(): void {
        this.setLevel(gameState.currentMapLevel + 1);
    }

    /**
     * Reset to level 1 (used when starting new game)
     */
    resetToLevel1(): void {
        this.setLevel(1);
    }

    /**
     * Get enemy count multiplier for current level
     * This stacks with difficulty multipliers
     */
    getEnemyCountMultiplier(): number {
        const level = gameState.currentMapLevel;
        return LEVEL_SYSTEM_CONFIG.enemyCountBase + 
               (level - 1) * LEVEL_SYSTEM_CONFIG.enemyCountIncreasePerLevel;
    }

    /**
     * Get enemy health multiplier for current level
     * This stacks with difficulty multipliers
     */
    getEnemyHealthMultiplier(): number {
        const level = gameState.currentMapLevel;
        return LEVEL_SYSTEM_CONFIG.enemyHealthBase + 
               (level - 1) * LEVEL_SYSTEM_CONFIG.enemyHealthIncreasePerLevel;
    }

    /**
     * Get enemy damage multiplier for current level
     * This stacks with difficulty multipliers
     */
    getEnemyDamageMultiplier(): number {
        const level = gameState.currentMapLevel;
        return LEVEL_SYSTEM_CONFIG.enemyDamageBase + 
               (level - 1) * LEVEL_SYSTEM_CONFIG.enemyDamageIncreasePerLevel;
    }

    /**
     * Get enemy speed multiplier for current level
     * This stacks with difficulty multipliers
     */
    getEnemySpeedMultiplier(): number {
        const level = gameState.currentMapLevel;
        return LEVEL_SYSTEM_CONFIG.enemySpeedBase + 
               (level - 1) * LEVEL_SYSTEM_CONFIG.enemySpeedIncreasePerLevel;
    }

    /**
     * Get all multipliers for current level (useful for debugging/UI)
     */
    getLevelMultipliers() {
        return {
            level: this.getCurrentLevel(),
            enemyCount: this.getEnemyCountMultiplier(),
            enemyHealth: this.getEnemyHealthMultiplier(),
            enemyDamage: this.getEnemyDamageMultiplier(),
            enemySpeed: this.getEnemySpeedMultiplier()
        };
    }
}

// Singleton instance management
let levelProgressionSystemInstance: LevelProgressionSystem | null = null;

/**
 * Get the LevelProgressionSystem instance, creating it if necessary
 */
export function getLevelProgressionSystem(): LevelProgressionSystem {
    if (!levelProgressionSystemInstance) {
        levelProgressionSystemInstance = new LevelProgressionSystem();
    }
    return levelProgressionSystemInstance;
}

/**
 * Reset the LevelProgressionSystem instance (useful for testing)
 */
export function resetLevelProgressionSystem(): void {
    levelProgressionSystemInstance = null;
}

// Default export for backward compatibility
export default getLevelProgressionSystem();
