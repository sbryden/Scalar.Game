/**
 * Combat Configuration
 * Player combat, projectiles, and damage settings
 */

// Player combat configuration (explicit type to avoid literal narrowing issues)
export const PLAYER_COMBAT_CONFIG: {
    baseMeleeDamage: number;
    baseKnockbackForce: number;
    enemyToPlayerCooldown: number;
    playerToEnemyCooldown: number;
    invulnerabilityDuration: number;
    stunDuration: number;
    meleeModePlayerDamage: number;
    passiveModePlayerDamage: number;
    passiveModeVelocityBonusMultiplier: number;
    meleeModeDamageReduction: number;
    requiredApproachSpeed: number;
    velocityDamageMultiplier: number;
    maxVelocityBonus: number;
    standardEnemyWidth: number;
    sizeAdvantageMultiplier: number;
    sizeDisadvantageMultiplier: number;
    headOnBonusMultiplier: number;
    headOnDetectionThreshold: number;
    rearAttackMultiplier: number;
    comboTimeWindow: number;
    comboDamageBonus: number;
    maxComboMultiplier: number;
    microScaleMultiplier: number;
    normalScaleMultiplier: number;
    macroScaleMultiplier: number;
    knockbackVelocityScaleFactor: number;
    maxKnockbackMultiplier: number;
} = {
    baseMeleeDamage: 5,
    baseKnockbackForce: 300,
    enemyToPlayerCooldown: 500,
    playerToEnemyCooldown: 100,
    invulnerabilityDuration: 150,
    stunDuration: 500,
    // Melee attack mode
    meleeModePlayerDamage: 15,
    passiveModePlayerDamage: 3,
    passiveModeVelocityBonusMultiplier: 0.5,
    meleeModeDamageReduction: 0.25,
    requiredApproachSpeed: 50,
    // Momentum-based damage
    velocityDamageMultiplier: 0.01,
    maxVelocityBonus: 10,
    // Size/mass considerations
    standardEnemyWidth: 30,
    sizeAdvantageMultiplier: 1.3,
    sizeDisadvantageMultiplier: 0.8,
    // Positioning bonuses
    headOnBonusMultiplier: 1.2,
    headOnDetectionThreshold: 0.8,
    rearAttackMultiplier: 0.9,
    // Combo system
    comboTimeWindow: 2000,
    comboDamageBonus: 0.15,
    maxComboMultiplier: 2.0,
    // Scale-based ramming variations
    microScaleMultiplier: 0.9,
    normalScaleMultiplier: 1.0,
    macroScaleMultiplier: 1.3,
    // Knockback scaling
    knockbackVelocityScaleFactor: 500,
    maxKnockbackMultiplier: 2.0
};

// Projectile configuration
export const PROJECTILE_CONFIG = {
    basic: {
        width: 10,
        height: 10,
        color: 0xFFFF00,
        speed: 375,
        damage: 10,
        cooldown: 500
    },
    enemy: {
        sharkpedo: {
            speed: 300,
            damage: 15,
            cooldown: 3000,
            range: 800
        }
    }
} as const;

// Combat configuration (visual effects, stun, knockback)
export const COMBAT_CONFIG = {
    godMode: {
        damage: 1000,
        health: 10000000
    },
    visual: {
        enemyFlashDuration: 100,
        cameraShakeDuration: 100,
        cameraShakeIntensityMelee: 0.003,
        cameraShakeIntensityNormal: 0.005,
        cameraShakeIntensityPerDamage: 0.0001,
        cameraShakeMaxIntensity: 0.015,
        impactFlashDuration: 150,
        impactFlashDamageThreshold: 25,
        meleeModeTintColor: 0x88ccff,
        impactFlashColor: 0xFFFFFF,
        explosion: {
            duration: 200,
            minScale: 0.3,
            maxScale: 1.5,
            particleColor: 0xFFAA00,
            particleCount: 8,
            particleSpeed: 150,
            alphaStart: 1.0,
            alphaEnd: 0.0
        }
    },
    stun: {
        velocityDecay: 0.95
    },
    playerKnockback: {
        force: 250,
        verticalMultiplier: 0.5
    }
} as const;

// God mode configuration
export const GOD_MODE_CONFIG = {
    playerSpeedMultiplier: 4.0
} as const;

// Jet Mech power-up configuration
export const JET_MECH_CONFIG = {
    maxHealth: 500,
    healthDecayPerSecond: 1000 / 60, // ~16.67 HP/sec, depletes in 30 seconds
    scale: 0.5, // Boss-sized (larger than normal player)
    thrustPower: 200, // Vertical thrust power (similar to underwater)
    projectileKey: 'land/jet_mech_projectile',
    abilityWindowSeconds: 15, // Time player has to activate ability after level-up
    activationLevelThreshold: 2 // Mech becomes available after reaching this level
} as const;
