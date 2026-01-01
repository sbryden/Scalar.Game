/**
 * Player Stats System
 * Manages player health, XP, stamina, and leveling progression
 * Extracted from xpOrbs.js for better separation of concerns
 */
import gameState from '../utils/gameState';
import { COMBAT_CONFIG, XP_CONFIG, STAMINA_CONFIG } from '../config';
import { initializeStaminaSystem, getStaminaSystem } from './StaminaSystem';
import levelStatsTracker from './LevelStatsTracker';
import type { PlayerStats, Difficulty } from '../types/game';

type LevelUpCallback = (level: number) => void;
type GameOverCallback = () => void;

export class PlayerStatsSystem {
    stats: PlayerStats;
    difficulty: Difficulty;
    onLevelUp: LevelUpCallback | null;
    onGameOver: GameOverCallback | null;

    constructor() {
        // Initialize stamina system
        initializeStaminaSystem(STAMINA_CONFIG);
        
        this.stats = {
            level: XP_CONFIG.progression.startingLevel,
            maxHealth: XP_CONFIG.progression.startingMaxHealth,
            health: XP_CONFIG.progression.startingHealth,
            xp: XP_CONFIG.progression.startingXP,
            xpToLevel: XP_CONFIG.progression.startingXPToLevel,
            stamina: STAMINA_CONFIG.startingStamina,
            maxStamina: STAMINA_CONFIG.startingMaxStamina
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
            this.stats.maxHealth = COMBAT_CONFIG.godMode.health;
            this.stats.health = COMBAT_CONFIG.godMode.health;
        } else {
            this.stats.maxHealth = XP_CONFIG.progression.startingMaxHealth;
            this.stats.health = XP_CONFIG.progression.startingHealth;
        }
    }
    
    /**
     * Get current player stats
     */
    getStats(): PlayerStats {
        // Sync stamina values from stamina system
        const staminaSystem = getStaminaSystem();
        const staminaState = staminaSystem.getState();
        this.stats.stamina = staminaState.current;
        this.stats.maxStamina = staminaState.max;
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
            this.stats.maxHealth += XP_CONFIG.progression.healthIncreasePerLevel;
            this.stats.health = this.stats.maxHealth;
            this.stats.xpToLevel = Math.floor(this.stats.xpToLevel * XP_CONFIG.progression.xpScalingFactor);
            
            // Increase max stamina on level up
            const staminaSystem = getStaminaSystem();
            staminaSystem.increaseMaxStamina(staminaSystem.getStaminaIncreasePerLevel());
            
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
            
            // Track player death
            levelStatsTracker.recordDeath();
            
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
            level: XP_CONFIG.progression.startingLevel,
            maxHealth: XP_CONFIG.progression.startingMaxHealth,
            health: XP_CONFIG.progression.startingHealth,
            xp: XP_CONFIG.progression.startingXP,
            xpToLevel: XP_CONFIG.progression.startingXPToLevel,
            stamina: STAMINA_CONFIG.startingStamina,
            maxStamina: STAMINA_CONFIG.startingMaxStamina
        };
        
        // Reset stamina system
        const staminaSystem = getStaminaSystem();
        staminaSystem.reset();
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
