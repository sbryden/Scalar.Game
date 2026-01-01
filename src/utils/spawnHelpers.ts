/**
 * Spawn Helper Functions
 * Utility functions for dynamic enemy spawn point generation
 */
import { WORLD_WIDTH, SPAWN_CONFIG } from '../config';
import { HARD_MODE_CONFIG } from '../config';
import playerStatsSystem from '../systems/PlayerStatsSystem';

/**
 * Spawn point data structure
 */
export interface SpawnPoint {
    x: number;
    y: number;
    isBoss: boolean;
}

/**
 * Generate dynamic spawn points with density gradients
 * @param baseInterval - Base spawn interval in pixels (default: 300)
 * @param baseY - Base Y coordinate for spawning (e.g., 680 for ground, 400 for mid-water)
 * @param allowYVariance - Whether to add Y variance (true for swimming enemies)
 * @returns Array of spawn points
 */
export function generateDynamicSpawnPoints(
    baseInterval: number = 300,
    baseY: number = 680,
    allowYVariance: boolean = false
): SpawnPoint[] {
    const spawnPoints: SpawnPoint[] = [];
    
    // Apply hard mode multiplier
    const isHardMode = playerStatsSystem.difficulty === 'hard';
    const difficultyMultiplier = isHardMode ? HARD_MODE_CONFIG.enemySpawnMultiplier : 1;
    
    // Generate spawn points for each zone
    const startZoneEnd = WORLD_WIDTH * SPAWN_CONFIG.zones.start.end;
    const middleZoneEnd = WORLD_WIDTH * SPAWN_CONFIG.zones.middle.end;
    const endZoneEnd = WORLD_WIDTH * SPAWN_CONFIG.zones.end.end;
    
    // Start zone (sparse)
    generateSpawnPointsInZone(
        300,
        startZoneEnd,
        baseInterval / (SPAWN_CONFIG.densityMultipliers.start * difficultyMultiplier),
        baseY,
        allowYVariance,
        spawnPoints
    );
    
    // Middle zone (dense)
    generateSpawnPointsInZone(
        startZoneEnd,
        middleZoneEnd,
        baseInterval / (SPAWN_CONFIG.densityMultipliers.middle * difficultyMultiplier),
        baseY,
        allowYVariance,
        spawnPoints
    );
    
    // End zone (sparse)
    generateSpawnPointsInZone(
        middleZoneEnd,
        endZoneEnd,
        baseInterval / (SPAWN_CONFIG.densityMultipliers.end * difficultyMultiplier),
        baseY,
        allowYVariance,
        spawnPoints
    );
    
    // Add boss spawn point
    const bossX = WORLD_WIDTH - 
        SPAWN_CONFIG.boss.minDistanceFromEnd - 
        Math.random() * (SPAWN_CONFIG.boss.maxDistanceFromEnd - SPAWN_CONFIG.boss.minDistanceFromEnd);
    
    const bossY = allowYVariance 
        ? baseY + (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y
        : baseY;
    
    spawnPoints.push({ x: bossX, y: bossY, isBoss: true });
    
    return spawnPoints;
}

/**
 * Generate spawn points within a specific zone
 */
function generateSpawnPointsInZone(
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
        const spawnX = Math.max(300, Math.min(WORLD_WIDTH - 300, x + xVariance));
        
        // Add random variance to Y position if allowed (for swimming enemies)
        let spawnY = baseY;
        if (allowYVariance) {
            const yVariance = (Math.random() - 0.5) * SPAWN_CONFIG.positionVariance.y;
            spawnY = Math.max(100, Math.min(700, baseY + yVariance));
        }
        
        spawnPoints.push({ x: spawnX, y: spawnY, isBoss: false });
    }
}

/**
 * Generate mixed spawn points for underwater scenes (fish + crabs)
 * @param fishRatio - Ratio of fish to total enemies (e.g., 0.8 for 80% fish)
 * @returns Object with fish and crab spawn points
 */
export function generateMixedSpawnPoints(fishRatio: number = 0.8): {
    fishSpawns: SpawnPoint[];
    crabSpawns: SpawnPoint[];
} {
    // Generate base spawn points with Y variance for fish
    const baseSpawnPoints = generateDynamicSpawnPoints(300, 400, true);
    
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
            crabSpawns.push({ x: point.x, y: 680, isBoss: false });
        }
    });
    
    // Add boss (randomly shark or crab)
    if (bossPoint) {
        if (Math.random() < 0.5) {
            // Boss shark (swimming)
            fishSpawns.push(bossPoint);
        } else {
            // Boss crab (ground)
            crabSpawns.push({ x: bossPoint.x, y: 600, isBoss: true });
        }
    }
    
    return { fishSpawns, crabSpawns };
}
