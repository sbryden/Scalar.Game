/**
 * Stage Stats Tracker System
 * Tracks player performance statistics throughout a stage (game world/scene level).
 * Note: "Stage" refers to game world/scene progression, distinct from player level (XP-based).
 */

// Base point values for scoring
export const SCORING_CONFIG = {
    regularBossPoints: 20,
    regularEnemyPoints: 5,
    microBossPoints: 10,
    microEnemyPoints: 2.5
} as const;

export interface StageStats {
    stageStartTime: number;
    stageEndTime: number | null;
    projectilesFired: number;
    deaths: number;
    enemiesDestroyed: number;
    bossesDestroyed: number;
    damageDealt: number;
    damageTaken: number;
    // Scoring breakdown
    regularEnemiesDestroyed: number;
    regularBossesDestroyed: number;
    microEnemiesDestroyed: number;
    microBossesDestroyed: number;
}

export class StageStatsTracker {
    private stats: StageStats;
    private isStageActive: boolean;
    private cumulativeScore: number;
    private currentStage: number | null;
    private hasCommittedCurrentStage: boolean;

    constructor() {
        this.stats = this.createEmptyStats();
        this.isStageActive = false;
        this.cumulativeScore = 0;
        this.currentStage = null;
        this.hasCommittedCurrentStage = false;
    }

    /**
     * Create a fresh stats object
     */
    private createEmptyStats(): StageStats {
        return {
            stageStartTime: 0,
            stageEndTime: null,
            projectilesFired: 0,
            deaths: 0,
            enemiesDestroyed: 0,
            bossesDestroyed: 0,
            damageDealt: 0,
            damageTaken: 0,
            regularEnemiesDestroyed: 0,
            regularBossesDestroyed: 0,
            microEnemiesDestroyed: 0,
            microBossesDestroyed: 0
        };
    }

    /**
     * Start tracking a new stage
     */
    startStage(startTime: number, stage: number): void {
        const isNewStage = this.currentStage !== stage;
        const shouldResetStats = isNewStage || !this.isStageActive || this.stats.stageStartTime === 0;

        if (shouldResetStats) {
            this.stats = this.createEmptyStats();
            this.stats.stageStartTime = startTime;
            this.currentStage = stage;
            this.hasCommittedCurrentStage = false;
        }

        this.isStageActive = true;
    }

    /**
     * End the current stage
     */
    endStage(endTime: number): void {
        this.stats.stageEndTime = endTime;
        this.isStageActive = false;

        // Commit this stage's score to the run total exactly once
        const stageForScore = this.currentStage ?? 1;
        if (!this.hasCommittedCurrentStage) {
            const stageScore = this.calculateScore(stageForScore);
            this.cumulativeScore += stageScore.totalScore;
            this.hasCommittedCurrentStage = true;
        }
    }

    /**
     * Track a projectile being fired
     */
    recordProjectileFired(): void {
        if (this.isStageActive) {
            this.stats.projectilesFired++;
        }
    }

    /**
     * Track a player death
     */
    recordDeath(): void {
        if (this.isStageActive) {
            this.stats.deaths++;
        }
    }

    /**
     * Check if an enemy type is a micro-world enemy
     */
    private isMicroEnemy(enemyType: string): boolean {
        return enemyType === 'micro' || 
               enemyType === 'water_swimming_micro' ||
               enemyType === 'boss_land_micro' ||
               enemyType === 'boss_water_swimming_micro' ||
               enemyType === 'boss_water_crab_micro';
    }

    /**
     * Track an enemy being destroyed
     * @param enemyType - Type of enemy destroyed (e.g., 'boss_land', 'micro', 'fish')
     * @param isBoss - Whether this enemy is a boss
     */
    recordEnemyDestroyed(enemyType: string, isBoss: boolean = false): void {
        if (this.isStageActive) {
            this.stats.enemiesDestroyed++;
            if (isBoss) {
                this.stats.bossesDestroyed++;
            }
            
            // Track by category for scoring
            const isMicro = this.isMicroEnemy(enemyType);
            
            if (isBoss) {
                if (isMicro) {
                    this.stats.microBossesDestroyed++;
                } else {
                    this.stats.regularBossesDestroyed++;
                }
            } else {
                if (isMicro) {
                    this.stats.microEnemiesDestroyed++;
                } else {
                    this.stats.regularEnemiesDestroyed++;
                }
            }
        }
    }

    /**
     * Track damage dealt to enemies
     */
    recordDamageDealt(damage: number): void {
        if (this.isStageActive) {
            this.stats.damageDealt += damage;
        }
    }

    /**
     * Track damage taken by player
     */
    recordDamageTaken(damage: number): void {
        if (this.isStageActive) {
            this.stats.damageTaken += damage;
        }
    }

    /**
     * Get current stats
     */
    getStats(): StageStats {
        return { ...this.stats };
    }

    /**
     * Get total run score (committed stages plus in-progress stage)
     */
    getCumulativeScore(currentStage: number): number {
        // If we are actively tracking the same stage, include the live score
        const isActiveSameStage = this.isStageActive && this.currentStage === currentStage && !this.hasCommittedCurrentStage;
        if (isActiveSameStage) {
            const liveScore = this.calculateScore(currentStage).totalScore;
            return this.cumulativeScore + liveScore;
        }
        return this.cumulativeScore;
    }

    /**
     * Get completion time in seconds
     */
    getCompletionTime(): number {
        if (this.stats.stageEndTime === null) {
            return 0;
        }
        return (this.stats.stageEndTime - this.stats.stageStartTime) / 1000;
    }

    /**
     * Format completion time as MM:SS
     */
    getFormattedCompletionTime(): string {
        const totalSeconds = Math.floor(this.getCompletionTime());
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Check if stage is currently being tracked
     */
    isTracking(): boolean {
        return this.isStageActive;
    }

    /**
     * Reset all stats
     */
    reset(): void {
        this.resetRun();
    }

    /**
     * Reset only the current stage's stats while keeping the run total
     */
    resetStageStats(): void {
        this.stats = this.createEmptyStats();
        this.isStageActive = false;
        this.hasCommittedCurrentStage = false;
        this.currentStage = null;
    }

    /**
     * Full reset for a brand-new run (clears cumulative score)
     */
    resetRun(): void {
        this.stats = this.createEmptyStats();
        this.isStageActive = false;
        this.cumulativeScore = 0;
        this.currentStage = null;
        this.hasCommittedCurrentStage = false;
    }

    /**
     * Calculate score based on enemy kills with stage-based scaling
     * Base point values are defined in SCORING_CONFIG constant
     * Points scale linearly with stage number
     */
    calculateScore(currentStage: number): {
        regularBossPoints: number;
        regularEnemyPoints: number;
        microBossPoints: number;
        microEnemyPoints: number;
        totalScore: number;
        baseValues: typeof SCORING_CONFIG;
        scaledValues: {
            regularBoss: number;
            regularEnemy: number;
            microBoss: number;
            microEnemy: number;
        };
    } {
        // Stage scaling multiplier (increases linearly with stage)
        const stageMultiplier = currentStage;
        
        // Calculate scaled point values per enemy
        const scaledRegularBoss = SCORING_CONFIG.regularBossPoints * stageMultiplier;
        const scaledRegularEnemy = SCORING_CONFIG.regularEnemyPoints * stageMultiplier;
        const scaledMicroBoss = SCORING_CONFIG.microBossPoints * stageMultiplier;
        const scaledMicroEnemy = SCORING_CONFIG.microEnemyPoints * stageMultiplier;
        
        // Calculate points for each category
        const regularBossPoints = this.stats.regularBossesDestroyed * scaledRegularBoss;
        const regularEnemyPoints = this.stats.regularEnemiesDestroyed * scaledRegularEnemy;
        const microBossPoints = this.stats.microBossesDestroyed * scaledMicroBoss;
        const microEnemyPoints = this.stats.microEnemiesDestroyed * scaledMicroEnemy;
        
        return {
            regularBossPoints,
            regularEnemyPoints,
            microBossPoints,
            microEnemyPoints,
            totalScore: regularBossPoints + regularEnemyPoints + microBossPoints + microEnemyPoints,
            baseValues: SCORING_CONFIG,
            scaledValues: {
                regularBoss: scaledRegularBoss,
                regularEnemy: scaledRegularEnemy,
                microBoss: scaledMicroBoss,
                microEnemy: scaledMicroEnemy
            }
        };
    }
}

// Singleton instance management
let stageStatsTrackerInstance: StageStatsTracker | null = null;

/**
 * Get the StageStatsTracker instance, creating it if necessary
 */
export function getStageStatsTracker(): StageStatsTracker {
    if (!stageStatsTrackerInstance) {
        stageStatsTrackerInstance = new StageStatsTracker();
    }
    return stageStatsTrackerInstance;
}

/**
 * Reset the StageStatsTracker instance (useful for testing)
 */
export function resetStageStatsTracker(): void {
    stageStatsTrackerInstance = null;
}

// Default export for backward compatibility
export default getStageStatsTracker();
