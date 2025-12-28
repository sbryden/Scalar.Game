/**
 * Player Stats System
 * Manages player health, XP, and leveling progression
 * Extracted from xpOrbs.js for better separation of concerns
 */
import gameState from '../utils/gameState.js';

export class PlayerStatsSystem {
    constructor() {
        this.stats = {
            level: 1,
            maxHealth: 100,
            health: 100,
            xp: 0,
            xpToLevel: 100
        };
    }
    
    /**
     * Get current player stats
     */
    getStats() {
        return this.stats;
    }
    
    /**
     * Update stats (for save/load functionality)
     */
    setStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
    }
    
    /**
     * Add XP to player and check for level up
     */
    gainXP(amount) {
        this.stats.xp += amount;
        this.checkLevelUp();
    }
    
    /**
     * Check if player has enough XP to level up
     * Can level up multiple times if enough XP
     */
    checkLevelUp() {
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
    takeDamage(amount) {
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
    heal(amount) {
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
        return this.stats.health;
    }
    
    /**
     * Reset stats to initial state
     */
    reset() {
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
    setLevelUpCallback(callback) {
        this.onLevelUp = callback;
    }
    
    /**
     * Set callback for game over events
     */
    setGameOverCallback(callback) {
        this.onGameOver = callback;
    }
}

// Export singleton instance
export default new PlayerStatsSystem();
