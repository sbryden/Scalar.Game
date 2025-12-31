/**
 * Collision Manager
 * Sets up and manages all physics collisions in the game
 */
import gameState from '../utils/gameState';
import { damageEnemy } from '../enemies';
import combatSystem from '../systems/CombatSystem';

export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * Setup all collision handlers
     */
    setupCollisions() {
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
            damageEnemy(proj, enemy);
        }, null, this.scene);
        
        // Player-Enemy collision (bidirectional damage and knockback)
        this.scene.physics.add.collider(player, enemies, (p, enemy) => {
            combatSystem.handlePlayerEnemyCollision(p, enemy);
        }, null, this.scene);
    }
}
