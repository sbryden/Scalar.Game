/**
 * UI Configuration
 * Visual settings, health bars, stamina, fuel displays
 */

// Visual configuration
export const VISUAL_CONFIG = {
    viewportWidth: 1024,
    healthBar: {
        width: 30,
        height: 4,
        offsetY: 10,
        depth: 50,
        displayOriginY: 2
    },
    fishSpawn: {
        fishTextureThreshold: 0.25
    }
} as const;

// Stamina configuration
export const STAMINA_CONFIG = {
    startingMaxStamina: 100,
    startingStamina: 100,
    rechargeRate: 10,
    consumptionRate: 25,
    exhaustionThreshold: 0.2,
    xpOrbRestoration: 15,
    staminaIncreasePerLevel: 10,
    depletionPauseDuration: 2500
} as const;

// UI configuration for stamina display
export const STAMINA_UI_CONFIG = {
    exhaustionFlashDuration: 300,
    colors: {
        normal: 0x00BFFF,
        exhaustion: 0xFF8800,
        depleted: 0xFF0000
    }
} as const;

// Fuel configuration (for size transformations)
export const FUEL_CONFIG = {
    startingMaxFuel: 100,
    startingFuel: 0,
    regenerationRate: 5,
    regenerationRatePerLevel: 0.5,
    consumptionAmount: 20,
    lowFuelThreshold: 0.25,
    initialCooldownDuration: 20000
} as const;

// UI configuration for fuel display
export const FUEL_UI_CONFIG = {
    lowFuelFlashDuration: 300,
    colors: {
        normal: 0xFFD700,
        lowFuel: 0xFF8800,
        depleted: 0xFF0000
    }
} as const;
