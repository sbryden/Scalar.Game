/**
 * Level Stats Tracker System
 * Tracks player performance statistics throughout a level
 */

export interface LevelStats {
    levelStartTime: number;
    levelEndTime: number | null;
    projectilesFired: number;
    deaths: number;
    enemiesDestroyed: number;
    bossesDestroyed: number;
    damageDealt: number;
    damageTaken: number;
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
            damageTaken: 0
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
     * Track an enemy being destroyed
     */
    recordEnemyDestroyed(isBoss: boolean = false): void {
        if (this.isLevelActive) {
            this.stats.enemiesDestroyed++;
            if (isBoss) {
                this.stats.bossesDestroyed++;
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
}

// Export singleton instance
export default new LevelStatsTracker();
