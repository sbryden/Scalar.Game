/**
 * Combat Calculations Tests
 * Tests for pure combat math functions
 */
import { describe, it, expect } from 'vitest';
import {
    calculateSizeMultiplier,
    calculateVelocityMagnitude,
    calculatePositioningMultiplier,
    calculateNextLevelXP,
    calculateMaxHealthAfterLevelUp,
    clamp
} from './combatCalculations';
import { PLAYER_COMBAT_CONFIG } from '../config';

describe('Combat Calculations', () => {
    describe('calculateSizeMultiplier', () => {
        it('returns size advantage multiplier when player is significantly larger', () => {
            // Player scale 2.0, enemy width 30 (scale 1.0) -> player is 2x larger
            const result = calculateSizeMultiplier(2.0, 30);
            expect(result).toBe(PLAYER_COMBAT_CONFIG.sizeAdvantageMultiplier);
        });

        it('returns size disadvantage multiplier when player is significantly smaller', () => {
            // Player scale 0.5, enemy width 60 (scale 2.0) -> player is 4x smaller
            const result = calculateSizeMultiplier(0.5, 60);
            expect(result).toBe(PLAYER_COMBAT_CONFIG.sizeDisadvantageMultiplier);
        });

        it('returns 1.0 when sizes are similar', () => {
            // Player scale 1.0, enemy width 30 (scale 1.0) -> same size
            const result = calculateSizeMultiplier(1.0, 30);
            expect(result).toBe(1.0);
        });

        it('returns 1.0 when player is slightly larger (within threshold)', () => {
            // Player scale 1.15, enemy width 30 (scale 1.0) -> 15% larger (below 20% threshold)
            const result = calculateSizeMultiplier(1.15, 30);
            expect(result).toBe(1.0);
        });

        it('returns 1.0 when player is slightly smaller (within threshold)', () => {
            // Player scale 0.85, enemy width 30 (scale 1.0) -> 15% smaller (above 80% threshold)
            const result = calculateSizeMultiplier(0.85, 30);
            expect(result).toBe(1.0);
        });
    });

    describe('calculateVelocityMagnitude', () => {
        it('returns correct magnitude for positive velocities', () => {
            // 3-4-5 triangle
            expect(calculateVelocityMagnitude(3, 4)).toBe(5);
        });

        it('returns correct magnitude for negative velocities', () => {
            expect(calculateVelocityMagnitude(-3, -4)).toBe(5);
        });

        it('returns 0 for zero velocity', () => {
            expect(calculateVelocityMagnitude(0, 0)).toBe(0);
        });

        it('handles horizontal-only velocity', () => {
            expect(calculateVelocityMagnitude(100, 0)).toBe(100);
        });

        it('handles vertical-only velocity', () => {
            expect(calculateVelocityMagnitude(0, 200)).toBe(200);
        });
    });

    describe('calculatePositioningMultiplier', () => {
        it('returns head-on bonus for high positive dot product', () => {
            const result = calculatePositioningMultiplier(0.9);
            expect(result).toBe(PLAYER_COMBAT_CONFIG.headOnBonusMultiplier);
        });

        it('returns rear attack multiplier for negative dot product', () => {
            const result = calculatePositioningMultiplier(-0.5);
            expect(result).toBe(PLAYER_COMBAT_CONFIG.rearAttackMultiplier);
        });

        it('returns 1.0 for neutral angle', () => {
            // Between 0 and threshold
            const result = calculatePositioningMultiplier(0.5);
            expect(result).toBe(1.0);
        });

        it('returns 1.0 at exactly zero', () => {
            const result = calculatePositioningMultiplier(0);
            expect(result).toBe(1.0);
        });
    });

    describe('calculateNextLevelXP', () => {
        it('scales XP by factor correctly', () => {
            const result = calculateNextLevelXP(100, 1.1);
            expect(result).toBe(110);
        });

        it('floors the result', () => {
            const result = calculateNextLevelXP(100, 1.15);
            expect(result).toBe(114); // Math.floor(115) = 114
        });

        it('handles larger XP values', () => {
            const result = calculateNextLevelXP(1000, 1.5);
            expect(result).toBe(1500);
        });
    });

    describe('calculateMaxHealthAfterLevelUp', () => {
        it('adds health increase correctly', () => {
            const result = calculateMaxHealthAfterLevelUp(100, 20);
            expect(result).toBe(120);
        });

        it('handles multiple level ups worth', () => {
            let health = 100;
            health = calculateMaxHealthAfterLevelUp(health, 20);
            health = calculateMaxHealthAfterLevelUp(health, 20);
            expect(health).toBe(140);
        });
    });

    describe('clamp', () => {
        it('returns value when within range', () => {
            expect(clamp(50, 0, 100)).toBe(50);
        });

        it('returns min when value is below range', () => {
            expect(clamp(-10, 0, 100)).toBe(0);
        });

        it('returns max when value is above range', () => {
            expect(clamp(150, 0, 100)).toBe(100);
        });

        it('handles edge case at min', () => {
            expect(clamp(0, 0, 100)).toBe(0);
        });

        it('handles edge case at max', () => {
            expect(clamp(100, 0, 100)).toBe(100);
        });
    });
});
