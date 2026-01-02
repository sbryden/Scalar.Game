/**
 * Level Stats Tracker System
 * Tracks player performance statistics throughout a level
 */

// Base point values for scoring
export const SCORING_CONFIG = {
    regularBossPoints: 20,
    regularEnemyPoints: 5,
    microBossPoints: 10,
    microEnemyPoints: 2.5
} as const;

export interface LevelStats {
    levelStartTime: number;
    levelEndTime: number | null;
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

export class LevelStatsTracker {
    private stats: LevelStats;
    private isLevelActive: boolean;

    constructor() {
        this.stats = this.createEmptyStats();
        this.isLevelActive = false;
    }

    /**
     * Create a fresh stats object
     */
    private createEmptyStats(): LevelStats {
        return {
            levelStartTime: 0,
            levelEndTime: null,
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
     * Start tracking a new level
     */
    startLevel(startTime: number): void {
        this.stats = this.createEmptyStats();
        this.stats.levelStartTime = startTime;
        this.isLevelActive = true;
    }

    /**
     * End the current level
     */
    endLevel(endTime: number): void {
        this.stats.levelEndTime = endTime;
        this.isLevelActive = false;
    }

    /**
     * Track a projectile being fired
     */
    recordProjectileFired(): void {
        if (this.isLevelActive) {
            this.stats.projectilesFired++;
        }
    }

    /**
     * Track a player death
     */
    recordDeath(): void {
        if (this.isLevelActive) {
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
        if (this.isLevelActive) {
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
        if (this.isLevelActive) {
            this.stats.damageDealt += damage;
        }
    }

    /**
     * Track damage taken by player
     */
    recordDamageTaken(damage: number): void {
        if (this.isLevelActive) {
            this.stats.damageTaken += damage;
        }
    }

    /**
     * Get current stats
     */
    getStats(): LevelStats {
        return { ...this.stats };
    }

    /**
     * Get completion time in seconds
     */
    getCompletionTime(): number {
        if (this.stats.levelEndTime === null) {
            return 0;
        }
        return (this.stats.levelEndTime - this.stats.levelStartTime) / 1000;
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
     * Check if level is currently being tracked
     */
    isTracking(): boolean {
        return this.isLevelActive;
    }

    /**
     * Reset all stats
     */
    reset(): void {
        this.stats = this.createEmptyStats();
        this.isLevelActive = false;
    }

    /**
     * Calculate score based on enemy kills with level-based scaling
     * Base point values are defined in SCORING_CONFIG constant
     * Points scale linearly with map level
     */
    calculateScore(currentLevel: number): {
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
        // Level scaling multiplier (increases linearly with level)
        const levelMultiplier = currentLevel;
        
        // Calculate scaled point values per enemy
        const scaledRegularBoss = SCORING_CONFIG.regularBossPoints * levelMultiplier;
        const scaledRegularEnemy = SCORING_CONFIG.regularEnemyPoints * levelMultiplier;
        const scaledMicroBoss = SCORING_CONFIG.microBossPoints * levelMultiplier;
        const scaledMicroEnemy = SCORING_CONFIG.microEnemyPoints * levelMultiplier;
        
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

// Export singleton instance
export default new LevelStatsTracker();
