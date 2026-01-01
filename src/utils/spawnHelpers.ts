/**
 * Spawn Helper Functions
 * Utility functions for dynamic enemy spawn point generation using 16-segment system
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
 * Generate random density multipliers for segments that sum to maintain target enemy count
 * @param segmentCount - Number of segments to generate densities for
 * @returns Array of density multipliers
 */
function generateBalancedDensities(segmentCount: number): number[] {
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
 * Generate dynamic spawn points with 16-segment system
 * @param baseInterval - Base spawn interval in pixels (default from SPAWN_CONFIG)
 * @param baseY - Base Y coordinate for spawning (default from SPAWN_CONFIG)
 * @param allowYVariance - Whether to add Y variance (true for swimming enemies)
 * @returns Array of spawn points
 */
export function generateDynamicSpawnPoints(
    baseInterval: number = SPAWN_CONFIG.defaults.baseInterval,
    baseY: number = SPAWN_CONFIG.defaults.groundY,
    allowYVariance: boolean = false
): SpawnPoint[] {
    const spawnPoints: SpawnPoint[] = [];
    
    // Apply hard mode multiplier
    const isHardMode = playerStatsSystem.difficulty === 'hard';
    const difficultyMultiplier = isHardMode ? HARD_MODE_CONFIG.enemySpawnMultiplier : 1;
    
    // Calculate segment width
    const segmentWidth = WORLD_WIDTH / SPAWN_CONFIG.segmentCount;
    
    // Generate random densities for segments 2-14 (excluding first, last, and second-to-last)
    const spawnSegmentCount = SPAWN_CONFIG.segmentCount - 3; // Segments 2-14 (13 segments)
    const densities = generateBalancedDensities(spawnSegmentCount);
    
    // Generate spawn points for each segment
    for (let segmentIndex = 1; segmentIndex < SPAWN_CONFIG.segmentCount - 2; segmentIndex++) {
        // Segment 0: no enemies
        // Segments 1-13: spawn enemies with random density
        // Segment 14: boss segment (handled separately)
        // Segment 15: no enemies
        
        const segmentStart = segmentIndex * segmentWidth;
        const segmentEnd = (segmentIndex + 1) * segmentWidth;
        const densityIndex = segmentIndex - 1; // Map to densities array (0-12)
        const densityMultiplier = densities[densityIndex] || 1.0; // Default to 1.0 if undefined
        
        // Calculate interval for this segment
        const interval = baseInterval / (densityMultiplier * difficultyMultiplier);
        
        // Generate spawn points within this segment
        generateSpawnPointsInZone(
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
 * Generate mixed spawn points for underwater scenes (fish + crabs)
 * @param fishRatio - Ratio of fish to total enemies (e.g., 0.8 for 80% fish)
 * @returns Object with fish and crab spawn points
 */
export function generateMixedSpawnPoints(fishRatio: number = 0.8): {
    fishSpawns: SpawnPoint[];
    crabSpawns: SpawnPoint[];
} {
    // Generate base spawn points with Y variance for fish
    const baseSpawnPoints = generateDynamicSpawnPoints(
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
