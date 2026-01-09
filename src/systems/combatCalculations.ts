/**
 * Combat Calculations
 * Pure utility functions for combat math, extracted for testability.
 */

import { PLAYER_COMBAT_CONFIG } from '../config';

/**
 * Calculate size-based damage multiplier
 * @param playerScale Player's current scale
 * @param enemyWidth Enemy's width in pixels
 * @returns Damage multiplier based on relative sizes
 */
export function calculateSizeMultiplier(playerScale: number, enemyWidth: number): number {
    // Approximate enemy scale based on width (30 is standard enemy width)
    const standardEnemyWidth = PLAYER_COMBAT_CONFIG.standardEnemyWidth;
    const enemyScale = enemyWidth / standardEnemyWidth;
    
    // Compare player scale to enemy scale
    if (playerScale > enemyScale * 1.2) {
        // Player significantly larger - size advantage
        return PLAYER_COMBAT_CONFIG.sizeAdvantageMultiplier;
    } else if (playerScale < enemyScale * 0.8) {
        // Player significantly smaller - size disadvantage
        return PLAYER_COMBAT_CONFIG.sizeDisadvantageMultiplier;
    }
    
    // Similar size - no modifier
    return 1.0;
}

/**
 * Calculate velocity magnitude from x and y components
 * @param vx Velocity X component
 * @param vy Velocity Y component
 * @returns Magnitude of velocity vector
 */
export function calculateVelocityMagnitude(vx: number, vy: number): number {
    return Math.sqrt(vx * vx + vy * vy);
}

/**
 * Calculate positioning multiplier based on attack angle
 * @param dotProduct Dot product of attack direction and direction to enemy
 * @returns Positioning multiplier (head-on, rear, or neutral)
 */
export function calculatePositioningMultiplier(dotProduct: number): number {
    // Head-on attack: moving directly toward enemy (high dot product)
    if (dotProduct > PLAYER_COMBAT_CONFIG.headOnDetectionThreshold) {
        return PLAYER_COMBAT_CONFIG.headOnBonusMultiplier;
    }
    
    // Rear attack: moving away or very oblique angle (less effective but safer)
    if (dotProduct < 0) {
        return PLAYER_COMBAT_CONFIG.rearAttackMultiplier;
    }
    
    // Normal attack (no special positioning)
    return 1.0;
}

/**
 * Calculate XP required for next level
 * @param currentXPToLevel Current XP required to level up
 * @param scalingFactor XP scaling factor per level
 * @returns XP required for the next level
 */
export function calculateNextLevelXP(currentXPToLevel: number, scalingFactor: number): number {
    return Math.floor(currentXPToLevel * scalingFactor);
}

/**
 * Calculate max health after level up
 * @param currentMaxHealth Current max health
 * @param healthIncreasePerLevel Health increase per level
 * @returns New max health value
 */
export function calculateMaxHealthAfterLevelUp(
    currentMaxHealth: number,
    healthIncreasePerLevel: number
): number {
    return currentMaxHealth + healthIncreasePerLevel;
}

/**
 * Clamp a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
