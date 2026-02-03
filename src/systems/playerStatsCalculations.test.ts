/**
 * Player Stats Calculations Tests
 * Tests for pure player stats math functions
 */
import { describe, it, expect } from 'vitest';
import {
    calculateXPGain,
    calculateDamage,
    calculateHealing,
    isPlayerDead,
    calculateTotalXPForLevel
} from './playerStatsCalculations';
import { XP_CONFIG } from '../config';

describe('Player Stats Calculations', () => {
    describe('calculateXPGain', () => {
        it('adds XP without level up when below threshold', () => {
            const result = calculateXPGain(1, 0, 100, 100, 50);
            
            expect(result.newLevel).toBe(1);
            expect(result.newXP).toBe(50);
            expect(result.newXPToLevel).toBe(100);
            expect(result.levelsGained).toBe(0);
        });

        it('levels up when XP reaches threshold', () => {
            const result = calculateXPGain(1, 0, 100, 100, 100);
            
            expect(result.newLevel).toBe(2);
            expect(result.newXP).toBe(0);
            expect(result.newMaxHealth).toBe(100 + XP_CONFIG.progression.healthIncreasePerLevel);
            expect(result.levelsGained).toBe(1);
        });

        it('carries over excess XP after level up', () => {
            const result = calculateXPGain(1, 0, 100, 100, 150);
            
            expect(result.newLevel).toBe(2);
            expect(result.newXP).toBe(50);
            expect(result.levelsGained).toBe(1);
        });

        it('handles multiple level ups from large XP gain', () => {
            // Starting: level 1, 0 XP, need 750 to level
            // After level 2: need 937 XP (750 * 1.25)
            // After level 3: need 1171 XP (937 * 1.25)
            // Total for level 3: 750 + 937 = 1687
            const result = calculateXPGain(1, 0, 750, 100, 1687);
            
            expect(result.newLevel).toBe(3);
            expect(result.newXP).toBe(0); // 1687 - 750 - 937 = 0
            expect(result.levelsGained).toBe(2);
        });

        it('increases max health for each level gained', () => {
            const result = calculateXPGain(1, 0, 750, 100, 1687);
            
            const expectedHealth = 100 + (XP_CONFIG.progression.healthIncreasePerLevel * 2);
            expect(result.newMaxHealth).toBe(expectedHealth);
        });

        it('scales XP requirement correctly', () => {
            const result = calculateXPGain(1, 0, 750, 100, 750);
            
            // After level up, XPToLevel should be 750 * 1.25 = 937
            const expectedXPToLevel = Math.floor(750 * XP_CONFIG.progression.xpScalingFactor);
            expect(result.newXPToLevel).toBe(expectedXPToLevel);
        });

        it('handles adding XP to existing XP pool', () => {
            const result = calculateXPGain(1, 80, 100, 100, 30);
            
            expect(result.newLevel).toBe(2);
            expect(result.newXP).toBe(10); // 80 + 30 - 100 = 10
        });
    });

    describe('calculateDamage', () => {
        it('subtracts damage from health', () => {
            expect(calculateDamage(100, 30)).toBe(70);
        });

        it('returns 0 when damage exceeds health', () => {
            expect(calculateDamage(50, 100)).toBe(0);
        });

        it('returns 0 when damage equals health', () => {
            expect(calculateDamage(100, 100)).toBe(0);
        });

        it('handles zero damage', () => {
            expect(calculateDamage(100, 0)).toBe(100);
        });
    });

    describe('calculateHealing', () => {
        it('adds healing to health', () => {
            expect(calculateHealing(50, 100, 30)).toBe(80);
        });

        it('caps healing at max health', () => {
            expect(calculateHealing(90, 100, 50)).toBe(100);
        });

        it('handles healing to exactly max health', () => {
            expect(calculateHealing(80, 100, 20)).toBe(100);
        });

        it('handles zero healing', () => {
            expect(calculateHealing(50, 100, 0)).toBe(50);
        });

        it('handles healing at max health', () => {
            expect(calculateHealing(100, 100, 50)).toBe(100);
        });
    });

    describe('isPlayerDead', () => {
        it('returns true when health is 0', () => {
            expect(isPlayerDead(0)).toBe(true);
        });

        it('returns true when health is negative', () => {
            expect(isPlayerDead(-10)).toBe(true);
        });

        it('returns false when health is positive', () => {
            expect(isPlayerDead(1)).toBe(false);
        });

        it('returns false when health is high', () => {
            expect(isPlayerDead(100)).toBe(false);
        });
    });

    describe('calculateTotalXPForLevel', () => {
        it('returns 0 for level 1', () => {
            expect(calculateTotalXPForLevel(1)).toBe(0);
        });

        it('returns starting XP to level for level 2', () => {
            expect(calculateTotalXPForLevel(2)).toBe(XP_CONFIG.progression.startingXPToLevel);
        });

        it('accumulates XP correctly for level 3', () => {
            // Level 2 needs 750, Level 3 needs 937 (750 * 1.25)
            const expected = 750 + Math.floor(750 * XP_CONFIG.progression.xpScalingFactor);
            expect(calculateTotalXPForLevel(3)).toBe(expected);
        });

        it('handles higher levels with scaling', () => {
            // Calculate expected XP for level 5
            let expected = 0;
            let xpToLevel = 750;
            for (let i = 1; i < 5; i++) {
                expected += xpToLevel;
                xpToLevel = Math.floor(xpToLevel * XP_CONFIG.progression.xpScalingFactor);
            }
            expect(calculateTotalXPForLevel(5)).toBe(expected);
        });
    });
});
