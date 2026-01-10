/**
 * Underwater Scene
 * Submarine gameplay scene with lighter gravity
 */
import { WORLD_WIDTH, getOptions } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { generateUnderwaterBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class UnderwaterScene extends BaseGameScene {
    constructor() {
        super('UnderwaterScene');
    }

    protected getSceneConfig(): SceneConfig {
        const options = getOptions();
        return {
            sceneKey: 'UnderwaterScene',
            gravity: options.waterGravity,
            playerTexture: 'sub_1',
            playerScale: 0.25,
            playerBounce: 0.1,
            playerDrag: { x: 50, y: 50 }, // Water drag
            defaultEnemyType: 'fish',
            spawnInterval: 300,
            groundY: 680,
            allowYVariance: true
        };
    }

    protected getBossTypes(): string[] {
        return ['boss_water_shark', 'boss_water_crab'];
    }

    protected createBackground(): void {
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateUnderwaterBackground(this, mapLevel);
    }

    protected createGround(): void {
        this.createGroundWithTexture('underwaterGround', (graphics) => {
            // Sandy base color
            graphics.fillStyle(0xC2A878, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Add sand texture
            graphics.fillStyle(0xD4B896, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 10) {
                for (let y = 0; y < 50; y += 10) {
                    if (Math.random() > 0.5) {
                        graphics.fillCircle(x + Math.random() * 5, y + Math.random() * 5, 2);
                    }
                }
            }
            
            // Add small rocks
            graphics.fillStyle(0x8B7355, 1);
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * WORLD_WIDTH;
                const y = Math.random() * 50;
                const size = 3 + Math.random() * 8;
                graphics.fillCircle(x, y, size);
            }
        });
    }

    protected spawnSceneEnemies(bossMode: boolean): void {
        this.spawnWithMixedPoints(
            bossMode,
            'boss_water_shark',
            'boss_water_crab',
            'fish',
            'crab',
            0.8 // 80% fish, 20% crabs
        );
    }
}
