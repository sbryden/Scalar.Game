/**
 * Combat System
 * Handles damage calculations and combat logic
 */
import { PROJECTILE_CONFIG, PLAYER_COMBAT_CONFIG, COMBAT_CONFIG } from '../config';
import playerStatsSystem from './PlayerStatsSystem';
import levelStatsTracker from './LevelStatsTracker';
import spawnSystem from './SpawnSystem';
import gameState from '../utils/gameState';
import enemyManager from '../managers/EnemyManager';
import type { Player, Enemy, Projectile } from '../types/game';

/**
 * Union type for entities that can deal or receive damage
 * This maintains type safety while allowing flexibility for damage calculations
 */
type DamageEntity = Player | Enemy | Projectile;

/**
 * Spawner boss group tracking interface
 * Tracks the state of a spawner boss and its minions
 * Note: Stores position data instead of enemy reference to avoid memory leaks
 */
interface SpawnerBossGroup {
    bossId: string;
    bossX: number;  // Position where XP orb should spawn
    bossY: number;  // Position where XP orb should spawn
    bossScene: Phaser.Scene; // Scene reference for spawning XP orb
    bossKilled: boolean;
    totalMinions: number;
    deadMinions: number;
    xpReward: number; // Total XP to be awarded when fully defeated
}

export class CombatSystem {
    private onBossDefeat: (() => void) | null = null;
    private spawnerBossGroups: Map<string, SpawnerBossGroup> = new Map();
    private bossesDefeated: number = 0;
    private totalBosses: number = 1; // Default to 1 for normal mode
    private nextSpawnerBossId: number = 0;

    /**
     * Set callback for when a boss is defeated
     */
    setBossDefeatCallback(callback: () => void): void {
        this.onBossDefeat = callback;
    }

    /**
     * Set total number of bosses for level (used in boss mode)
     */
    setTotalBosses(count: number): void {
        this.totalBosses = count;
        this.bossesDefeated = 0;
    }

    /**
     * Get current boss defeat progress (used for HUD display)
     */
    getBossProgress(): { defeated: number; total: number } {
        return {
            defeated: this.bossesDefeated,
            total: this.totalBosses
        };
    }

    /**
     * Reset spawner boss tracking (call when starting a new level)
     */
    resetSpawnerTracking(): void {
        this.spawnerBossGroups.clear();
        this.bossesDefeated = 0;
        this.totalBosses = 1;
        this.nextSpawnerBossId = 0;
    }
    
    /**
     * Generate unique ID for spawner boss
     */
    private generateSpawnerBossId(): string {
        return `spawner_${this.nextSpawnerBossId++}`;
    }

    /**
     * Check if player is moving toward enemy
     * Uses dot product to determine if player velocity is directed toward enemy
     */
    isPlayerMovingTowardEnemy(player: Player, enemy: Enemy): boolean {
        if (!player.body) return false;
        
        // Calculate direction vector from player to enemy
        const directionToEnemy = {
            x: enemy.x - player.x,
            y: enemy.y - player.y
        };
        
        // Get player velocity
        const playerVelocity = {
            x: player.body.velocity.x,
            y: player.body.velocity.y
        };
        
        // Calculate dot product: positive = moving toward, negative = moving away
        const dotProduct = 
            (directionToEnemy.x * playerVelocity.x) + 
            (directionToEnemy.y * playerVelocity.y);
        
        // Return true if moving toward with sufficient speed
        return dotProduct > PLAYER_COMBAT_CONFIG.requiredApproachSpeed;
    }
    
    /**
     * Calculate player velocity magnitude
     */
    private getPlayerVelocityMagnitude(player: Player): number {
        if (!player.body) return 0;
        
        const vx = player.body.velocity.x;
        const vy = player.body.velocity.y;
        return Math.sqrt(vx * vx + vy * vy);
    }
    
    /**
     * Calculate attack angle and determine positioning bonus
     * Returns multiplier based on attack angle (flanking, head-on, rear)
     */
    private getPositioningMultiplier(player: Player, enemy: Enemy): number {
        if (!player.body) return 1.0;
        
        // Calculate direction vectors
        const playerToEnemy = {
            x: enemy.x - player.x,
            y: enemy.y - player.y
        };
        
        // Get player velocity (attack direction)
        const playerVelocity = {
            x: player.body.velocity.x,
            y: player.body.velocity.y
        };
        
        // Normalize vectors
        const pteLen = Math.sqrt(playerToEnemy.x * playerToEnemy.x + playerToEnemy.y * playerToEnemy.y);
        const pvLen = Math.sqrt(playerVelocity.x * playerVelocity.x + playerVelocity.y * playerVelocity.y);
        
        if (pteLen === 0 || pvLen === 0) return 1.0;
        
        const pteDirX = playerToEnemy.x / pteLen;
        const pteDirY = playerToEnemy.y / pteLen;
        const pvDirX = playerVelocity.x / pvLen;
        const pvDirY = playerVelocity.y / pvLen;
        
        // Calculate dot product to get angle alignment
        const dotProduct = pteDirX * pvDirX + pteDirY * pvDirY;
        
        // Calculate perpendicular component (for flanking detection)
        const perpDot = Math.abs(pteDirX * pvDirY - pteDirY * pvDirX);
        
        // Determine attack type based on angle
        const angleThresholdRad = (PLAYER_COMBAT_CONFIG.flankingAngleThreshold * Math.PI) / 180;
        
        // Head-on attack: moving directly toward enemy (high dot product, low perpendicular)
        if (dotProduct > 0.8) {
            return PLAYER_COMBAT_CONFIG.headOnBonusMultiplier;
        }
        
        // Flanking attack: hitting from the side (perpendicular approach)
        if (perpDot > Math.sin(angleThresholdRad) && dotProduct > 0) {
            return PLAYER_COMBAT_CONFIG.flankingBonusMultiplier;
        }
        
        // Rear attack: moving away or very oblique angle (less effective but safer)
        if (dotProduct < 0) {
            return PLAYER_COMBAT_CONFIG.rearAttackMultiplier;
        }
        
        // Normal attack (no special positioning)
        return 1.0;
    }
    
    /**
     * Calculate size-based damage multiplier
     */
    private getSizeMultiplier(playerScale: number, enemyWidth: number): number {
        // Approximate enemy scale based on width (30 is standard enemy width)
        const standardEnemyWidth = 30;
        const enemyScale = enemyWidth / standardEnemyWidth;
        
        // Compare player scale to enemy scale
        if (playerScale > enemyScale * 1.2) {
            // Player significantly larger - size advantage
            return PLAYER_COMBAT_CONFIG.sizeAdvantageMultiplier;
        } else if (playerScale < enemyScale * 0.8) {
            // Player significantly smaller - size disadvantage
            return PLAYER_COMBAT_CONFIG.sizeDisadvantageMultiplier;
        }
        
        // Similar size - no modifier
        return 1.0;
    }
    
    /**
     * Update combo state and get combo multiplier
     */
    private getComboMultiplier(player: Player, gameTime: number): number {
        // Initialize combo tracking if needed
        if (player.comboCount === undefined) {
            player.comboCount = 0;
        }
        if (player.lastComboHitTime === undefined) {
            player.lastComboHitTime = 0;
        }
        
        // Check if combo has expired
        if (gameTime - player.lastComboHitTime > PLAYER_COMBAT_CONFIG.comboTimeWindow) {
            player.comboCount = 0;
        }
        
        // Increment combo
        player.comboCount++;
        player.lastComboHitTime = gameTime;
        
        // Calculate combo multiplier (capped at max)
        const comboBonus = 1 + (player.comboCount - 1) * PLAYER_COMBAT_CONFIG.comboDamageBonus;
        return Math.min(comboBonus, PLAYER_COMBAT_CONFIG.maxComboMultiplier);
    }
    
    /**
     * Reset combo when player takes damage
     */
    resetCombo(player: Player): void {
        player.comboCount = 0;
        player.lastComboHitTime = 0;
    }
    
    /**
     * Apply damage to an enemy from a projectile
     */
    damageEnemy(projectile: Projectile, enemy: Enemy): void {
        if (!projectile.active) return;
        
        // Skip damage for dead enemies
        if (enemy.isDead) {
            projectile.destroy();
            return;
        }
        
        const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
        enemy.health -= damage;
        
        // Track damage dealt
        levelStatsTracker.recordDamageDealt(damage);
        
        // Trigger chase when hit by projectile
        if (!enemy.isChasing && gameState.player) {
            enemy.isChasing = true;
            enemy.chaseTarget = gameState.player;
        }
        
        // Visual feedback: flash enemy red
        enemy.setTint(0xff0000);
        enemy.scene.time.delayedCall(COMBAT_CONFIG.visual.enemyFlashDuration, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });
        
        projectile.destroy();
        
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }
    
    /**
     * Handle player-enemy collision
     * Both player and enemy take damage, enemy gets knocked back
     * @param gameTime - Current game time from Phaser scene (scene.time.now)
     */
    handlePlayerEnemyCollision(player: Player, enemy: Enemy, gameTime: number): void {
        // Skip collision for dead enemies
        if (enemy.isDead) {
            return;
        }
        
        // Check if player is immune (after respawn)
        if (player.immuneUntil && gameTime < player.immuneUntil) {
            // Player is immune, no collision effects
            return;
        }
        
        // Trigger chase on collision if not already chasing
        if (!enemy.isChasing) {
            enemy.isChasing = true;
            enemy.chaseTarget = player;
        }
        
        // Check if entities are stunned (prevent knockback spam)
        const playerStunned = player.stunnedUntil && gameTime < player.stunnedUntil;
        const enemyStunned = enemy.stunnedUntil && gameTime < enemy.stunnedUntil;
        
        // Apply knockback only if neither is stunned
        if (!playerStunned && !enemyStunned) {
            this.applyEnemyKnockback(player, enemy);
            this.applyPlayerKnockback(player, enemy);
            
            // Stun both entities
            player.stunnedUntil = gameTime + PLAYER_COMBAT_CONFIG.stunDuration;
            enemy.stunnedUntil = gameTime + PLAYER_COMBAT_CONFIG.stunDuration;
            
            // Freeze movement during stun
            if (player.body) player.stunVelocity = { x: player.body.velocity.x, y: player.body.velocity.y };
            if (enemy.body) enemy.stunVelocity = { x: enemy.body.velocity.x, y: enemy.body.velocity.y };
        }
        
        // Check if enemy can damage player (cooldown per enemy)
        if (!enemy.lastDamageTime || gameTime - enemy.lastDamageTime >= PLAYER_COMBAT_CONFIG.enemyToPlayerCooldown) {
            // Determine damage based on melee mode
            const enemyDamage = enemy.damage || 10;
            let damageToPlayer: number;
            
            if (player.isMeleeMode) {
                // Player in melee mode - takes reduced damage
                damageToPlayer = enemyDamage * PLAYER_COMBAT_CONFIG.meleeModeDamageReduction;
            } else {
                // Player not in melee mode - takes full damage
                damageToPlayer = enemyDamage;
            }
            
            this.damagePlayer(damageToPlayer);
            enemy.lastDamageTime = gameTime;
            
            // Reset combo when taking damage
            this.resetCombo(player);
            
            // Visual feedback: flash player red and shake camera
            // Don't override melee mode tint if active
            if (!player.isMeleeMode) {
                player.setTint(0xff0000);
                enemy.scene.time.delayedCall(PLAYER_COMBAT_CONFIG.invulnerabilityDuration, () => {
                    if (player.active && !player.isMeleeMode) {
                        player.clearTint();
                    }
                });
            }
            
            // Camera shake effect (more intense if taking full damage)
            const shakeIntensity = player.isMeleeMode ? COMBAT_CONFIG.visual.cameraShakeIntensityMelee : COMBAT_CONFIG.visual.cameraShakeIntensityNormal;
            enemy.scene.cameras.main.shake(COMBAT_CONFIG.visual.cameraShakeDuration, shakeIntensity);
        }
        
        // Check if player can damage enemy (cooldown per enemy)
        if (!enemy.lastPlayerDamageTime || gameTime - enemy.lastPlayerDamageTime >= PLAYER_COMBAT_CONFIG.playerToEnemyCooldown) {
            let playerDamage = 0;
            
            // God mode deals configured damage on collision
            if (playerStatsSystem.isGodMode()) {
                playerDamage = COMBAT_CONFIG.godMode.damage;
            } else if (player.isMeleeMode) {
                // Player in melee mode - deals full melee damage with enhancements
                playerDamage = PLAYER_COMBAT_CONFIG.meleeModePlayerDamage;
                
                // Apply momentum bonus
                const velocity = this.getPlayerVelocityMagnitude(player);
                const velocityBonus = Math.min(
                    velocity * PLAYER_COMBAT_CONFIG.velocityDamageMultiplier,
                    PLAYER_COMBAT_CONFIG.maxVelocityBonus
                );
                playerDamage += velocityBonus;
                
                // Apply positioning multiplier
                const positioningMult = this.getPositioningMultiplier(player, enemy);
                playerDamage *= positioningMult;
                
                // Apply size multiplier
                const sizeMultiplier = this.getSizeMultiplier(player.scaleX, enemy.width);
                playerDamage *= sizeMultiplier;
                
                // Apply combo multiplier
                const comboMultiplier = this.getComboMultiplier(player, gameTime);
                playerDamage *= comboMultiplier;
                
                // Apply scale-based multiplier (micro vs normal)
                const scaleMultiplier = gameState.playerSize === 'small' 
                    ? PLAYER_COMBAT_CONFIG.microScaleMultiplier 
                    : PLAYER_COMBAT_CONFIG.normalScaleMultiplier;
                playerDamage *= scaleMultiplier;
                
            } else if (this.isPlayerMovingTowardEnemy(player, enemy)) {
                // Player moving toward enemy without melee mode - deals partial damage
                playerDamage = PLAYER_COMBAT_CONFIG.passiveModePlayerDamage;
                
                // Apply minimal momentum bonus for passive mode
                const velocity = this.getPlayerVelocityMagnitude(player);
                const velocityBonus = Math.min(
                    velocity * PLAYER_COMBAT_CONFIG.velocityDamageMultiplier * 0.5,
                    PLAYER_COMBAT_CONFIG.maxVelocityBonus * 0.5
                );
                playerDamage += velocityBonus;
            }
            // else: Player moving away or stationary - deals no damage
            
            if (playerDamage > 0) {
                // Round damage for cleaner values
                playerDamage = Math.round(playerDamage);
                
                enemy.health -= playerDamage;
                enemy.lastPlayerDamageTime = gameTime;
                
                // Track damage dealt
                levelStatsTracker.recordDamageDealt(playerDamage);
                
                // Visual feedback: flash enemy white (different from projectile red)
                enemy.setTint(0xffffff);
                enemy.scene.time.delayedCall(COMBAT_CONFIG.visual.enemyFlashDuration, () => {
                    if (enemy.active) {
                        enemy.clearTint();
                    }
                });
                
                // Enhanced camera shake based on damage dealt
                const baseShakeIntensity = player.isMeleeMode ? COMBAT_CONFIG.visual.cameraShakeIntensityMelee : COMBAT_CONFIG.visual.cameraShakeIntensityNormal;
                const damageShakeBonus = playerDamage * COMBAT_CONFIG.visual.cameraShakeIntensityPerDamage;
                const totalShakeIntensity = Math.min(
                    baseShakeIntensity + damageShakeBonus,
                    COMBAT_CONFIG.visual.cameraShakeMaxIntensity
                );
                enemy.scene.cameras.main.shake(COMBAT_CONFIG.visual.cameraShakeDuration, totalShakeIntensity);
                
                // Impact flash for high damage hits (>= 25 damage)
                if (playerDamage >= 25) {
                    player.setTint(COMBAT_CONFIG.visual.impactFlashColor);
                    enemy.scene.time.delayedCall(COMBAT_CONFIG.visual.impactFlashDuration, () => {
                        if (player.active && player.isMeleeMode) {
                            player.setTint(COMBAT_CONFIG.visual.meleeModeTintColor);
                        } else if (player.active) {
                            player.clearTint();
                        }
                    });
                }
                
                // Check if enemy died from collision
                if (enemy.health <= 0) {
                    this.killEnemy(enemy);
                }
            }
        }
    }
    
    /**
     * Update stun effects for entities
     * Call this every frame to handle stun state
     * @param gameTime - Current game time from Phaser scene (scene.time.now)
     */
    updateStunEffects(entities: Phaser.Physics.Arcade.Group, player: Player, gameTime: number): void {
        // Handle player stun
        if (player.stunnedUntil && gameTime < player.stunnedUntil) {
            // Player is stunned, reduce movement
            if (player.body) {
                player.body.setVelocityX(player.body.velocity.x * COMBAT_CONFIG.stun.velocityDecay);
            }
        }
        
        // Handle enemy stuns
        entities.children.entries.forEach(obj => {
            const enemy = obj as Enemy;
            if (enemy.stunnedUntil && gameTime < enemy.stunnedUntil) {
                // Enemy is stunned, freeze AI movement
                if (enemy.body) {
                    enemy.body.setVelocityX(enemy.body.velocity.x * COMBAT_CONFIG.stun.velocityDecay);
                }
            }
        });
    }
    
    /**
     * Apply knockback force to enemy based on player position and momentum
     */
    applyEnemyKnockback(player: Player, enemy: Enemy): void {
        // Calculate direction from player to enemy
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        
        // Get knockback resistance (0 = immune, 1 = normal, >1 = more knockback)
        const resistance = enemy.knockbackResistance || 1.0;
        
        // Base knockback force
        let knockbackForce = PLAYER_COMBAT_CONFIG.baseKnockbackForce * resistance;
        
        // Scale knockback with player velocity in melee mode
        if (player.isMeleeMode && player.body) {
            const velocity = this.getPlayerVelocityMagnitude(player);
            const velocityMultiplier = 1 + (velocity / 500); // +1x force at 500 velocity
            knockbackForce *= Math.min(velocityMultiplier, 2.0); // Cap at 2x
        }
        
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce;
        
        // Apply velocity to enemy body
        if (enemy.body) {
            enemy.body.setVelocity(knockbackX, knockbackY);
        }
    }
    
    /**
     * Handle enemy projectile hitting player
     * Shield completely blocks damage from enemy projectiles
     */
    handleEnemyProjectileHit(projectile: Projectile, player: Player, gameTime: number): void {
        if (!projectile.active) return;
        
        // Check if player is immune (after respawn)
        if (player.immuneUntil && gameTime < player.immuneUntil) {
            projectile.destroy();
            return;
        }
        
        // Check if player is in melee mode (shield active)
        if (player.isMeleeMode) {
            // Shield completely blocks the projectile
            projectile.destroy();
            // Visual feedback: flash the player blue briefly to show shield block
            player.setTint(0x0099FF);
            player.scene.time.delayedCall(100, () => {
                if (player.active && player.isMeleeMode) {
                    // Restore melee mode tint
                    player.setTint(COMBAT_CONFIG.visual.meleeModeTintColor);
                }
            });
            return;
        }
        
        // Player not shielded - take damage
        const damage = projectile.damage;
        this.damagePlayer(damage);
        
        // Visual feedback: flash player red and shake camera
        player.setTint(0xff0000);
        player.scene.time.delayedCall(PLAYER_COMBAT_CONFIG.invulnerabilityDuration, () => {
            if (player.active && !player.isMeleeMode) {
                player.clearTint();
            }
        });
        
        // Camera shake effect
        player.scene.cameras.main.shake(COMBAT_CONFIG.visual.cameraShakeDuration, COMBAT_CONFIG.visual.cameraShakeIntensityNormal);
        
        projectile.destroy();
    }
    
    /**
     * Apply knockback force to player based on enemy position
     */
    applyPlayerKnockback(player: Player, enemy: Enemy): void {
        // Calculate direction from enemy to player (opposite of enemy knockback)
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        
        // Apply configured knockback force
        const knockbackForce = COMBAT_CONFIG.playerKnockback.force;
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce * COMBAT_CONFIG.playerKnockback.verticalMultiplier;
        
        // Apply velocity to player body
        if (player.body) {
            player.body.setVelocity(
                player.body.velocity.x + knockbackX,
                player.body.velocity.y + knockbackY
            );
        }
    }
    
    /**
     * Spawn minions around a dead boss enemy
     * Handles both ground-based (x-axis spread) and swimming (full circle) spawns
     */
    private spawnMinionsOnDeath(boss: Enemy): void {
        if (!boss.scene || !boss.minionType || !boss.minionCount || !boss.spawnerBossId) return;
        
        const minionCount = boss.minionCount;
        const spawnRadius = boss.spawnRadius || 100; // Default 100 pixel radius
        
        // Check if minions are swimming enemies (need full circle spawn)
        const isSwimmingMinion = enemyManager.isSwimmingEnemy(boss.minionType);
        
        for (let i = 0; i < minionCount; i++) {
            let minionX: number;
            let minionY: number;
            
            if (isSwimmingMinion) {
                // Full circle spawn for swimming enemies (includes y-axis)
                const angle = (Math.PI * 2 / minionCount) * i;
                minionX = boss.x + Math.cos(angle) * spawnRadius;
                minionY = boss.y + Math.sin(angle) * spawnRadius;
            } else {
                // Ground-based spawn (x-axis line only)
                // Spread minions in a horizontal line
                const spacing = minionCount > 1 ? (spawnRadius * 2) / (minionCount - 1) : 0;
                minionX = boss.x - spawnRadius + (spacing * i);
                minionY = boss.y; // Same Y position as boss
            }
            
            // Spawn minion using the gameState spawn function
            if (gameState.spawnEnemyFunc) {
                const minion = gameState.spawnEnemyFunc(boss.scene, minionX, minionY, boss.minionType);
                
                // Link minion to parent spawner boss
                minion.parentSpawnerBossId = boss.spawnerBossId;
                
                // Make minion immediately chase player
                if (gameState.player) {
                    minion.isChasing = true;
                    minion.chaseTarget = gameState.player;
                }
            }
        }
    }
    
    /**
     * Kill an enemy and spawn XP orb
     */
    killEnemy(enemy: Enemy): void {
        // Check if this is a boss enemy
        const isBoss = enemy.enemyType?.startsWith('boss_');
        
        // Check if this is a spawner boss
        const isSpawnerBoss = enemy.isSpawnerBoss === true;
        
        // Check if this is a minion of a spawner boss
        const isMinion = !!enemy.parentSpawnerBossId;
        
        // Track enemy destruction with enemy type for scoring
        levelStatsTracker.recordEnemyDestroyed(enemy.enemyType, isBoss);
        
        // Mark enemy as dead to prevent further AI/damage processing
        enemy.health = 0;
        enemy.isDead = true;
        
        // Disable physics body so player can pass through during fade-out
        if (enemy.body) {
            enemy.body.setVelocity(0, 0);
            enemy.body.setEnable(false);
        }
        
        // Handle spawner boss death
        if (isSpawnerBoss && enemy.minionType && enemy.minionCount) {
            // Generate unique ID for this spawner boss if not already set
            if (!enemy.spawnerBossId) {
                enemy.spawnerBossId = this.generateSpawnerBossId();
            }
            
            // Create spawner boss group tracking
            // Store position and scene, not enemy reference (to avoid memory leak)
            const group: SpawnerBossGroup = {
                bossId: enemy.spawnerBossId,
                bossX: enemy.x,
                bossY: enemy.y,
                bossScene: enemy.scene,
                bossKilled: true,
                totalMinions: enemy.minionCount,
                deadMinions: 0,
                xpReward: enemy.xpReward || 0
            };
            this.spawnerBossGroups.set(enemy.spawnerBossId, group);
            
            console.log(`Spawner boss ${enemy.spawnerBossId} defeated, spawning ${enemy.minionCount} minions`);
            
            // Spawn minions (they will be linked to this boss)
            this.spawnMinionsOnDeath(enemy);
            
            // Don't spawn XP orb yet - wait for all minions to die
        } else if (isMinion && enemy.parentSpawnerBossId) {
            // This is a minion - check if parent spawner boss group exists
            const group = this.spawnerBossGroups.get(enemy.parentSpawnerBossId);
            
            if (group) {
                group.deadMinions++;
                console.log(`Minion killed (${group.deadMinions}/${group.totalMinions}) for spawner boss ${group.bossId}`);
                
                // Check if all minions are dead
                if (group.deadMinions >= group.totalMinions) {
                    console.log(`All minions destroyed for spawner boss ${group.bossId}, spawning XP orb`);
                    
                    // All minions dead - spawn XP orb at the original boss location
                    if (group.bossScene && group.xpReward) {
                        spawnSystem.spawnXPOrb(group.bossScene, group.bossX, group.bossY, group.xpReward);
                        
                        // Set depth for XP orbs to ensure they appear above dying enemies
                        if (gameState.xpOrbs) {
                            gameState.xpOrbs.children.entries.forEach((obj) => {
                                const orb = obj as Phaser.GameObjects.Arc;
                                orb.setDepth(100);
                            });
                        }
                    }
                    
                    // Clean up group tracking
                    this.spawnerBossGroups.delete(group.bossId);
                    
                    // Count this spawner boss (with all minions) as defeated
                    if (this.onBossDefeat) {
                        this.bossesDefeated++;
                        console.log(`Spawner boss fully defeated (${this.bossesDefeated}/${this.totalBosses})`);
                        
                        // Check if all bosses are defeated
                        if (this.bossesDefeated >= this.totalBosses) {
                            console.log('All bosses defeated, level complete!');
                            this.onBossDefeat();
                        }
                    }
                }
                
                // Don't spawn XP orb for individual minions
            } else {
                // Minion without parent group (shouldn't happen, but handle gracefully)
                console.warn(`Minion killed but no parent spawner boss group found: ${enemy.parentSpawnerBossId}`);
                
                // Spawn XP orb anyway as fallback
                if (enemy.scene && enemy.xpReward) {
                    spawnSystem.spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
                }
            }
        } else {
            // Regular enemy or regular boss (non-spawner)
            
            // Spawn XP orb immediately at enemy location
            if (enemy.scene && enemy.xpReward) {
                spawnSystem.spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
                
                // Set depth for XP orbs to ensure they appear above dying enemies
                if (gameState.xpOrbs) {
                    gameState.xpOrbs.children.entries.forEach((obj) => {
                        const orb = obj as Phaser.GameObjects.Arc;
                        orb.setDepth(100);
                    });
                }
            }
            
            // Handle regular boss defeat
            if (isBoss && this.onBossDefeat) {
                this.bossesDefeated++;
                console.log(`Boss defeated (${this.bossesDefeated}/${this.totalBosses})`);
                
                // Check if all bosses are defeated
                if (this.bossesDefeated >= this.totalBosses) {
                    console.log('All bosses defeated, level complete!');
                    this.onBossDefeat();
                }
            }
        }
        
        // Destroy health bars immediately
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        
        // Spawn floating skull death effect
        const skull = enemy.scene.add.image(enemy.x, enemy.y, 'dead_skull');
        skull.setDepth(150); // Above XP orbs and enemies
        skull.setScale(0.3); // Smaller skull size
        
        // Float skull up 100px and fade out over 2 seconds
        enemy.scene.tweens.add({
            targets: skull,
            y: skull.y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                skull.destroy();
            }
        });
        
        // Fade out enemy faster (1 second), then destroy
        enemy.scene.tweens.add({
            targets: enemy,
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                enemy.destroy();
            }
        });
    }
    
    /**
     * Apply damage to player
     */
    damagePlayer(damage: number): void {
        // Track damage taken
        levelStatsTracker.recordDamageTaken(damage);
        
        playerStatsSystem.takeDamage(damage);
    }
    
    /**
     * Calculate damage with potential modifiers
     * @param baseDamage - Base damage value before modifiers
     * @param attacker - Entity dealing damage (Player, Enemy, or Projectile)
     * @param target - Entity receiving damage (Player, Enemy, or Projectile)
     * @returns Final calculated damage with modifiers applied
     */
    calculateDamage(baseDamage: number, attacker: DamageEntity, target: DamageEntity): number {
        let finalDamage = baseDamage;
        
        // Future: Add damage modifiers here based on entity properties
        // Example: Type guards can be used to check for properties on specific entity types
        // if ('damage' in attacker && attacker.damage > 10) finalDamage *= 1.5; // Critical hit for high damage attackers
        // if ('maxHealth' in target && target.maxHealth > 100) finalDamage *= 0.8; // Armored targets take less damage
        
        return finalDamage;
    }
}

// Export singleton instance
export default new CombatSystem();
