/**
 * Underwater Macro Scene  
 * Deep ocean gameplay scene with massive sea creatures
 */
import { WORLD_WIDTH, WORLD_HEIGHT, getOptions } from '../config';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { generateUnderwaterBackground } from '../utils/backgroundGenerator';
import BaseGameScene from './BaseGameScene';
import type { SceneConfig } from './BaseGameScene';

export default class UnderwaterMacroScene extends BaseGameScene {
    constructor() {
        super('UnderwaterMacroScene');
    }

    protected getSceneConfig(): SceneConfig {
        const options = getOptions();
        return {
            sceneKey: 'UnderwaterMacroScene',
            gravity: options.macroWaterGravity,
            playerTexture: 'water/sub_1',
            playerScale: 0.35, // Larger for macro scale
            playerBounce: 0.1,
            playerDrag: { x: 40, y: 40 }, // Slight drag
            defaultEnemyType: 'whale',
            spawnInterval: 400,
            groundY: 680,
            allowYVariance: true
        };
    }

    protected getBossTypes(): string[] {
        return ['whale_boss', 'giant_shark_boss', 'giant_crab_boss', 'sea_serpent_boss'];
    }

    protected createBackground(): void {
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateUnderwaterBackground(this, mapLevel);
        
        // Add deeper ocean visual elements for macro scale
        this.createDeepOceanEffects();
    }

    private createDeepOceanEffects(): void {
        // Add dark overlay for deep ocean feeling
        const darkOverlay = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x000033, 0.3);
        darkOverlay.setOrigin(0, 0);
        darkOverlay.setDepth(-40);
        darkOverlay.setScrollFactor(0);
        
        // Add distant underwater rock formations
        const formationGraphics = this.add.graphics();
        formationGraphics.setScrollFactor(0.2); // Parallax effect
        formationGraphics.setDepth(-35);
        
        // Dark underwater rock silhouettes
        formationGraphics.fillStyle(0x1a2a4a, 0.5);
        
        for (let i = 0; i < 6; i++) {
            const x = (WORLD_WIDTH / 6) * i;
            const height = 150 + Math.random() * 200;
            const width = 100 + Math.random() * 150;
            
            // Draw rocky formation
            formationGraphics.fillRect(x, 800 - height, width, height);
            
            // Add jagged top
            formationGraphics.fillTriangle(
                x, 800 - height,
                x + width / 2, 800 - height - 50,
                x + width, 800 - height
            );
        }
        
        // Add subtle light rays from above
        this.createLightRays();
    }

    private createLightRays(): void {
        // Create faint light rays filtering from surface
        const rayGraphics = this.add.graphics();
        rayGraphics.setDepth(-30);
        rayGraphics.setScrollFactor(0.5);
        rayGraphics.setAlpha(0.1);
        
        for (let i = 0; i < 3; i++) {
            const x = (WORLD_WIDTH / 4) * (i + 0.5);
            rayGraphics.fillGradientStyle(
                0xFFFFFF, 0xFFFFFF, 0x000033, 0x000033, 1
            );
            
            // Draw triangular light ray
            rayGraphics.fillTriangle(
                x - 20, 0,
                x + 20, 0,
                x, 400
            );
        }
    }

    protected createGround(): void {
        this.createGroundWithTexture('underwaterMacroGround', (graphics) => {
            // Dark sandy/rocky base for deep ocean
            graphics.fillStyle(0x3a4a5a, 1);
            graphics.fillRect(0, 0, WORLD_WIDTH, 50);
            
            // Add darker sand texture
            graphics.fillStyle(0x4a5a6a, 1);
            for (let x = 0; x < WORLD_WIDTH; x += 15) {
                for (let y = 0; y < 50; y += 15) {
                    if (Math.random() > 0.4) {
                        graphics.fillCircle(x + Math.random() * 8, y + Math.random() * 8, 3);
                    }
                }
            }
            
            // Add larger rocks for macro scale
            graphics.fillStyle(0x2a3a4a, 1);
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * WORLD_WIDTH;
                const y = Math.random() * 50;
                const size = 5 + Math.random() * 15;
                graphics.fillCircle(x, y, size);
            }
        });
    }

    protected spawnSceneEnemies(bossMode: boolean): void {
        this.spawnWithMixedPoints(
            bossMode,
            'boss_water_macro',
            'boss_water_kraken',
            'whale',
            'giant_crab',
            0.7 // 70% whales, 30% crabs
        );
    }
}
