/**
 * Underwater Micro Scene
 * Microscopic underwater scene with swimming micro organisms
 */
import { WORLD_WIDTH, SPAWN_CONFIG } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { generateUnderwaterMicroBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class UnderwaterMicroScene extends BaseGameScene {
    constructor() {
        super('UnderwaterMicroScene');
    }

    protected getSceneConfig(): SceneConfig {
        return {
            sceneKey: 'UnderwaterMicroScene',
            gravity: 50, // Very light gravity for micro underwater
            playerTexture: 'sub_1',
            playerScale: 0.15, // Smaller for micro scale
            playerBounce: 0.1,
            playerDrag: { x: 70, y: 70 }, // More drag for micro environment
            defaultEnemyType: 'water_swimming_micro',
            spawnInterval: SPAWN_CONFIG.defaults.baseInterval,
            groundY: SPAWN_CONFIG.defaults.midWaterY,
            allowYVariance: true
        };
    }

    protected getBossTypes(): string[] {
        return ['boss_water_micro'];
    }

    protected createBackground(): void {
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateUnderwaterMicroBackground(this, mapLevel);
    }

    protected createGround(): void {
        this.createGroundWithTexture('underwaterMicroGround', (graphics) => {
            // Base membrane color (blue-green)
            graphics.fillStyle(0x065F46, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Add organic membrane texture
            graphics.fillStyle(0x047857, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 35) {
                for (let y = 0; y < 50; y += 18) {
                    const offset = (y === 18) ? 18 : 0;
                    graphics.fillCircle(x + offset + 8, y + 8, 6);
                }
            }
            
            // Add micro-particles on ground
            graphics.fillStyle(0x10B981, 0.5);
            for (let i = 0; i < 80; i++) {
                const x = Math.random() * WORLD_WIDTH;
                const y = Math.random() * 50;
                graphics.fillCircle(x, y, 2 + Math.random() * 4);
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
