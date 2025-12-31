/**
 * Unit Tests for Config Module
 * Tests game configuration constants and values
 */

import { describe, it, expect } from 'vitest';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  CAMERA_PADDING,
  SIZE_CONFIG,
  SIZE_CHANGE_COOLDOWN,
  ENEMY_CONFIG,
  PLAYER_COMBAT_CONFIG,
  PROJECTILE_CONFIG
} from '../config';

describe('Config Module', () => {
  describe('World Configuration', () => {
    it('should have valid world dimensions', () => {
      expect(WORLD_WIDTH).toBe(16384);
      expect(WORLD_HEIGHT).toBe(768);
      expect(WORLD_WIDTH).toBeGreaterThan(0);
      expect(WORLD_HEIGHT).toBeGreaterThan(0);
    });

    it('should have valid camera padding', () => {
      expect(CAMERA_PADDING).toBe(256);
      expect(CAMERA_PADDING).toBeGreaterThan(0);
    });
  });

  describe('Size Configuration', () => {
    it('should have all required size states', () => {
      expect(SIZE_CONFIG).toHaveProperty('small');
      expect(SIZE_CONFIG).toHaveProperty('normal');
      expect(SIZE_CONFIG).toHaveProperty('large');
    });

    it('should have valid scale values', () => {
      expect(SIZE_CONFIG.small.scale).toBe(0.5);
      expect(SIZE_CONFIG.normal.scale).toBe(1.0);
      expect(SIZE_CONFIG.large.scale).toBe(1.5);
      
      // All scales should be positive
      Object.values(SIZE_CONFIG).forEach(config => {
        expect(config.scale).toBeGreaterThan(0);
      });
    });

    it('should have valid multiplier values', () => {
      Object.values(SIZE_CONFIG).forEach(config => {
        expect(config.speedMultiplier).toBeGreaterThan(0);
        expect(config.jumpMultiplier).toBeGreaterThan(0);
      });
    });

    it('should have different colors for each size', () => {
      const colors = Object.values(SIZE_CONFIG).map(config => config.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should have valid size change cooldown', () => {
      expect(SIZE_CHANGE_COOLDOWN).toBe(500);
      expect(SIZE_CHANGE_COOLDOWN).toBeGreaterThan(0);
    });

    it('should balance speed with size (smaller = faster)', () => {
      expect(SIZE_CONFIG.small.speedMultiplier).toBeGreaterThan(SIZE_CONFIG.normal.speedMultiplier);
      expect(SIZE_CONFIG.normal.speedMultiplier).toBeGreaterThan(SIZE_CONFIG.large.speedMultiplier);
    });
  });

  describe('Enemy Configuration', () => {
    it('should have all required enemy types', () => {
      expect(ENEMY_CONFIG).toHaveProperty('generic');
      expect(ENEMY_CONFIG).toHaveProperty('micro');
      expect(ENEMY_CONFIG).toHaveProperty('fish');
      expect(ENEMY_CONFIG).toHaveProperty('crab');
      expect(ENEMY_CONFIG).toHaveProperty('plankton');
    });

    it('should have valid dimensions for all enemies', () => {
      Object.values(ENEMY_CONFIG).forEach(enemy => {
        expect(enemy.width).toBeGreaterThan(0);
        expect(enemy.height).toBeGreaterThan(0);
      });
    });

    it('should have valid combat stats for all enemies', () => {
      Object.values(ENEMY_CONFIG).forEach(enemy => {
        expect(enemy.health).toBeGreaterThan(0);
        expect(enemy.damage).toBeGreaterThan(0);
        expect(enemy.speed).toBeGreaterThan(0);
        expect(enemy.xpReward).toBeGreaterThan(0);
      });
    });

    it('should have valid patrol and aggro settings', () => {
      Object.values(ENEMY_CONFIG).forEach(enemy => {
        expect(enemy.patrolDistance).toBeGreaterThan(0);
        expect(enemy.aggroRangeMultiplier).toBeGreaterThan(0);
        expect(enemy.aggroSpeedMultiplier).toBeGreaterThan(1); // Should be faster when aggroed
      });
    });

    it('should have valid knockback resistance values', () => {
      Object.values(ENEMY_CONFIG).forEach(enemy => {
        expect(enemy.knockbackResistance).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have different colors for each enemy type', () => {
      const colors = Object.values(ENEMY_CONFIG).map(enemy => enemy.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should reward more XP for tougher enemies', () => {
      // Crab has highest health and should have high XP
      expect(ENEMY_CONFIG.crab.xpReward).toBeGreaterThan(ENEMY_CONFIG.plankton.xpReward);
      expect(ENEMY_CONFIG.generic.xpReward).toBeGreaterThan(ENEMY_CONFIG.micro.xpReward);
    });
  });

  describe('Player Combat Configuration', () => {
    it('should have valid damage values', () => {
      expect(PLAYER_COMBAT_CONFIG.baseMeleeDamage).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.meleeModePlayerDamage).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.passiveModePlayerDamage).toBeGreaterThan(0);
    });

    it('should have melee mode deal more damage than passive', () => {
      expect(PLAYER_COMBAT_CONFIG.meleeModePlayerDamage).toBeGreaterThan(
        PLAYER_COMBAT_CONFIG.passiveModePlayerDamage
      );
    });

    it('should have valid knockback force', () => {
      expect(PLAYER_COMBAT_CONFIG.baseKnockbackForce).toBeGreaterThan(0);
    });

    it('should have valid cooldown values', () => {
      expect(PLAYER_COMBAT_CONFIG.enemyToPlayerCooldown).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.playerToEnemyCooldown).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.invulnerabilityDuration).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.stunDuration).toBeGreaterThan(0);
    });

    it('should have valid melee mode damage reduction', () => {
      expect(PLAYER_COMBAT_CONFIG.meleeModeDamageReduction).toBeGreaterThan(0);
      expect(PLAYER_COMBAT_CONFIG.meleeModeDamageReduction).toBeLessThanOrEqual(1);
    });

    it('should have valid required approach speed', () => {
      expect(PLAYER_COMBAT_CONFIG.requiredApproachSpeed).toBeGreaterThan(0);
    });
  });

  describe('Projectile Configuration', () => {
    it('should have basic projectile configuration', () => {
      expect(PROJECTILE_CONFIG).toHaveProperty('basic');
    });

    it('should have valid projectile dimensions', () => {
      expect(PROJECTILE_CONFIG.basic.width).toBeGreaterThan(0);
      expect(PROJECTILE_CONFIG.basic.height).toBeGreaterThan(0);
    });

    it('should have valid projectile stats', () => {
      expect(PROJECTILE_CONFIG.basic.speed).toBeGreaterThan(0);
      expect(PROJECTILE_CONFIG.basic.damage).toBeGreaterThan(0);
      expect(PROJECTILE_CONFIG.basic.cooldown).toBeGreaterThan(0);
    });

    it('should have a color defined', () => {
      expect(PROJECTILE_CONFIG.basic.color).toBeDefined();
      expect(typeof PROJECTILE_CONFIG.basic.color).toBe('number');
    });
  });
});
