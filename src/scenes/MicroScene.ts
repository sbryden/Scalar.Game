/**
 * Micro Scene
 * Cellular-level gameplay scene with bacteria enemies
 */
import { WORLD_WIDTH, SPAWN_CONFIG } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { generateQuantumBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class MicroScene extends BaseGameScene {
    constructor() {
        super('MicroScene');
    }

    protected getSceneConfig(): SceneConfig {
        return {
            sceneKey: 'MicroScene',
            gravity: 150, // Reduced gravity for micro scene
            playerTexture: 'car_1',
            playerScale: 0.15, // Smaller scale for micro
            playerBounce: 0.2,
            playerDrag: { x: 0, y: 0 },
            defaultEnemyType: 'micro',
            spawnInterval: SPAWN_CONFIG.defaults.baseInterval,
            groundY: SPAWN_CONFIG.defaults.midWaterY,
            allowYVariance: true // Micro enemies can float
        };
    }

    protected getBossTypes(): string[] {
        return ['boss_land_micro'];
    }

    protected createBackground(): void {
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateQuantumBackground(this, mapLevel);
    }

    protected createGround(): void {
        this.createGroundWithTexture('microGround', (graphics) => {
            // Base membrane color
            graphics.fillStyle(0x4A2D5A, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Membrane texture
            graphics.fillStyle(0x5A3D6A, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 40) {
                for (let y = 0; y < 50; y += 20) {
                    const offset = (y === 20) ? 20 : 0;
                    graphics.fillCircle(x + offset + 10, y + 10, 8);
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
