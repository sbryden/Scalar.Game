/**
 * Stage Progression System
 * Manages stage (world/scene) progression and difficulty scaling.
 * Note: "Stage" refers to the game world/scene level, not player level (which is XP-based).
 */
import { STAGE_SYSTEM_CONFIG } from '../config';
import gameState from '../utils/GameContext';

class StageProgressionSystem {
    /**
     * Get the current stage number
     */
    getCurrentStage(): number {
        return gameState.currentStage;
    }

    /**
     * Set the stage (used when starting game or advancing stages)
     */
    setStage(stage: number): void {
        gameState.currentStage = Math.max(1, Math.min(stage, STAGE_SYSTEM_CONFIG.maxStage));
    }

    /**
     * Advance to the next stage
     */
    advanceToNextStage(): void {
        this.setStage(gameState.currentStage + 1);
    }

    /**
     * Reset to stage 1 (used when starting new game)
     */
    resetToStage1(): void {
        this.setStage(1);
    }

    /**
     * Get enemy count multiplier for current stage
     * This stacks with difficulty multipliers
     */
    getEnemyCountMultiplier(): number {
        const stage = gameState.currentStage;
        return STAGE_SYSTEM_CONFIG.enemyCountBase + 
               (stage - 1) * STAGE_SYSTEM_CONFIG.enemyCountIncreasePerStage;
    }

    /**
     * Get enemy health multiplier for current stage
     * This stacks with difficulty multipliers
     */
    getEnemyHealthMultiplier(): number {
        const stage = gameState.currentStage;
        return STAGE_SYSTEM_CONFIG.enemyHealthBase + 
               (stage - 1) * STAGE_SYSTEM_CONFIG.enemyHealthIncreasePerStage;
    }

    /**
     * Get enemy damage multiplier for current stage
     * This stacks with difficulty multipliers
     */
    getEnemyDamageMultiplier(): number {
        const stage = gameState.currentStage;
        return STAGE_SYSTEM_CONFIG.enemyDamageBase + 
               (stage - 1) * STAGE_SYSTEM_CONFIG.enemyDamageIncreasePerStage;
    }

    /**
     * Get enemy speed multiplier for current stage
     * This stacks with difficulty multipliers
     */
    getEnemySpeedMultiplier(): number {
        const stage = gameState.currentStage;
        return STAGE_SYSTEM_CONFIG.enemySpeedBase + 
               (stage - 1) * STAGE_SYSTEM_CONFIG.enemySpeedIncreasePerStage;
    }

    /**
     * Get all multipliers for current stage (useful for debugging/UI)
     */
    getStageMultipliers() {
        return {
            stage: this.getCurrentStage(),
            enemyCount: this.getEnemyCountMultiplier(),
            enemyHealth: this.getEnemyHealthMultiplier(),
            enemyDamage: this.getEnemyDamageMultiplier(),
            enemySpeed: this.getEnemySpeedMultiplier()
        };
    }
}

// Singleton instance management
let stageProgressionSystemInstance: StageProgressionSystem | null = null;

/**
 * Get the StageProgressionSystem instance, creating it if necessary
 */
export function getStageProgressionSystem(): StageProgressionSystem {
    if (!stageProgressionSystemInstance) {
        stageProgressionSystemInstance = new StageProgressionSystem();
    }
    return stageProgressionSystemInstance;
}

/**
 * Reset the StageProgressionSystem instance (useful for testing)
 */
export function resetStageProgressionSystem(): void {
    stageProgressionSystemInstance = null;
}

// Default export for backward compatibility
export default getStageProgressionSystem();
