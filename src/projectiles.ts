import { PROJECTILE_CONFIG, WORLD_WIDTH } from './config';
import gameState from './utils/gameState';
import playerStatsSystem from './systems/PlayerStatsSystem';
import type { WASDKeys, Projectile } from './types/game';

class ProjectileManager {
    private lastProjectileTime: number = 0;

    setInputs(c: Phaser.Types.Input.Keyboard.CursorKeys, w: WASDKeys): void { 
        gameState.cursors = c; 
        gameState.wasdKeys = w; 
    }

    fireProjectile(scene: Phaser.Scene): void {
        const now = Date.now();
        
        if (now - this.lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
            return;
        }
        
        this.lastProjectileTime = now;
        
        const config = PROJECTILE_CONFIG.basic;
        
        let direction = 1;
        if (gameState.wasdKeys?.A.isDown || gameState.cursors?.left.isDown) {
            direction = -1;
        }
        
        // Check if underwater for slower projectile speed
        const isUnderwater = gameState.currentSceneKey === 'UnderwaterScene' || 
                            gameState.currentSceneKey === 'UnderwaterMicroScene';
        const speedMultiplier = isUnderwater ? 0.5 : 1.0; // Half speed underwater
        
        const velocityX = config.speed * direction * speedMultiplier;
        
        const player = gameState.player;
        if (!player) return;
        
        // Offset projectile spawn behind the vehicle (opposite of direction)
        const spawnOffsetX = direction === 1 ? 40 : -40;
        const projectileX = player.x + spawnOffsetX;
        
        // Projectile spawns at 1/6 height of tank (1/6 from top)
        const tankHeight = player.displayHeight;
        const projectileY = player.y - tankHeight / 2 + (1 / 6) * tankHeight;
        
        // Create projectile (torpedo underwater, beam on land)
        const projectileTexture = isUnderwater ? 'torpedo' : 'beam';
        const projectile = scene.add.image(projectileX, projectileY, projectileTexture) as Projectile;
        projectile.setOrigin(0.5, 0.5);
        projectile.setDepth(0);
        
        // Scale projectile based on player scale
        const playerScale = player.scaleX;
        projectile.setScale(playerScale);
        
        // Flip the image if firing left
        if (direction === -1) {
            projectile.setFlipX(true);
        }
        
        gameState.projectiles?.add(projectile);
        scene.physics.add.existing(projectile);
        
        // Type assertion since we know projectile.body is an Arcade Body after physics.add.existing
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setBounce(0, 0);
        body.setCollideWorldBounds(true);
        body.setVelocity(velocityX, 0);
        
        // Set damage (1000 in god mode, normal otherwise)
        projectile.damage = playerStatsSystem.isGodMode() ? 1000 : config.damage;
        
        // Track projectile spawn position and max range (1.5x screen width)
        projectile.spawnX = projectileX;
        projectile.maxRange = 1024 * 1.5; // 1.5x screen width
    }

    updateProjectiles(): void {
        const projectiles = gameState.projectiles;
        if (!projectiles) return;
        
        projectiles.children.entries.forEach(proj => {
            const projectile = proj as Projectile;
            // Destroy projectile if it exceeds max range or goes off world
            const distanceTraveled = Math.abs(projectile.x - projectile.spawnX);
            if (distanceTraveled > projectile.maxRange || projectile.x < 0 || projectile.x > WORLD_WIDTH) {
                projectile.destroy();
            }
        });
    }
}

// Export singleton instance
const projectileManager = new ProjectileManager();
export default projectileManager;
