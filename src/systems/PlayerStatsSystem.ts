/**
 * Player Stats System
 * Manages player health, XP, and leveling progression
 * Extracted from xpOrbs.js for better separation of concerns
 */
import gameState from '../utils/gameState';
import type { PlayerStats, Difficulty } from '../types/game';

type LevelUpCallback = (level: number) => void;
type GameOverCallback = () => void;

export class PlayerStatsSystem {
    stats: PlayerStats;
    difficulty: Difficulty;
    onLevelUp: LevelUpCallback | null;
    onGameOver: GameOverCallback | null;

    constructor() {
        this.stats = {
            level: 1,
            maxHealth: 100,
            health: 100,
            xp: 0,
            xpToLevel: 100
        };
        this.difficulty = 'normal';
        this.onLevelUp = null;
        this.onGameOver = null;
    }
    
    /**
     * Initialize stats based on difficulty
     */
    initializeDifficulty(difficulty: Difficulty): void {
        this.difficulty = difficulty;
        
        if (difficulty === 'godMode') {
            this.stats.maxHealth = 10000000;
            this.stats.health = 10000000;
        } else {
            this.stats.maxHealth = 100;
            this.stats.health = 100;
        }
    }
    
    /**
     * Get current player stats
     */
    getStats(): PlayerStats {
        return this.stats;
    }
    
    /**
     * Update stats (for save/load functionality)
     */
    setStats(newStats: Partial<PlayerStats>): void {
        this.stats = { ...this.stats, ...newStats };
    }
    
    /**
     * Add XP to player and check for level up
     */
    gainXP(amount: number): void {
        this.stats.xp += amount;
        this.checkLevelUp();
    }
    
    /**
     * Check if player has enough XP to level up
     * Can level up multiple times if enough XP
     */
    checkLevelUp(): void {
        while (this.stats.xp >= this.stats.xpToLevel) {
            this.stats.xp -= this.stats.xpToLevel;
            this.stats.level += 1;
            this.stats.maxHealth += 20;
            this.stats.health = this.stats.maxHealth;
            this.stats.xpToLevel = Math.floor(this.stats.xpToLevel * 1.1);
            
            // Update level text UI
            if (gameState.levelText) {
                gameState.levelText.setText(`LEVEL ${this.stats.level}`);
            }
            
            console.log(`Level Up! Now level ${this.stats.level}`);
            
            // Trigger level up callback if set
            if (this.onLevelUp) {
                this.onLevelUp(this.stats.level);
            }
        }
    }
    
    /**
     * Apply damage to player
     */
    takeDamage(amount: number): number {
        // Don't apply damage if already dead
        if (this.stats.health <= 0) {
            return 0;
        }
        
        this.stats.health = Math.max(0, this.stats.health - amount);
        
        if (this.stats.health <= 0) {
            console.log('Player defeated! Game Over.');
            
            // Trigger game over callback if set
            if (this.onGameOver) {
                this.onGameOver();
            }
        }
        
        return this.stats.health;
    }
    
    /**
     * Heal player
     */
    heal(amount: number): number {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
        return this.stats.health;
    }
    
    /**
     * Reset stats to initial state
     */
    reset(): void {
        this.stats = {
            level: 1,
            maxHealth: 100,
            health: 100,
            xp: 0,
            xpToLevel: 100
        };
    }
    
    /**
     * Set callback for level up events
     */
    setLevelUpCallback(callback: LevelUpCallback): void {
        this.onLevelUp = callback;
    }
    
    /**
     * Set callback for game over events
     */
    setGameOverCallback(callback: GameOverCallback): void {
        this.onGameOver = callback;
    }
    
    /**
     * Check if player is in god mode
     */
    isGodMode(): boolean {
        return this.difficulty === 'godMode';
    }
}

// Export singleton instance
export default new PlayerStatsSystem();
