/**
 * Stamina System
 * Manages player stamina for melee/shield mechanics
 * - Automatic stamina recharge
 * - Stamina consumption during melee mode
 * - Exhaustion mechanics (20% threshold, 0% forced stop)
 * - XP orb stamina restoration
 * - Level-based max stamina progression
 */

export interface StaminaState {
    current: number;
    max: number;
    isExhausted: boolean;      // Below 20% threshold
    isDepleted: boolean;        // At 0%, ability stopped
    needsReset: boolean;        // Must release and press again
    rechargeRate: number;       // Stamina recharged per second
    consumptionRate: number;    // Stamina consumed per second in melee mode
    exhaustionThreshold: number; // Percentage (0.2 = 20%)
    depletionPauseRemaining: number; // Time left in depletion pause (in ms)
}

export interface StaminaConfig {
    startingMaxStamina: number;
    startingStamina: number;
    rechargeRate: number;          // Per second
    consumptionRate: number;       // Per second in melee mode
    exhaustionThreshold: number;   // 0.2 = 20%
    xpOrbRestoration: number;      // Fixed amount per orb
    staminaIncreasePerLevel: number; // Max stamina increase per level
    depletionPauseDuration: number; // Time to pause before recharging when stamina hits 0 (in ms)
}

type StaminaDepletedCallback = () => void;

export class StaminaSystem {
    private state: StaminaState;
    private config: StaminaConfig;
    private onStaminaDepleted: StaminaDepletedCallback | null;
    private lastUpdateTime: number;

    constructor(config: StaminaConfig) {
        this.config = config;
        this.state = {
            current: config.startingStamina,
            max: config.startingMaxStamina,
            isExhausted: false,
            isDepleted: false,
            needsReset: false,
            rechargeRate: config.rechargeRate,
            consumptionRate: config.consumptionRate,
            exhaustionThreshold: config.exhaustionThreshold,
            depletionPauseRemaining: 0
        };
        this.onStaminaDepleted = null;
        this.lastUpdateTime = Date.now();
    }

    /**
     * Get current stamina state
     */
    getState(): Readonly<StaminaState> {
        return this.state;
    }

    /**
     * Get current stamina percentage (0-1)
     */
    getStaminaPercent(): number {
        return this.state.max > 0 ? this.state.current / this.state.max : 0;
    }

    /**
     * Check if player can activate melee mode
     * Cannot activate if below exhaustion threshold (20%) or needs reset
     */
    canActivateMeleeMode(): boolean {
        if (this.state.needsReset) {
            return false;
        }
        // Cannot activate if below 20%
        const percent = this.getStaminaPercent();
        return percent > this.state.exhaustionThreshold;
    }

    /**
     * Update stamina system (call every frame)
     * Handles automatic recharge and melee mode consumption
     * @param isMeleeActive - Whether melee mode is currently active
     */
    update(isMeleeActive: boolean): void {
        const now = Date.now();
        const deltaMs = now - this.lastUpdateTime;
        const deltaSeconds = deltaMs / 1000;
        this.lastUpdateTime = now;

        // Decrease depletion pause timer
        if (this.state.depletionPauseRemaining > 0) {
            this.state.depletionPauseRemaining -= deltaMs;
            this.state.depletionPauseRemaining = Math.max(0, this.state.depletionPauseRemaining);
        }

        if (isMeleeActive) {
            // Consume stamina while melee mode is active
            this.consumeStamina(this.state.consumptionRate * deltaSeconds);
        } else if (this.state.depletionPauseRemaining <= 0) {
            // Recharge stamina when not in melee mode and depletion pause has expired
            this.rechargeStamina(this.state.rechargeRate * deltaSeconds);
        }

        // Update state flags
        this.updateStateFlags();
    }

    /**
     * Consume stamina (used during melee mode)
     */
    private consumeStamina(amount: number): void {
        const previousStamina = this.state.current;
        this.state.current = Math.max(0, this.state.current - amount);

        // Check if stamina just reached 0
        if (previousStamina > 0 && this.state.current === 0) {
            this.state.isDepleted = true;
            this.state.needsReset = true;
            
            // Start depletion pause before recharge can resume
            this.state.depletionPauseRemaining = this.config.depletionPauseDuration;
            
            // Trigger depletion callback
            if (this.onStaminaDepleted) {
                this.onStaminaDepleted();
            }
        }
    }

    /**
     * Recharge stamina automatically
     */
    private rechargeStamina(amount: number): void {
        this.state.current = Math.min(this.state.max, this.state.current + amount);
    }

    /**
     * Restore stamina (e.g., from collecting XP orbs)
     */
    restoreStamina(amount: number): void {
        this.state.current = Math.min(this.state.max, this.state.current + amount);
        this.updateStateFlags();
    }

    /**
     * Reset the ability (called when player releases melee button)
     * Allows re-engagement once stamina is above threshold
     */
    resetAbility(): void {
        if (this.state.needsReset) {
            // Can only clear needsReset if stamina is above threshold
            const percent = this.getStaminaPercent();
            if (percent > this.state.exhaustionThreshold) {
                this.state.needsReset = false;
                this.state.isDepleted = false;
            }
        }
    }

    /**
     * Update exhaustion and depletion state flags
     */
    private updateStateFlags(): void {
        const percent = this.getStaminaPercent();
        
        // Update exhaustion state (below 20%)
        this.state.isExhausted = percent <= this.state.exhaustionThreshold;
        
        // Update depletion state
        this.state.isDepleted = this.state.current === 0;
    }

    /**
     * Increase max stamina (called on level up)
     */
    increaseMaxStamina(amount: number): void {
        this.state.max += amount;
        // Restore to max on level up
        this.state.current = this.state.max;
    }

    /**
     * Set callback for stamina depletion events
     */
    setStaminaDepletedCallback(callback: StaminaDepletedCallback): void {
        this.onStaminaDepleted = callback;
    }

    /**
     * Reset stamina to initial state
     */
    reset(): void {
        this.state.current = this.config.startingStamina;
        this.state.max = this.config.startingMaxStamina;
        this.state.isExhausted = false;
        this.state.isDepleted = false;
        this.state.needsReset = false;
        this.state.depletionPauseRemaining = 0;
        this.lastUpdateTime = Date.now();
    }

    /**
     * Get max stamina increase per level (for consistency)
     */
    getStaminaIncreasePerLevel(): number {
        return this.config.staminaIncreasePerLevel;
    }
}

// Export singleton instance (will be initialized with config in main game)
let staminaSystemInstance: StaminaSystem | null = null;

export function initializeStaminaSystem(config: StaminaConfig): StaminaSystem {
    staminaSystemInstance = new StaminaSystem(config);
    return staminaSystemInstance;
}

export function getStaminaSystem(): StaminaSystem {
    if (!staminaSystemInstance) {
        throw new Error('StaminaSystem not initialized. Call initializeStaminaSystem first.');
    }
    return staminaSystemInstance;
}

export default {
    initialize: initializeStaminaSystem,
    getInstance: getStaminaSystem
};
