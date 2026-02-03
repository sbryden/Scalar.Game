/**
 * Player Stats System
 * Manages player health, XP, stamina, fuel, and leveling progression
 * Extracted from xpOrbs.js for better separation of concerns
 */
import gameState from '../utils/GameContext';
import { COMBAT_CONFIG, XP_CONFIG, STAMINA_CONFIG, FUEL_CONFIG, COMPANION_CONFIG, getOptions, getDifficultyConfig } from '../config';
import { initializeStaminaSystem, getStaminaSystem } from './StaminaSystem';
import { initializeFuelSystem, getFuelSystem } from './FuelSystem';
import stageStatsTracker from './StageStatsTracker';
import type { PlayerStats, Difficulty, CompanionKind, CompanionState } from '../types/game';

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
        
        // Initialize fuel system
        initializeFuelSystem(FUEL_CONFIG);
        
        const options = getOptions();
        
        this.stats = {
            level: XP_CONFIG.progression.startingLevel,
            maxHealth: options.startingHP,
            health: options.startingHP,
            xp: XP_CONFIG.progression.startingXP,
            xpToLevel: XP_CONFIG.progression.startingXPToLevel,
            stamina: STAMINA_CONFIG.startingStamina,
            maxStamina: STAMINA_CONFIG.startingMaxStamina,
            fuel: FUEL_CONFIG.startingFuel,
            maxFuel: FUEL_CONFIG.startingMaxFuel,
            hasWolfCompanion: false
        };
        this.difficulty = 'normal';
        this.onLevelUp = null;
        this.onGameOver = null;
        
        // Sync fuel system with starting player level
        const fuelSystem = getFuelSystem();
        fuelSystem.setPlayerLevel(this.stats.level);
    }
    
    /**
     * Initialize stats based on difficulty
     */
    initializeDifficulty(difficulty: Difficulty): void {
        this.difficulty = difficulty;
        
        const options = getOptions();
        
        if (difficulty === 'godMode') {
            // Set near-infinite health
            this.stats.maxHealth = COMBAT_CONFIG.godMode.health;
            this.stats.health = COMBAT_CONFIG.godMode.health;
            
            // Set near-infinite stamina (let normal mechanics work with high values)
            const staminaSystem = getStaminaSystem();
            staminaSystem.increaseMaxStamina(COMBAT_CONFIG.godMode.health - staminaSystem.getState().max);
        } else {
            // Restore normal health values
            this.stats.maxHealth = options.startingHP;
            this.stats.health = options.startingHP;
            
            // Restore normal stamina values based on current level progression
            const staminaSystem = getStaminaSystem();
            // Clear any temporary god mode boosts
            staminaSystem.reset();

            const level = this.stats.level;
            const targetMaxStamina =
                STAMINA_CONFIG.startingMaxStamina +
                (level - 1) * STAMINA_CONFIG.staminaIncreasePerLevel;
            const deltaMaxStamina = targetMaxStamina - STAMINA_CONFIG.startingMaxStamina;

            if (deltaMaxStamina > 0) {
                staminaSystem.increaseMaxStamina(deltaMaxStamina);
            }
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
        
        // Sync fuel values from fuel system
        const fuelSystem = getFuelSystem();
        const fuelState = fuelSystem.getState();
        this.stats.fuel = fuelState.current;
        this.stats.maxFuel = fuelState.max;
        
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
     * XP is scaled by difficulty multiplier
     */
    gainXP(amount: number): void {
        // Apply difficulty XP multiplier
        const difficultyConfig = getDifficultyConfig(this.difficulty);
        const scaledXP = Math.round(amount * difficultyConfig.xpMultiplier);
        
        this.stats.xp += scaledXP;
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
            
            // Update fuel system player level for regeneration rate scaling
            const fuelSystem = getFuelSystem();
            fuelSystem.setPlayerLevel(this.stats.level);
            
            // Update level text UI
            if (gameState.levelText) {
                gameState.levelText.setText(`LEVEL: ${this.stats.level}`);
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
            stageStatsTracker.recordDeath();
            
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
        const options = getOptions();
        
        this.stats = {
            level: XP_CONFIG.progression.startingLevel,
            maxHealth: options.startingHP,
            health: options.startingHP,
            xp: XP_CONFIG.progression.startingXP,
            xpToLevel: XP_CONFIG.progression.startingXPToLevel,
            stamina: STAMINA_CONFIG.startingStamina,
            maxStamina: STAMINA_CONFIG.startingMaxStamina,
            fuel: FUEL_CONFIG.startingFuel,
            maxFuel: FUEL_CONFIG.startingMaxFuel,
            hasWolfCompanion: false,
            companions: new Map<CompanionKind, CompanionState>()
        };
        
        // Reset stamina system
        const staminaSystem = getStaminaSystem();
        staminaSystem.reset();
        
        // Reset fuel system
        const fuelSystem = getFuelSystem();
        fuelSystem.reset();
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
    
    /**
     * Check if player has wolf companion
     */
    hasWolfCompanion(): boolean {
        return this.stats.hasWolfCompanion || false;
    }
    
    /**
     * Grant wolf companion to player
     */
    grantWolfCompanion(): void {
        this.stats.hasWolfCompanion = true;
    }
    
    /**
     * Get companion state for a specific kind
     */
    getCompanionState(kind: CompanionKind): CompanionState | undefined {
        return this.stats.companions?.get(kind);
    }
    
    /**
     * Get all active companions (alive = true)
     */
    getActiveCompanions(): CompanionState[] {
        if (!this.stats.companions) return [];
        return Array.from(this.stats.companions.values()).filter(c => c.alive);
    }
    
    /**
     * Calculate max HP for a companion at current player level
     */
    getCompanionMaxHP(kind: CompanionKind): number {
        const config = COMPANION_CONFIG[kind];
        const options = getOptions();
        const basePlayerHP = options.startingHP +
            (this.stats.level - 1) * XP_CONFIG.progression.healthIncreasePerLevel;
        return Math.floor(basePlayerHP * config.baseHealthFactor);
    }
    
    /**
     * Calculate max stamina for a companion at current player level
     */
    getCompanionMaxStamina(kind: CompanionKind): number {
        const config = COMPANION_CONFIG[kind];
        if ('stamina' in config) {
            return config.stamina.startingMaxStamina +
                (this.stats.level - 1) * config.stamina.staminaIncreasePerLevel;
        }
        return 100; // Default
    }
    
    /**
     * Grant a companion to the player
     * If already owned and alive, refreshes HP/stamina to 100%
     * If dead this run, does nothing (no revival)
     * If not owned yet, creates the companion state
     */
    grantCompanion(kind: CompanionKind): { spawned: boolean; refreshed: boolean } {
        if (!this.stats.companions) {
            this.stats.companions = new Map<CompanionKind, CompanionState>();
        }
        
        const existing = this.stats.companions.get(kind);
        
        if (existing) {
            // Already owned - check if dead this run
            if (existing.diedThisRun) {
                // Cannot revive within same run
                return { spawned: false, refreshed: false };
            }
            
            if (existing.alive) {
                // Refresh HP and stamina to full
                existing.currentHealth = existing.maxHealth;
                existing.currentStamina = existing.maxStamina;
                return { spawned: false, refreshed: true };
            } else {
                // Companion exists but is not currently alive and has not died this run
                // Respawn and refresh instead of treating as a new unlock
                existing.alive = true;
                existing.currentHealth = existing.maxHealth;
                existing.currentStamina = existing.maxStamina;
                return { spawned: false, refreshed: true };
            }
        }
        
        // Create new companion state
        const maxHP = this.getCompanionMaxHP(kind);
        const maxStamina = this.getCompanionMaxStamina(kind);
        
        const companionState: CompanionState = {
            kind,
            alive: true,
            diedThisRun: false,
            currentHealth: maxHP,
            maxHealth: maxHP,
            currentStamina: maxStamina,
            maxStamina: maxStamina
        };
        
        this.stats.companions.set(kind, companionState);
        
        // Backwards compatibility
        if (kind === 'wolf') {
            this.stats.hasWolfCompanion = true;
        }
        
        return { spawned: true, refreshed: false };
    }
    
    /**
     * Update companion state
     */
    updateCompanionState(kind: CompanionKind, updates: Partial<CompanionState>): void {
        const state = this.stats.companions?.get(kind);
        if (state) {
            Object.assign(state, updates);
        }
    }
    
    /**
     * Mark companion as dead (permanently for this run)
     */
    markCompanionDead(kind: CompanionKind): void {
        const state = this.stats.companions?.get(kind);
        if (state) {
            state.alive = false;
            state.diedThisRun = true;
            state.currentHealth = 0;
        }
    }
    
    /**
     * Clear all companion runtime flags on continue (player death)
     * Keeps diedThisRun to prevent revival within same run
     */
    clearCompanionsOnContinue(): void {
        if (!this.stats.companions) return;
        
        for (const state of this.stats.companions.values()) {
            // Mark as not alive (entity destroyed), but keep diedThisRun flag
            state.alive = false;
        }
    }
    
    /**
     * Full companion reset (new run/biome)
     * Clears diedThisRun flags so companions can be re-earned
     */
    resetCompanions(): void {
        this.stats.companions?.clear();
        this.stats.hasWolfCompanion = false;
    }
}

// Singleton instance management
let playerStatsSystemInstance: PlayerStatsSystem | null = null;

/**
 * Get the PlayerStatsSystem instance, creating it if necessary
 */
export function getPlayerStatsSystem(): PlayerStatsSystem {
    if (!playerStatsSystemInstance) {
        playerStatsSystemInstance = new PlayerStatsSystem();
    }
    return playerStatsSystemInstance;
}

/**
 * Reset the PlayerStatsSystem instance (useful for testing)
 */
export function resetPlayerStatsSystem(): void {
    playerStatsSystemInstance = null;
}

// Default export for backward compatibility
export default getPlayerStatsSystem();
