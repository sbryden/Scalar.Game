/**
 * Collision Manager
 * Sets up and manages all physics collisions in the game
 */
import gameState from '../utils/GameContext';
import enemyManager from './EnemyManager';
import combatSystem from '../systems/CombatSystem';
import { getCompanionManager } from './CompanionManager';
import type { Player, Enemy, Projectile, Companion } from '../types/game';

export class CollisionManager {
    scene: Phaser.Scene;
    playerEnemyCollider: Phaser.Physics.Arcade.Collider | null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.playerEnemyCollider = null;
    }
    
    /**
     * Setup all collision handlers
     */
    setupCollisions(): void {
        const { player, enemies, projectiles, xpOrbs, platforms } = gameState;
        
        if (!player || !enemies || !projectiles || !platforms) {
            console.error('CollisionManager: Required game objects not initialized');
            return;
        }
        
        // Enemy collisions
        this.scene.physics.add.collider(enemies, platforms);
        
        // Projectile collisions with platforms
        this.scene.physics.add.collider(projectiles, platforms, (obj1, obj2) => {
            // Type guard to identify projectile
            const isProjectile = (obj: unknown): obj is Projectile => {
                return obj !== null && typeof obj === 'object' && 'damage' in obj && 'spawnX' in obj;
            };
            
            // Find and destroy the projectile (not the platform!)
            if (isProjectile(obj1)) {
                obj1.destroy();
            } else if (isProjectile(obj2)) {
                obj2.destroy();
            }
        });
        
        this.scene.physics.add.collider(projectiles, enemies, (obj1, obj2) => {
            // Type guard to identify projectile vs enemy
            const isProjectile = (obj: unknown): obj is Projectile => {
                return obj !== null && typeof obj === 'object' && 'damage' in obj && 'spawnX' in obj;
            };
            const isEnemy = (obj: unknown): obj is Enemy => {
                return obj !== null && typeof obj === 'object' && 'health' in obj && 'enemyType' in obj;
            };
            
            let projectile: Projectile;
            let enemy: Enemy;
            
            if (isProjectile(obj1) && isEnemy(obj2)) {
                projectile = obj1;
                enemy = obj2;
            } else if (isProjectile(obj2) && isEnemy(obj1)) {
                projectile = obj2;
                enemy = obj1;
            } else {
                // Could not identify both objects, skip collision
                return;
            }
            
            // Only player projectiles damage enemies
            if (!projectile.isEnemyProjectile) {
                enemyManager.damageEnemy(projectile, enemy);
            }
        }, undefined, this.scene);
        
        // Enemy projectile hits player (or shield)
        this.scene.physics.add.collider(projectiles, player, (obj1, obj2) => {
            // Phaser collision callbacks can receive objects in either order
            // Use type guard to identify which is the projectile vs player
            const isProjectile = (obj: unknown): obj is Projectile => {
                return obj !== null && typeof obj === 'object' && 'damage' in obj && 'spawnX' in obj;
            };
            
            let projectile: Projectile;
            let playerObj: Player;
            
            if (isProjectile(obj1)) {
                projectile = obj1;
                playerObj = obj2 as Player;
            } else if (isProjectile(obj2)) {
                projectile = obj2;
                playerObj = obj1 as Player;
            } else {
                // Neither object is a valid projectile, skip collision
                console.warn('Projectile-player collision: Could not identify projectile');
                return;
            }
            
            // Only enemy projectiles can hit player
            if (projectile.isEnemyProjectile) {
                combatSystem.handleEnemyProjectileHit(projectile, playerObj, this.scene.time.now);
            } else {
                // Player projectile hit the player - just destroy the projectile, not the player!
                projectile.destroy();
            }
        }, undefined, this.scene);
        
        // Player-Enemy collision (bidirectional damage and knockback)
        this.setupPlayerEnemyCollision();
        
        // Companion collisions
        this.setupCompanionCollisions();
    }
    
    /**
     * Setup or re-setup player-enemy collision
     */
    setupPlayerEnemyCollision(): void {
        const { player, enemies } = gameState;
        
        if (!player || !enemies) {
            console.error('CollisionManager: Player or enemies not initialized');
            return;
        }
        
        this.playerEnemyCollider = this.scene.physics.add.collider(player, enemies, (obj1, obj2) => {
            // Type guard to identify player vs enemy
            const isEnemy = (obj: unknown): obj is Enemy => {
                return obj !== null && typeof obj === 'object' && 'health' in obj && 'enemyType' in obj;
            };
            
            let playerObj: Player;
            let enemy: Enemy;
            
            if (isEnemy(obj1)) {
                enemy = obj1;
                playerObj = obj2 as Player;
            } else if (isEnemy(obj2)) {
                enemy = obj2;
                playerObj = obj1 as Player;
            } else {
                // Could not identify enemy, skip collision
                return;
            }
            
            combatSystem.handlePlayerEnemyCollision(playerObj, enemy, this.scene.time.now);
        }, undefined, this.scene);
    }
    
    /**
     * Setup companion collision handlers
     */
    setupCompanionCollisions(): void {
        const { enemies, projectiles } = gameState;
        const companions = gameState.companions;
        
        if (!enemies || !projectiles || companions.length === 0) {
            return;
        }
        
        // For each companion, set up collisions
        companions.forEach(companion => {
            // Companion-Enemy collision (melee damage)
            this.scene.physics.add.overlap(companion, enemies, (obj1, obj2) => {
                const isEnemy = (obj: unknown): obj is Enemy => {
                    return obj !== null && typeof obj === 'object' && 'health' in obj && 'enemyType' in obj;
                };
                
                let companionObj: Companion;
                let enemy: Enemy;
                
                if (isEnemy(obj1)) {
                    enemy = obj1;
                    companionObj = obj2 as Companion;
                } else if (isEnemy(obj2)) {
                    enemy = obj2;
                    companionObj = obj1 as Companion;
                } else {
                    return;
                }
                
                // Companion damages enemy
                combatSystem.handleCompanionEnemyCollision(companionObj, enemy, this.scene.time.now);
            }, undefined, this.scene);
            
            // Companion-Enemy Projectile collision (companion takes damage)
            this.scene.physics.add.overlap(companion, projectiles, (obj1, obj2) => {
                const isProjectile = (obj: unknown): obj is Projectile => {
                    return obj !== null && typeof obj === 'object' && 'damage' in obj && 'spawnX' in obj;
                };
                
                let companionObj: Companion;
                let projectile: Projectile;
                
                if (isProjectile(obj1)) {
                    projectile = obj1;
                    companionObj = obj2 as Companion;
                } else if (isProjectile(obj2)) {
                    projectile = obj2;
                    companionObj = obj1 as Companion;
                } else {
                    return;
                }
                
                // Only enemy projectiles damage companions
                if (projectile.isEnemyProjectile) {
                    combatSystem.handleEnemyProjectileHitCompanion(projectile, companionObj, this.scene.time.now);
                }
            }, undefined, this.scene);
        });
    }
}
