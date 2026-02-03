/**
 * Main Game Macro Scene
 * Giant-scale gameplay scene for land environment with massive enemies
 */
import { WORLD_WIDTH, SPAWN_CONFIG, getOptions } from '../config';
import stageProgressionSystem from '../systems/StageProgressionSystem';
import { generateSkyBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class MainGameMacroScene extends BaseGameScene {
    constructor() {
        super('MainGameMacroScene');
    }

    protected getSceneConfig(): SceneConfig {
        const options = getOptions();
        return {
            sceneKey: 'MainGameMacroScene',
            gravity: options.macroLandGravity,
            playerTexture: 'land/car_1',
            playerScale: 0.35, // Larger scale for macro
            playerBounce: 0.2,
            playerDrag: { x: 0, y: 0 },
            defaultEnemyType: 'macro',
            spawnInterval: SPAWN_CONFIG.defaults.baseInterval,
            groundY: SPAWN_CONFIG.defaults.groundY,
            allowYVariance: false
        };
    }

    protected getBossTypes(): string[] {
        return ['boss_land_golem', 'boss_land_bear', 'spawner_boss_land'];
    }

    protected createBackground(): void {
        const currentStage = stageProgressionSystem.getCurrentStage();
        generateSkyBackground(this, currentStage);
        
        // Add distant mountain silhouettes for macro scale feeling
        this.createMountainSilhouettes();
    }

    private createMountainSilhouettes(): void {
        const mountainGraphics = this.add.graphics();
        mountainGraphics.setScrollFactor(0.3); // Parallax effect
        mountainGraphics.setDepth(-50);
        
        // Dark purple/blue mountains
        mountainGraphics.fillStyle(0x1a1a3e, 0.6);
        
        // Draw several mountain peaks
        for (let i = 0; i < 5; i++) {
            const x = (WORLD_WIDTH / 5) * i;
            const height = 200 + Math.random() * 150;
            const width = 300 + Math.random() * 200;
            
            mountainGraphics.fillTriangle(
                x, 800,
                x + width / 2, 800 - height,
                x + width, 800
            );
        }
    }

    protected createGround(): void {
        this.createGroundWithTexture('macroGround', (graphics) => {
            // Rocky macro-scale ground
            graphics.fillStyle(0x5A4A3A, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Large rock pattern
            graphics.fillStyle(0x4A3A2A, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 80) {
                for (let y = 0; y < 50; y += 25) {
                    const offset = (y === 25) ? 40 : 0;
                    graphics.fillRect(x + offset, y, 40, 15);
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
