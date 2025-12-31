/**
 * Unit Tests for GameState Module
 * Tests the singleton game state manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Phaser before importing anything that uses it
vi.mock('phaser', () => ({
  default: {},
  Physics: {},
  Scene: {},
  Game: {},
  GameObjects: {}
}));

describe('GameState Module', () => {
  let gameState: any;

  beforeEach(async () => {
    // Clear the module cache and re-import
    vi.resetModules();
    const module = await import('../utils/gameState');
    gameState = module.default;
  });

  describe('Initialization', () => {
    it('should be a singleton instance', () => {
      expect(gameState).toBeDefined();
      expect(typeof gameState).toBe('object');
    });

    it('should have all core game object properties', () => {
      expect(gameState).toHaveProperty('player');
      expect(gameState).toHaveProperty('enemies');
      expect(gameState).toHaveProperty('projectiles');
      expect(gameState).toHaveProperty('xpOrbs');
      expect(gameState).toHaveProperty('platforms');
    });

    it('should have scene and input properties', () => {
      expect(gameState).toHaveProperty('scene');
      expect(gameState).toHaveProperty('cursors');
      expect(gameState).toHaveProperty('wasdKeys');
    });

    it('should have UI element properties', () => {
      expect(gameState).toHaveProperty('levelText');
    });

    it('should have timer and state properties', () => {
      expect(gameState).toHaveProperty('sizeChangeTimer');
      expect(gameState).toHaveProperty('playerSize');
    });

    it('should have scene management properties', () => {
      expect(gameState).toHaveProperty('currentSceneKey');
      expect(gameState).toHaveProperty('savedPositions');
      expect(gameState).toHaveProperty('savedEnemies');
    });

    it('should have difficulty property', () => {
      expect(gameState).toHaveProperty('difficultyInitialized');
    });

    it('should have function references', () => {
      expect(gameState).toHaveProperty('spawnEnemyFunc');
    });
  });

  describe('Initial Values', () => {
    it('should initialize core objects to null', () => {
      expect(gameState.player).toBeNull();
      expect(gameState.enemies).toBeNull();
      expect(gameState.projectiles).toBeNull();
      expect(gameState.xpOrbs).toBeNull();
      expect(gameState.platforms).toBeNull();
    });

    it('should initialize scene and input to null', () => {
      expect(gameState.scene).toBeNull();
      expect(gameState.cursors).toBeNull();
      expect(gameState.wasdKeys).toBeNull();
    });

    it('should initialize UI elements to null', () => {
      expect(gameState.levelText).toBeNull();
    });

    it('should initialize timers and state correctly', () => {
      expect(gameState.sizeChangeTimer).toBe(0);
      expect(gameState.playerSize).toBe('normal');
    });

    it('should initialize current scene key', () => {
      expect(gameState.currentSceneKey).toBe('MainGameScene');
    });

    it('should initialize difficulty flag to false', () => {
      expect(gameState.difficultyInitialized).toBe(false);
    });

    it('should initialize spawn function to null', () => {
      expect(gameState.spawnEnemyFunc).toBeNull();
    });
  });

  describe('Saved Positions', () => {
    it('should have saved positions for all scenes', () => {
      const expectedScenes = [
        'BootScene',
        'MenuScene',
        'MainGameScene',
        'MicroScene',
        'UnderwaterScene',
        'UnderwaterMicroScene'
      ];

      expectedScenes.forEach(sceneKey => {
        expect(gameState.savedPositions).toHaveProperty(sceneKey);
      });
    });

    it('should have valid position objects', () => {
      Object.values(gameState.savedPositions).forEach((position: any) => {
        expect(position).toHaveProperty('x');
        expect(position).toHaveProperty('y');
        expect(typeof position.x).toBe('number');
        expect(typeof position.y).toBe('number');
      });
    });

    it('should have default position values', () => {
      Object.values(gameState.savedPositions).forEach((position: any) => {
        expect(position.x).toBe(100);
        expect(position.y).toBe(650);
      });
    });
  });

  describe('Saved Enemies', () => {
    it('should have saved enemies array for all scenes', () => {
      const expectedScenes = [
        'BootScene',
        'MenuScene',
        'MainGameScene',
        'MicroScene',
        'UnderwaterScene',
        'UnderwaterMicroScene'
      ];

      expectedScenes.forEach(sceneKey => {
        expect(gameState.savedEnemies).toHaveProperty(sceneKey);
        expect(Array.isArray(gameState.savedEnemies[sceneKey])).toBe(true);
      });
    });

    it('should initialize all enemy arrays as empty', () => {
      Object.values(gameState.savedEnemies).forEach((enemies: any) => {
        expect(enemies).toEqual([]);
      });
    });
  });

  describe('isInitialized Method', () => {
    it('should return false when not initialized', () => {
      expect(gameState.isInitialized()).toBe(false);
    });

    it('should return false when only player is set', () => {
      gameState.player = { x: 0, y: 0 };
      expect(gameState.isInitialized()).toBe(false);
    });

    it('should return false when only scene is set', () => {
      gameState.scene = { key: 'test' };
      expect(gameState.isInitialized()).toBe(false);
    });

    it('should return true when both player and scene are set', () => {
      gameState.player = { x: 0, y: 0 };
      gameState.scene = { key: 'test' };
      expect(gameState.isInitialized()).toBe(true);
    });
  });

  describe('State Mutability', () => {
    it('should allow updating player size', () => {
      const sizes = ['small', 'normal', 'large'];
      sizes.forEach(size => {
        gameState.playerSize = size;
        expect(gameState.playerSize).toBe(size);
      });
    });

    it('should allow updating size change timer', () => {
      gameState.sizeChangeTimer = 1000;
      expect(gameState.sizeChangeTimer).toBe(1000);
      
      gameState.sizeChangeTimer = 0;
      expect(gameState.sizeChangeTimer).toBe(0);
    });

    it('should allow updating current scene key', () => {
      gameState.currentSceneKey = 'MicroScene';
      expect(gameState.currentSceneKey).toBe('MicroScene');
    });

    it('should allow updating difficulty flag', () => {
      gameState.difficultyInitialized = true;
      expect(gameState.difficultyInitialized).toBe(true);
    });

    it('should allow updating saved positions', () => {
      gameState.savedPositions.MainGameScene = { x: 200, y: 300 };
      expect(gameState.savedPositions.MainGameScene.x).toBe(200);
      expect(gameState.savedPositions.MainGameScene.y).toBe(300);
    });

    it('should allow updating saved enemies', () => {
      const mockEnemy = {
        x: 500,
        y: 600,
        health: 100,
        enemyType: 'generic'
      };
      gameState.savedEnemies.MainGameScene = [mockEnemy];
      expect(gameState.savedEnemies.MainGameScene).toHaveLength(1);
      expect(gameState.savedEnemies.MainGameScene[0]).toEqual(mockEnemy);
    });
  });
});
