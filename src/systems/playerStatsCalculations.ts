/**
 * Player Stats Calculations
 * Pure utility functions for player stats math, extracted for testability.
 */

import { XP_CONFIG } from '../config';

export interface LevelUpResult {
    newLevel: number;
    newMaxHealth: number;
    newXP: number;
    newXPToLevel: number;
    levelsGained: number;
}

/**
 * Calculate the result of gaining XP, potentially leveling up multiple times
 * @param currentLevel Current player level
 * @param currentXP Current XP amount
 * @param currentXPToLevel XP required to reach next level
 * @param currentMaxHealth Current max health
 * @param xpGained Amount of XP gained
 * @returns New stats after XP gain and any level ups
 */
export function calculateXPGain(
    currentLevel: number,
    currentXP: number,
    currentXPToLevel: number,
    currentMaxHealth: number,
    xpGained: number
): LevelUpResult {
    let level = currentLevel;
    let xp = currentXP + xpGained;
    let xpToLevel = currentXPToLevel;
    let maxHealth = currentMaxHealth;
    let levelsGained = 0;

    // Process multiple level ups if enough XP
    while (xp >= xpToLevel) {
        xp -= xpToLevel;
        level += 1;
        maxHealth += XP_CONFIG.progression.healthIncreasePerLevel;
        xpToLevel = Math.floor(xpToLevel * XP_CONFIG.progression.xpScalingFactor);
        levelsGained += 1;
    }

    return {
        newLevel: level,
        newMaxHealth: maxHealth,
        newXP: xp,
        newXPToLevel: xpToLevel,
        levelsGained
    };
}

/**
 * Calculate damage to apply to player
 * @param currentHealth Current health
 * @param damageAmount Damage to apply
 * @returns New health (min 0)
 */
export function calculateDamage(currentHealth: number, damageAmount: number): number {
    return Math.max(0, currentHealth - damageAmount);
}

/**
 * Calculate healing to apply to player
 * @param currentHealth Current health
 * @param maxHealth Maximum health
 * @param healAmount Amount to heal
 * @returns New health (max = maxHealth)
 */
export function calculateHealing(
    currentHealth: number,
    maxHealth: number,
    healAmount: number
): number {
    return Math.min(maxHealth, currentHealth + healAmount);
}

/**
 * Check if player should die from damage
 * @param healthAfterDamage Health remaining after damage
 * @returns True if player is dead
 */
export function isPlayerDead(healthAfterDamage: number): boolean {
    return healthAfterDamage <= 0;
}

/**
 * Calculate XP required to reach a target level from level 1
 * @param targetLevel The level to calculate total XP for
 * @returns Total XP required to reach that level
 */
export function calculateTotalXPForLevel(targetLevel: number): number {
    let totalXP = 0;
    let xpToLevel: number = XP_CONFIG.progression.startingXPToLevel;
    
    for (let level = 1; level < targetLevel; level++) {
        totalXP += xpToLevel;
        xpToLevel = Math.floor(xpToLevel * XP_CONFIG.progression.xpScalingFactor);
    }
    
    return totalXP;
}
