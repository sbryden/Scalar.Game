import { PROJECTILE_CONFIG, ENEMY_CONFIG } from './config.js';

let player;
let platforms;
let xpOrbs;
let levelText;
let scene;
let spawnEnemyFunc;
const MAGNETISM_RANGE = 150; // Distance to start pulling orbs
const MAGNETISM_SPEED = 250; // Speed to pull orbs

let playerStats = {
    level: 1,
    maxHealth: 100,
    health: 100,
    xp: 0,
    xpToLevel: 100
};

export function setPlayer(p) { player = p; }
export function setPlatforms(pl) { platforms = pl; }
export function setXPOrbs(x) { xpOrbs = x; }
export function setLevelText(lt) { levelText = lt; }
export function setScene(s) { scene = s; }
export function setSpawnEnemyFunc(func) { spawnEnemyFunc = func; }
export function getPlayerStats() { return playerStats; }
export function updatePlayerStats(stats) { playerStats = stats; }

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
    
    xpOrbs.add(orb);
    scene.physics.add.collider(orb, platforms);
    scene.physics.add.overlap(player, orb, (p, o) => {
        gainXP(o.xpValue || 25);
        o.destroy();
    });
}

export function updateXPOrbMagnetism() {
    if (!player) return;
    
    xpOrbs.children.entries.forEach(orb => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, orb.x, orb.y);
        
        if (distance < MAGNETISM_RANGE) {
            const angle = Phaser.Math.Angle.Between(orb.x, orb.y, player.x, player.y);
            orb.body.setVelocity(
                Math.cos(angle) * MAGNETISM_SPEED,
                Math.sin(angle) * MAGNETISM_SPEED
            );
        }
    });
}

export function gainXP(amount) {
    playerStats.xp += amount;
    checkLevelUp();
}

export function checkLevelUp() {
    while (playerStats.xp >= playerStats.xpToLevel) {
        playerStats.xp -= playerStats.xpToLevel;
        playerStats.level += 1;
        playerStats.maxHealth += 20;
        playerStats.health = playerStats.maxHealth;
        playerStats.xpToLevel = Math.floor(playerStats.xpToLevel * 1.1);
        
        // Upgrade car sprite based on level
        upgradePlayerCar();
        
        if (levelText) {
            levelText.setText(`LEVEL ${playerStats.level}`);
        }
        
        console.log(`Level Up! Now level ${playerStats.level}`);
    }
}

export function upgradePlayerCar() {
    if (!player) return;
    
    // Cars are car_1 through car_5 (levels 1-5)
    const carLevel = Math.min(playerStats.level, 5);
    const carTexture = `car_${carLevel}`;
    
    player.setTexture(carTexture);
    
    // Spawn additional enemies based on level
    if (spawnEnemyFunc && scene) {
        const enemiesToSpawn = Math.min(playerStats.level - 1, 3); // Spawn 0-3 additional enemies
        const spawnOffsets = [300, 800, 1600];
        
        for (let i = 0; i < enemiesToSpawn; i++) {
            const xOffset = spawnOffsets[i];
            const spawnX = player.x + xOffset;
            spawnEnemyFunc(scene, spawnX, 680);
        }
    }
}

export function damagePlayer(damage) {
    playerStats.health = Math.max(0, playerStats.health - damage);
    
    if (playerStats.health <= 0) {
        console.log('Player defeated! Game Over.');
    }
}
