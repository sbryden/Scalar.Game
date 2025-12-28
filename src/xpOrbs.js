import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config.js';
import gameState from './utils/gameState.js';
import playerStatsSystem from './systems/PlayerStatsSystem.js';

const MAGNETISM_RANGE = 150; // Distance to start pulling orbs
const MAGNETISM_SPEED = 250; // Speed to pull orbs

export function getPlayerStats() { return playerStatsSystem.getStats(); }
export function updatePlayerStats(stats) { playerStatsSystem.setStats(stats); }

export function spawnXPOrb(scene, x, y, xpValue) {
    const orb = scene.add.circle(x, y, 6, 0xFFD700);
    scene.physics.add.existing(orb);
    orb.body.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-100, -50)
    );
    orb.body.setCollideWorldBounds(true);
    orb.body.setBounce(0.5, 0.5);
    orb.xpValue = xpValue;
    
    gameState.xpOrbs.add(orb);
    scene.physics.add.collider(orb, gameState.platforms);
    scene.physics.add.overlap(gameState.player, orb, (p, o) => {
        gainXP(o.xpValue || 25);
        o.destroy();
    });
}

export function updateXPOrbMagnetism() {
    if (!gameState.player) return;
    
    gameState.xpOrbs.children.entries.forEach(orb => {
        const distance = Phaser.Math.Distance.Between(gameState.player.x, gameState.player.y, orb.x, orb.y);
        
        if (distance < MAGNETISM_RANGE) {
            const angle = Phaser.Math.Angle.Between(orb.x, orb.y, gameState.player.x, gameState.player.y);
            orb.body.setVelocity(
                Math.cos(angle) * MAGNETISM_SPEED,
                Math.sin(angle) * MAGNETISM_SPEED
            );
        }
    });
}

export function gainXP(amount) {
    playerStatsSystem.gainXP(amount);
    upgradePlayerCar(); // Check if we need to upgrade after level up
}

export function checkLevelUp() {
    // Deprecated - now handled by PlayerStatsSystem
    // Kept for backwards compatibility but does nothing
}

export function upgradePlayerCar() {
    if (!gameState.player) return;
    
    const stats = playerStatsSystem.getStats();
    
    // Cars are car_1 through car_5 (levels 1-5)
    const carLevel = Math.min(stats.level, 5);
    const carTexture = `car_${carLevel}`;
    
    gameState.player.setTexture(carTexture);
    
    // Spawn additional enemies based on level
    if (gameState.spawnEnemyFunc && gameState.scene) {
        const enemiesToSpawn = Math.min(stats.level - 1, 3); // Spawn 0-3 additional enemies
        const spawnOffsets = [300, 800, 1600];
        
        for (let i = 0; i < enemiesToSpawn; i++) {
            const xOffset = spawnOffsets[i];
            const spawnX = gameState.player.x + xOffset;
            gameState.spawnEnemyFunc(gameState.scene, spawnX, 680);
        }
    }
}

export function damagePlayer(damage) {
    playerStatsSystem.takeDamage(damage);
}
