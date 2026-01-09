/**
 * Physics Configuration
 * Physics settings for world, player, enemies, and projectiles
 */

// Physics configuration
export const PHYSICS_CONFIG = {
    underwater: {
        speedMultiplier: 0.5
    },
    projectile: {
        spawnOffsetX: 40,
        heightRatio: 1/6,
        maxRangeMultiplier: 1.5,
        depth: 0
    },
    player: {
        baseDisplayScale: 0.25,
        sizeChangeJumpVelocity: -200,
        jumpPower: 200
    },
    enemy: {
        baseScale: 0.2,
        bossScaleMultiplier: 3,
        bounce: 0.2,
        groundY: 750,
        screenTopBoundary: 50,
        screenBottomBoundary: 750,
        aggroJump: {
            verticalThreshold: 50,
            horizontalThreshold: 200,
            velocity: -250
        },
        patrol: {
            floatAngleIncrement: 0.02,
            floatSpeedPlankton: 0.3,
            floatSpeedOther: 0.5,
            verticalAmplitudePlankton: 30,
            verticalAmplitudeOther: 50,
            crabJumpProbability: 0.01,
            crabJumpVelocity: -150
        }
    }
} as const;

// Dynamic spawn configuration
export const SPAWN_CONFIG = {
    segmentCount: 16,
    densityRange: {
        min: 0.3,
        max: 1.8
    },
    positionVariance: {
        x: 50,
        y: 100
    },
    defaults: {
        baseInterval: 300,
        groundY: 680,
        midWaterY: 400,
        microWaterY: 350,
        bossGroundY: 550,
        bossCrabY: 600,
        minSpawnX: 300,
        minSpawnY: 100,
        maxSpawnY: 700
    }
} as const;
