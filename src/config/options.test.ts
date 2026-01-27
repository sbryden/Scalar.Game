/**
 * Options Configuration Tests
 * Tests for default game options values
 */
import { describe, it, expect } from 'vitest';
import { getDefaultOptions } from './options';

describe('Options Configuration', () => {
    describe('Default Options', () => {
        it('should have correct default player speed', () => {
            const defaults = getDefaultOptions();
            expect(defaults.playerSpeed).toBe(225);
        });

        it('should have correct default player projectile speed', () => {
            const defaults = getDefaultOptions();
            expect(defaults.playerProjectileSpeed).toBe(325);
        });

        it('should have all required option fields', () => {
            const defaults = getDefaultOptions();
            
            expect(defaults).toHaveProperty('playerSpeed');
            expect(defaults).toHaveProperty('playerJumpHeight');
            expect(defaults).toHaveProperty('playerProjectileSpeed');
            expect(defaults).toHaveProperty('playerProjectileDamage');
            expect(defaults).toHaveProperty('landGravity');
            expect(defaults).toHaveProperty('waterGravity');
            expect(defaults).toHaveProperty('microLandGravity');
            expect(defaults).toHaveProperty('microWaterGravity');
            expect(defaults).toHaveProperty('macroLandGravity');
            expect(defaults).toHaveProperty('macroWaterGravity');
            expect(defaults).toHaveProperty('startingHP');
        });

        it('should have positive numeric values for all options', () => {
            const defaults = getDefaultOptions();
            
            Object.entries(defaults).forEach(([key, value]) => {
                expect(typeof value).toBe('number');
                expect(value).toBeGreaterThan(0);
            });
        });
    });
});
