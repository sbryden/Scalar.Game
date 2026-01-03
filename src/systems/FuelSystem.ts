/**
 * Fuel System
 * Manages player fuel for size transformation mechanics
 * - Separate from stamina (used for melee combat)
 * - Initial 20-second cooldown when game starts
 * - Automatic fuel regeneration (increases with player level)
 * - Fuel consumption on size transformations
 * - Low fuel warning mechanics
 */

export interface FuelState {
    current: number;
    max: number;
    isLowFuel: boolean;           // Below 25% threshold
    isDepleted: boolean;           // At 0%, cannot transform
    regenerationRate: number;      // Fuel regenerated per second
    consumptionAmount: number;     // Fuel consumed per transformation
    lowFuelThreshold: number;      // Percentage (0.25 = 25%)
    initialCooldownRemaining: number; // Time left in initial cooldown (in ms)
}

export interface FuelConfig {
    startingMaxFuel: number;
    startingFuel: number;          // Start at 0 due to initial cooldown
    regenerationRate: number;      // Per second (base rate)
    regenerationRatePerLevel: number; // Increase per player level
    consumptionAmount: number;     // Consumed per size change
    lowFuelThreshold: number;      // 0.25 = 25%
    initialCooldownDuration: number; // 20 seconds in ms
}

type FuelDepletedCallback = () => void;
type LowFuelCallback = () => void;

export class FuelSystem {
    private state: FuelState;
    private config: FuelConfig;
    private onFuelDepleted: FuelDepletedCallback | null;
    private onLowFuel: LowFuelCallback | null;
    private lastUpdateTime: number;
    private currentPlayerLevel: number;

    constructor(config: FuelConfig) {
        this.config = config;
        this.state = {
            current: config.startingFuel,
            max: config.startingMaxFuel,
            isLowFuel: false,
            isDepleted: true, // Start depleted due to initial cooldown
            regenerationRate: config.regenerationRate,
            consumptionAmount: config.consumptionAmount,
            lowFuelThreshold: config.lowFuelThreshold,
            initialCooldownRemaining: config.initialCooldownDuration
        };
        this.onFuelDepleted = null;
        this.onLowFuel = null;
        this.lastUpdateTime = 0;
        this.currentPlayerLevel = 1;
    }

    /**
     * Get current fuel state
     */
    getState(): Readonly<FuelState> {
        return this.state;
    }

    /**
     * Get current fuel percentage (0-1)
     */
    getFuelPercent(): number {
        return this.state.max > 0 ? this.state.current / this.state.max : 0;
    }

    /**
     * Check if player can perform size transformation
     */
    canTransform(): boolean {
        // Cannot transform during initial cooldown
        if (this.state.initialCooldownRemaining > 0) {
            return false;
        }
        // Require sufficient fuel for a transformation
        return this.state.current >= this.state.consumptionAmount;
    }

    /**
     * Update fuel system (call every frame)
     * Handles automatic regeneration and cooldown
     * @param gameTime - Current game time from Phaser scene (scene.time.now)
     */
    update(gameTime: number): void {
        // Initialize lastUpdateTime on first call
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = gameTime;
            return; // Skip processing on first frame
        }

        const deltaMs = gameTime - this.lastUpdateTime;
        const deltaSeconds = deltaMs / 1000;
        this.lastUpdateTime = gameTime;

        // Decrease initial cooldown timer
        if (this.state.initialCooldownRemaining > 0) {
            this.state.initialCooldownRemaining -= deltaMs;
            this.state.initialCooldownRemaining = Math.max(0, this.state.initialCooldownRemaining);
            
            // Once cooldown expires, enable fuel system
            if (this.state.initialCooldownRemaining === 0 && this.state.current === 0) {
                this.state.current = this.state.max; // Fill to max when cooldown ends
            }
        }

        // Regenerate fuel (only if initial cooldown has expired)
        if (this.state.initialCooldownRemaining <= 0) {
            this.regenerateFuel(this.state.regenerationRate * deltaSeconds);
        }

        // Update state flags
        this.updateStateFlags();
    }

    /**
     * Regenerate fuel automatically
     * Rate increases with player level
     */
    private regenerateFuel(baseAmount: number): void {
        // baseAmount is already this.state.regenerationRate * deltaSeconds
        // Infer deltaSeconds so we can apply the per-second level bonus correctly.
        let totalAmount = baseAmount;

        if (this.state.regenerationRate > 0) {
            const deltaSeconds = baseAmount / this.state.regenerationRate;
            const levelBonusPerSecond = (this.currentPlayerLevel - 1) * this.config.regenerationRatePerLevel;
            const levelBonus = levelBonusPerSecond * deltaSeconds;
            totalAmount += levelBonus;
        }
        
        this.state.current = Math.min(this.state.max, this.state.current + totalAmount);
    }

    /**
     * Consume fuel for size transformation
     * @returns true if fuel was consumed successfully, false if insufficient fuel
     */
    consumeFuel(): boolean {
        // Check if we have enough fuel
        if (this.state.current < this.state.consumptionAmount) {
            if (this.onFuelDepleted) {
                this.onFuelDepleted();
            }
            return false;
        }

        const previousFuel = this.state.current;
        this.state.current = Math.max(0, this.state.current - this.state.consumptionAmount);

        // Check if fuel just hit 0
        if (previousFuel > 0 && this.state.current === 0) {
            this.state.isDepleted = true;
            if (this.onFuelDepleted) {
                this.onFuelDepleted();
            }
        }

        this.updateStateFlags();
        return true;
    }

    /**
     * Update low fuel and depletion state flags
     */
    private updateStateFlags(): void {
        const percent = this.getFuelPercent();
        
        const wasLowFuel = this.state.isLowFuel;
        
        // Update low fuel state (below 25%)
        this.state.isLowFuel = percent <= this.state.lowFuelThreshold && percent > 0;
        
        // Update depletion state
        this.state.isDepleted = this.state.current === 0;
        
        // Trigger low fuel callback if entering low fuel state
        if (!wasLowFuel && this.state.isLowFuel && this.onLowFuel) {
            this.onLowFuel();
        }
    }

    /**
     * Set the current player level for regeneration rate scaling
     */
    setPlayerLevel(level: number): void {
        this.currentPlayerLevel = level;
    }

    /**
     * Increase max fuel (called on level up if needed)
     */
    increaseMaxFuel(amount: number): void {
        this.state.max += amount;
        // Don't auto-fill to max on level up (unlike stamina)
    }

    /**
     * Set callback for fuel depletion events
     */
    setFuelDepletedCallback(callback: FuelDepletedCallback): void {
        this.onFuelDepleted = callback;
    }

    /**
     * Set callback for low fuel warning events
     */
    setLowFuelCallback(callback: LowFuelCallback): void {
        this.onLowFuel = callback;
    }

    /**
     * Reset fuel system to initial state
     * @param gameTime - Optional current game time from Phaser scene
     * @param skipCooldown - If true, skip initial cooldown and start with full fuel
     */
    reset(gameTime?: number, skipCooldown?: boolean): void {
        if (skipCooldown) {
            this.state.current = this.config.startingMaxFuel;
            this.state.initialCooldownRemaining = 0;
        } else {
            this.state.current = this.config.startingFuel;
            this.state.initialCooldownRemaining = this.config.initialCooldownDuration;
        }
        
        this.state.max = this.config.startingMaxFuel;
        this.state.isLowFuel = false;
        this.state.isDepleted = !skipCooldown; // Start depleted unless skipping cooldown
        this.state.regenerationRate = this.config.regenerationRate;
        this.state.consumptionAmount = this.config.consumptionAmount;
        this.state.lowFuelThreshold = this.config.lowFuelThreshold;
        this.lastUpdateTime = gameTime ?? 0;
        this.currentPlayerLevel = 1;
    }

    /**
     * Get initial cooldown remaining in seconds
     */
    getInitialCooldownSeconds(): number {
        return Math.ceil(this.state.initialCooldownRemaining / 1000);
    }
}

// Export singleton instance (will be initialized with config in main game)
let fuelSystemInstance: FuelSystem | null = null;

export function initializeFuelSystem(config: FuelConfig): FuelSystem {
    fuelSystemInstance = new FuelSystem(config);
    return fuelSystemInstance;
}

export function getFuelSystem(): FuelSystem {
    if (!fuelSystemInstance) {
        throw new Error('FuelSystem not initialized. Call initializeFuelSystem first.');
    }
    return fuelSystemInstance;
}

export default {
    initialize: initializeFuelSystem,
    getInstance: getFuelSystem
};
