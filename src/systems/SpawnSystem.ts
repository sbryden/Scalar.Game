/**
 * Spawn System
 * Handles spawning of XP orbs and enemy spawn point generation
 */
import Phaser from 'phaser';
import gameState from '../utils/GameContext';
import playerStatsSystem from './PlayerStatsSystem';
import levelProgressionSystem from './LevelProgressionSystem';
import { getStaminaSystem } from './StaminaSystem';
import { XP_CONFIG, WORLD_WIDTH, SPAWN_CONFIG, EASY_MODE_CONFIG, HARD_MODE_CONFIG, STAMINA_CONFIG, BOSS_MODE_CONFIG } from '../config';
import type { XPOrb } from '../types/game';

/**
 * Spawn point data structure
 */
export interface SpawnPoint {
    x: number;
    y: number;
    isBoss: boolean;
}

export class SpawnSystem {
    constructor() {
        // Setup level up callback
        playerStatsSystem.setLevelUpCallback((level) => {
            this.onPlayerLevelUp(level);
        });
    }
    
    /**
     * Spawn an orb at the given location (XP or companion)
     * 
     * @param scene - The Phaser scene to spawn the orb in
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param isCompanion - Whether this is a companion orb (true) or XP orb (false)
     * @param xpValue - XP value for XP orbs (ignored for companion orbs)
     */
    private spawnOrb(scene: Phaser.Scene, x: number, y: number, isCompanion: boolean, xpValue: number = 0): void {
        // Create appropriate orb visual
        let orb: XPOrb;
        if (isCompanion) {
            // Companion orb uses wolf_orb sprite
            orb = scene.add.sprite(x, y, 'wolf_orb') as any as XPOrb;
            orb.setScale(1.5); // Make it larger than regular orbs
        } else {
            // Regular XP orb is a circle
            orb = scene.add.circle(x, y, XP_CONFIG.orb.radius, XP_CONFIG.orb.color) as XPOrb;
        }
        
        // Add physics and configure properties
        scene.physics.add.existing(orb);
        
        // Special behavior for companion orbs - float up to 1/3 screen height
        if (isCompanion) {
            // Strong upward velocity for companion orbs
            orb.body.setVelocity(0, -200);
            // Set target height (1/3 from top of screen)
            const screenHeight = scene.cameras.main.height;
            orb.floatTargetY = screenHeight / 3;
            orb.hasReachedFloatHeight = false;
        } else {
            // Regular XP orb velocity
            orb.body.setVelocity(
                Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.xMaxAbsVelocity, XP_CONFIG.orb.spawnVelocity.xMaxAbsVelocity),
                Phaser.Math.Between(XP_CONFIG.orb.spawnVelocity.minUpwardVelocity, XP_CONFIG.orb.spawnVelocity.maxUpwardVelocity)
            );
        }
        
        orb.body.setCollideWorldBounds(true);
        orb.body.setBounce(XP_CONFIG.orb.bounce, XP_CONFIG.orb.bounce);
        orb.xpValue = isCompanion ? 0 : xpValue;
        orb.isCompanionOrb = isCompanion;
        
        // Disable gravity for orbs in underwater scenes
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        if (isUnderwater) {
            orb.body.setAllowGravity(false);
            // Give orbs a gentle floating motion
            orb.body.setVelocity(
                Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.maxUnderwaterVelocity, XP_CONFIG.orb.spawnVelocity.maxUnderwaterVelocity),
                Phaser.Math.Between(-XP_CONFIG.orb.spawnVelocity.maxUnderwaterVelocity, XP_CONFIG.orb.spawnVelocity.maxUnderwaterVelocity)
            );
        }
        
        // Add to game state and setup collisions
        gameState.xpOrbs!.add(orb);
        scene.physics.add.collider(orb, gameState.platforms!);
        scene.physics.add.overlap(gameState.player!, orb, (p, o) => {
            const xpOrb = o as XPOrb;
            
            if (xpOrb.isCompanionOrb) {
                // Grant wolf companion
                playerStatsSystem.grantWolfCompanion();
            } else {
                // Regular XP orb
                playerStatsSystem.gainXP(xpOrb.xpValue || XP_CONFIG.orb.defaultValue);
                
                // Restore stamina when collecting XP orb
                const staminaSystem = getStaminaSystem();
                staminaSystem.restoreStamina(STAMINA_CONFIG.xpOrbRestoration);
            }
            
            xpOrb.destroy();
        });
    }
    
    /**
     * Spawn an XP orb at the given location
     */
    spawnXPOrb(scene: Phaser.Scene, x: number, y: number, xpValue: number): void {
        this.spawnOrb(scene, x, y, false, xpValue);
    }
    
    /**
     * Spawn a companion orb at the given location (dropped by wolf tank boss)
     */
    spawnCompanionOrb(scene: Phaser.Scene, x: number, y: number): void {
        this.spawnOrb(scene, x, y, true);
    }
    
    /**
     * Generate random density multipliers for segments that sum to maintain target enemy count
     * @param segmentCount - Number of segments to generate densities for
     * @returns Array of density multipliers
     */
    private generateBalancedDensities(segmentCount: number): number[] {
        const densities: number[] = [];
        
        // Generate random densities within range
        for (let i = 0; i < segmentCount; i++) {
            const density = SPAWN_CONFIG.densityRange.min + 
                Math.random() * (SPAWN_CONFIG.densityRange.max - SPAWN_CONFIG.densityRange.min);
            densities.push(density);
        }
        
        // Normalize densities to maintain consistent total enemy count
        const sum = densities.reduce((acc, val) => acc + val, 0);
        const targetSum = segmentCount; // Average density of 1.0 across all segments
        const normalizationFactor = targetSum / sum;
        
        return densities.map(d => d * normalizationFactor);
    }

    /**
     * Generate spawn points within a specific zone
     */
    private generateSpawnPointsInZone(
        startX: number,
        endX: number,
        interval: number,
        baseY: number,
        allowYVariance: boolean,
        spawnPoints: SpawnPoint[]
    ): void {
        for (let x = startX; x < endX; x += interval) {
            // Add random variance to X position
            const xVariance = (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.x;
            const spawnX = Math.max(
                SPAWN_CONFIG.defaults.minSpawnX, 
                Math.min(WORLD_WIDTH - SPAWN_CONFIG.defaults.minSpawnX, x + xVariance)
            );
            
            // Add random variance to Y position if allowed (for swimming enemies)
            let spawnY = baseY;
            if (allowYVariance) {
                const yVariance = (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y;
                spawnY = Math.max(
                    SPAWN_CONFIG.defaults.minSpawnY, 
                    Math.min(SPAWN_CONFIG.defaults.maxSpawnY, baseY + yVariance)
                );
            }
            
            spawnPoints.push({ x: spawnX, y: spawnY, isBoss: false });
        }
    }

    /**
     * Generate boss-only spawn points for boss mode
     * @param baseY - Base Y coordinate for spawning
     * @param allowYVariance - Whether to add Y variance (true for swimming enemies)
     * @returns Array of boss spawn points
     */
    generateBossOnlySpawnPoints(
        baseY: number = SPAWN_CONFIG.defaults.groundY,
        allowYVariance: boolean = false
    ): SpawnPoint[] {
        const spawnPoints: SpawnPoint[] = [];
        const segmentWidth = WORLD_WIDTH / SPAWN_CONFIG.segmentCount;
        
        // Determine which biome we're in based on current scene
        const currentScene = gameState.currentSceneKey;
        let bossSegments: number[] = [];
        
        switch (currentScene) {
            case 'MainGameScene':
                bossSegments = BOSS_MODE_CONFIG.bossSegments.land;
                break;
            case 'MicroScene':
                bossSegments = BOSS_MODE_CONFIG.bossSegments.micro;
                break;
            case 'UnderwaterScene':
                bossSegments = BOSS_MODE_CONFIG.bossSegments.water;
                break;
            case 'UnderwaterMicroScene':
                bossSegments = BOSS_MODE_CONFIG.bossSegments.waterMicro;
                break;
            default:
                console.warn(`Unknown scene for boss mode: ${currentScene}`);
                return spawnPoints;
        }
        
        // Place one boss in the center of each designated segment
        bossSegments.forEach(segmentIndex => {
            const segmentStart = segmentIndex * segmentWidth;
            const segmentEnd = (segmentIndex + 1) * segmentWidth;
            const bossX = segmentStart + (segmentEnd - segmentStart) * 0.5;
            
            let bossY: number;
            if (allowYVariance) {
                // Swimming bosses - use baseY with variance
                const rawBossY = baseY + (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y;
                const minSpawnY = SPAWN_CONFIG.defaults.minSpawnY;
                const maxSpawnY = SPAWN_CONFIG.defaults.maxSpawnY;
                bossY = Math.max(minSpawnY, Math.min(maxSpawnY, rawBossY));
            } else {
                // Ground bosses - spawn at top of map
                bossY = SPAWN_CONFIG.defaults.minSpawnY + 50;
            }
            
            spawnPoints.push({ x: bossX, y: bossY, isBoss: true });
        });
        
        return spawnPoints;
    }

    /**
     * Generate dynamic enemy spawn points with 16-segment system
     * @param baseInterval - Base spawn interval in pixels (default from SPAWN_CONFIG)
     * @param baseY - Base Y coordinate for spawning (default from SPAWN_CONFIG)
     * @param allowYVariance - Whether to add Y variance (true for swimming enemies)
     * @returns Array of spawn points
     */
    generateDynamicSpawnPoints(
        baseInterval: number = SPAWN_CONFIG.defaults.baseInterval,
        baseY: number = SPAWN_CONFIG.defaults.groundY,
        allowYVariance: boolean = false
    ): SpawnPoint[] {
        // Check if boss mode is active
        const bossMode = gameState.scene?.registry.get('bossMode') === true;
        if (bossMode) {
            return this.generateBossOnlySpawnPoints(baseY, allowYVariance);
        }
        
        const spawnPoints: SpawnPoint[] = [];
        
        // Apply difficulty multiplier
        const difficulty = playerStatsSystem.difficulty;
        let difficultyMultiplier = 1;
        
        if (difficulty === 'easy') {
            difficultyMultiplier = EASY_MODE_CONFIG.enemySpawnMultiplier;
        } else if (difficulty === 'hard') {
            difficultyMultiplier = HARD_MODE_CONFIG.enemySpawnMultiplier;
        }
        
        // Apply level-based multiplier (stacks with difficulty)
        const levelMultiplier = levelProgressionSystem.getEnemyCountMultiplier();
        
        // Combine multipliers
        const finalSpawnMultiplier = difficultyMultiplier * levelMultiplier;
        
        // Calculate segment width
        const segmentWidth = WORLD_WIDTH / SPAWN_CONFIG.segmentCount;
        
        // Generate random densities for segments 1-13 (excluding first, last, and boss segment)
        const spawnSegmentCount = SPAWN_CONFIG.segmentCount - 3; // 13 segments (segments 1-13)
        const densities = this.generateBalancedDensities(spawnSegmentCount);
        
        // Generate spawn points for segments 1-13
        // Segment 0: empty (no enemies)
        // Segments 1-13: spawn enemies with random density  
        // Segment 14: boss only (handled after loop)
        // Segment 15: empty (no enemies)
        for (let segmentIndex = 1; segmentIndex < SPAWN_CONFIG.segmentCount - 2; segmentIndex++) {
            const segmentStart = segmentIndex * segmentWidth;
            const segmentEnd = (segmentIndex + 1) * segmentWidth;
            const densityIndex = segmentIndex - 1; // Map to densities array (0-12)
            const densityMultiplier = densities[densityIndex] ?? 1.0; // Safety fallback
            
            // Calculate interval for this segment
            const interval = baseInterval / (densityMultiplier * finalSpawnMultiplier);
            
            // Generate spawn points within this segment
            this.generateSpawnPointsInZone(
                segmentStart,
                segmentEnd,
                interval,
                baseY,
                allowYVariance,
                spawnPoints
            );
        }
        
        // Add boss spawn point in segment 14 (second-to-last segment)
        const bossSegmentStart = (SPAWN_CONFIG.segmentCount - 2) * segmentWidth;
        const bossSegmentEnd = (SPAWN_CONFIG.segmentCount - 1) * segmentWidth;
        const bossX = bossSegmentStart + (bossSegmentEnd - bossSegmentStart) * 0.5; // Center of segment
        
        // For ground bosses (no Y variance), spawn at top of map so they drift down
        // For swimming bosses (Y variance), use the base Y position
        let bossY: number;
        if (allowYVariance) {
            // Swimming enemies - use baseY with variance
            const rawBossY = baseY + (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y;
            const minSpawnY = SPAWN_CONFIG.defaults.minSpawnY;
            const maxSpawnY = SPAWN_CONFIG.defaults.maxSpawnY;
            bossY = Math.max(minSpawnY, Math.min(maxSpawnY, rawBossY));
        } else {
            // Ground bosses - spawn at top of map to prevent falling through floor
            bossY = SPAWN_CONFIG.defaults.minSpawnY + 50; // Spawn near top with small margin
        }
        
        spawnPoints.push({ x: bossX, y: bossY, isBoss: true });
        
        return spawnPoints;
    }

    /**
     * Generate boss-only mixed spawn points for underwater boss mode
     * @returns Object with fish and crab boss spawn points
     */
    generateBossMixedSpawnPoints(): {
        fishSpawns: SpawnPoint[];
        crabSpawns: SpawnPoint[];
    } {
        const fishSpawns: SpawnPoint[] = [];
        const crabSpawns: SpawnPoint[] = [];
        const segmentWidth = WORLD_WIDTH / SPAWN_CONFIG.segmentCount;
        
        // Get boss segments for current scene
        const currentScene = gameState.currentSceneKey;
        let bossSegments: number[] = [];
        
        if (currentScene === 'UnderwaterScene') {
            bossSegments = BOSS_MODE_CONFIG.bossSegments.water;
        } else if (currentScene === 'UnderwaterMicroScene') {
            bossSegments = BOSS_MODE_CONFIG.bossSegments.waterMicro;
        }
        
        // Place bosses: first half as swimming, second half as crabs
        bossSegments.forEach((segmentIndex, index) => {
            const segmentStart = segmentIndex * segmentWidth;
            const segmentEnd = (segmentIndex + 1) * segmentWidth;
            const bossX = segmentStart + (segmentEnd - segmentStart) * 0.5;
            
            if (index === 0) {
                // First boss: swimming (SharkBoss or MicroSwimBoss)
                const baseY = currentScene === 'UnderwaterScene' 
                    ? SPAWN_CONFIG.defaults.midWaterY 
                    : SPAWN_CONFIG.defaults.microWaterY;
                const rawBossY = baseY + (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y;
                const bossY = Math.max(
                    SPAWN_CONFIG.defaults.minSpawnY,
                    Math.min(SPAWN_CONFIG.defaults.maxSpawnY, rawBossY)
                );
                fishSpawns.push({ x: bossX, y: bossY, isBoss: true });
            } else {
                // Second boss: crab (CrabBoss or MicroCrabBoss)
                const bossY = SPAWN_CONFIG.defaults.bossCrabY;
                crabSpawns.push({ x: bossX, y: bossY, isBoss: true });
            }
        });
        
        return { fishSpawns, crabSpawns };
    }

    /**
     * Generate mixed spawn points for underwater scenes (fish + crabs)
     * @param fishRatio - Ratio of fish to total enemies (e.g., 0.8 for 80% fish)
     * @returns Object with fish and crab spawn points
     */
    generateMixedSpawnPoints(fishRatio: number = 0.8): {
        fishSpawns: SpawnPoint[];
        crabSpawns: SpawnPoint[];
    } {
        // Check if boss mode is active
        const bossMode = gameState.scene?.registry.get('bossMode') === true;
        if (bossMode) {
            return this.generateBossMixedSpawnPoints();
        }
        
        // Generate base spawn points with Y variance for fish
        const baseSpawnPoints = this.generateDynamicSpawnPoints(
            SPAWN_CONFIG.defaults.baseInterval,
            SPAWN_CONFIG.defaults.midWaterY,
            true
        );
        
        const fishSpawns: SpawnPoint[] = [];
        const crabSpawns: SpawnPoint[] = [];
        
        // Separate boss from regular spawns
        const bossPoint = baseSpawnPoints.find(sp => sp.isBoss);
        const regularPoints = baseSpawnPoints.filter(sp => !sp.isBoss);
        
        // Distribute regular spawns between fish and crabs
        regularPoints.forEach(point => {
            if (Math.random() < fishRatio) {
                fishSpawns.push(point);
            } else {
                // Crabs spawn on ground
                crabSpawns.push({ 
                    x: point.x, 
                    y: SPAWN_CONFIG.defaults.groundY, 
                    isBoss: false 
                });
            }
        });
        
        // Add boss (randomly shark or crab)
        if (bossPoint) {
            if (Math.random() < 0.5) {
                // Boss shark (swimming)
                fishSpawns.push(bossPoint);
            } else {
                // Boss crab (ground)
                crabSpawns.push({ 
                    x: bossPoint.x, 
                    y: SPAWN_CONFIG.defaults.bossCrabY, 
                    isBoss: true 
                });
            }
        }
        
        return { fishSpawns, crabSpawns };
    }
    
    /**
     * Upgrade player vehicle sprite based on level and environment
     */
    upgradePlayerCar(): void {
        if (!gameState.player) return;
        
        const stats = playerStatsSystem.getStats();
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        
        if (isUnderwater) {
            // Submarines: sub_1, sub_2, sub_3 (level 3+)
            let subLevel = 1;
            if (stats.level >= XP_CONFIG.vehicleUpgrade.submarineLevel3Threshold) {
                subLevel = 3;
            } else if (stats.level >= XP_CONFIG.vehicleUpgrade.submarineLevel2Threshold) {
                subLevel = 2;
            }
            const subTexture = `sub_${subLevel}`;
            gameState.player.setTexture(subTexture);
        } else {
            // Cars are car_1 through car_5 (levels 1-5)
            const carLevel = Math.min(stats.level, XP_CONFIG.vehicleUpgrade.maxCarLevel);
            const carTexture = `car_${carLevel}`;
            gameState.player.setTexture(carTexture);
        }
    }
    
    /**
     * Handle player level up - upgrade car only
     */
    onPlayerLevelUp(level: number): void {
        this.upgradePlayerCar();
    }
}

// Singleton instance management
let spawnSystemInstance: SpawnSystem | null = null;

/**
 * Get the SpawnSystem instance, creating it if necessary
 */
export function getSpawnSystem(): SpawnSystem {
    if (!spawnSystemInstance) {
        spawnSystemInstance = new SpawnSystem();
    }
    return spawnSystemInstance;
}

/**
 * Reset the SpawnSystem instance (useful for testing)
 */
export function resetSpawnSystem(): void {
    spawnSystemInstance = null;
}

// Default export for backward compatibility
export default getSpawnSystem();
