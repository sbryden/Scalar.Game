/**
 * Main Game Scene
 * Land-based gameplay scene at normal scale
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, SPAWN_CONFIG, getOptions } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { generateSkyBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class MainGameScene extends BaseGameScene {
    constructor() {
        super('MainGameScene');
    }

    protected getSceneConfig(): SceneConfig {
        const options = getOptions();
        return {
            sceneKey: 'MainGameScene',
            gravity: options.landGravity,
            playerTexture: 'land/car_1',
            playerScale: 0.25,
            playerBounce: 0.2,
            playerDrag: { x: 0, y: 0 },
            defaultEnemyType: 'generic',
            spawnInterval: SPAWN_CONFIG.defaults.baseInterval,
            groundY: SPAWN_CONFIG.defaults.groundY,
            allowYVariance: false
        };
    }

    protected getBossTypes(): string[] {
        return ['boss_land', 'boss_wolf_tank'];
    }

    protected createBackground(): void {
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateSkyBackground(this, mapLevel);
    }

    protected createGround(): void {
        this.createGroundWithTexture('ground', (graphics) => {
            // Base ground color
            graphics.fillStyle(0x8B7355, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Brick pattern
            graphics.fillStyle(0x6B5345, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 50) {
                for (let y = 0; y < 50; y += 25) {
                    const offset = (y === 25) ? 25 : 0;
                    graphics.fillRect(x + offset, y, 25, 10);
                }
            }
        });
    }

    protected spawnSceneEnemies(bossMode: boolean): void {
        const config = this.getSceneConfig();
        this.spawnWithDynamicPoints(
            bossMode,
            this.getBossTypes(),
            config.defaultEnemyType,
            config.spawnInterval,
            config.groundY,
            config.allowYVariance
        );
    }
}
