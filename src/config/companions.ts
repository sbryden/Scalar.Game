/**
 * Companion Configuration
 * Settings for companion champions including wolf, fish, and hawk
 */

import type { CompanionKind } from '../types/game';

/**
 * Wolf companion configuration
 */
export const WOLF_COMPANION_CONFIG = {
    // Visual
    texture: 'wolf_companion',
    scale: 0.15,
    tint: {
        normal: 0xffffff,
        melee: 0x00ffff,
        exhausted: 0x888888
    },
    
    // Health scaling
    baseHealthFactor: 0.5, // Wolf has half the player's base HP at their level
    
    // Stamina (shield-like mechanic, but faster depletion)
    stamina: {
        startingMaxStamina: 100,
        startingStamina: 100,
        rechargeRate: 25, // Per second
        consumptionRate: 60, // Per second (vs player's 40, so 1.5x faster)
        exhaustionThreshold: 20,
        depletionPauseDuration: 2000, // ms
        staminaIncreasePerLevel: 5
    },
    
    // Combat
    baseDamage: 15,
    damageScalePerLevel: 2,
    meleeModeDamageReduction: 0.7, // 70% damage reduction when in melee mode
    
    // Behavior
    followDistance: 80, // Distance to maintain from player
    followSpeed: 150,
    attackRange: 60, // Range to engage enemies in melee
    
    // Visual bars
    barWidth: 40,
    barHeight: 4,
    barOffsetY: -30,
    barSpacing: 6,
    healthBarColor: 0x00ff00,
    staminaBarColor: 0x00ffff,
    barBackgroundColor: 0x000000,
    barBackgroundAlpha: 0.5,
    
    // Biome restriction
    allowedBiomes: ['land'] as const
} as const;

/**
 * Future: Fish companion configuration (underwater biome)
 */
export const FISH_COMPANION_CONFIG = {
    texture: 'fish_companion',
    baseHealthFactor: 0.5,
    allowedBiomes: ['water'] as const
    // TODO: Add full config when fish companion is implemented
} as const;

/**
 * Future: Hawk companion configuration (air biome)
 */
export const HAWK_COMPANION_CONFIG = {
    texture: 'hawk_companion',
    baseHealthFactor: 0.5,
    allowedBiomes: ['air'] as const
    // TODO: Add full config when hawk companion is implemented
} as const;

/**
 * Master companion configuration by kind
 */
export const COMPANION_CONFIG = {
    wolf: WOLF_COMPANION_CONFIG,
    fish: FISH_COMPANION_CONFIG,
    hawk: HAWK_COMPANION_CONFIG
} as const;

/**
 * Biome types for companion restrictions
 */
export type BiomeType = 'land' | 'water' | 'air';

/**
 * Helper to get companion config by kind
 */
export function getCompanionConfig(kind: CompanionKind) {
    return COMPANION_CONFIG[kind];
}

/**
 * Helper to check if companion is allowed in a biome
 */
export function isCompanionAllowedInBiome(kind: CompanionKind, biome: BiomeType): boolean {
    const config = getCompanionConfig(kind);
    return config.allowedBiomes.includes(biome as any);
}
