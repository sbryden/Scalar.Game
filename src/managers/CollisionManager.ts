/**
 * Collision Manager
 * Sets up and manages all physics collisions in the game
 */
import gameState from '../utils/gameState';
import { damageEnemy } from '../enemies';
import combatSystem from '../systems/CombatSystem';
import type { Player, Enemy, Projectile } from '../types/game';

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
        
        // Projectile collisions
        this.scene.physics.add.collider(projectiles, platforms, (proj) => {
            proj.destroy();
        });
        
        this.scene.physics.add.collider(projectiles, enemies, (proj, enemy) => {
            damageEnemy(proj as Projectile, enemy as Enemy);
        }, undefined, this.scene);
        
        // Player-Enemy collision (bidirectional damage and knockback)
        this.setupPlayerEnemyCollision();
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
        
        this.playerEnemyCollider = this.scene.physics.add.collider(player, enemies, (p, enemy) => {
            combatSystem.handlePlayerEnemyCollision(p as Player, enemy as Enemy);
        }, undefined, this.scene);
    }
}
