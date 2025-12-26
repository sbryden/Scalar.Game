const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true  // Enable debug mode to see physics bodies
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const WORLD_WIDTH = 16384;
const WORLD_HEIGHT = 768;
const CAMERA_PADDING = 256; // 25% of 1024px camera width - distance from edge before clamping

const game = new Phaser.Game(config);

let player;
let cursors;
let wasdKeys;
let platforms;
let camera;
let debugText;
let enemies;
let projectiles;
let xpOrbs;

// Player stats
let playerStats = {
    level: 1,
    maxHealth: 100,
    health: 100,
    xp: 0,
    xpToLevel: 100
};

// Size system variables
let playerSize = 'normal'; // 'small', 'normal', 'large'
let sizeChangeTimer = 0;
const SIZE_CHANGE_COOLDOWN = 500; // milliseconds

const SIZE_CONFIG = {
    small: {
        scale: 0.5,
        speedMultiplier: 1.5,
        jumpMultiplier: 1.2,
        color: 0xFF6B9D // Pink
    },
    normal: {
        scale: 1.0,
        speedMultiplier: 1.0,
        jumpMultiplier: 1.0,
        color: 0x00FF00 // Green
    },
    large: {
        scale: 1.5,
        speedMultiplier: 0.7,
        jumpMultiplier: 0.8,
        color: 0xFF8C00 // Orange
    }
};

// Enemy configuration
const ENEMY_CONFIG = {
    generic: {
        width: 30,
        height: 30,
        color: 0xFF0000, // Red
        speed: 80,
        health: 20,
        damage: 10,
        xpReward: 25,
        patrolDistance: 300
    }
};

// Projectile configuration
const PROJECTILE_CONFIG = {
    basic: {
        width: 8,
        height: 8,
        color: 0xFFFF00, // Yellow
        speed: 10000,
        damage: 10,
        cooldown: 500 // milliseconds between shots
    }
};

let lastProjectileTime = 0;

function preload() {
    // Assets will be loaded here
}

function create() {
    const self = this;
    
    // Create textured background with grid pattern
    const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bgGraphics.fillStyle(0x87CEEB, 1); // Sky blue
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Draw grid lines for visual reference
    bgGraphics.lineStyle(1, 0x4DA6D6, 0.3);
    for (let i = 0; i < WORLD_WIDTH; i += 100) {
        bgGraphics.lineBetween(i, 0, i, WORLD_HEIGHT);
    }
    for (let i = 0; i < WORLD_HEIGHT; i += 100) {
        bgGraphics.lineBetween(0, i, WORLD_WIDTH, i);
    }
    bgGraphics.generateTexture('background', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    // Create textured ground with pattern
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8B7355, 1); // Brown
    groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
    
    // Draw brick pattern
    groundGraphics.fillStyle(0x6B5345, 1); // Darker brown
    for (let x = 0; x < WORLD_WIDTH; x += 50) {
        for (let y = 0; y < 50; y += 25) {
            const offset = (y === 25) ? 25 : 0;
            groundGraphics.fillRect(x + offset, y, 25, 10);
        }
    }
    groundGraphics.generateTexture('ground', WORLD_WIDTH, 50);
    groundGraphics.destroy();
    
    // Add background to scene
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'background').setOrigin(0.5, 0.5).setScrollFactor(0);
    
    // Create platforms
    platforms = this.physics.add.staticGroup();
    
    // Set physics world bounds to match map size
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Ground - position at bottom center of world, span full width
    const ground = platforms.create(WORLD_WIDTH / 2, 750, 'ground');
    ground.setOrigin(0.5, 0.5);
    ground.setScale(1).refreshBody();
    
    // Create player
    player = this.add.rectangle(100, 650, 40, 40, 0x00ff00);
    this.physics.add.existing(player);
    player.body.setBounce(0.2);
    player.body.setCollideWorldBounds(true);
    player.body.setDrag(0, 0);
    
    // Store game context on player for later use
    player.scene = this;
    
    // Collision between player and platforms
    this.physics.add.collider(player, platforms);
    
    // Create enemies group
    enemies = this.physics.add.group();
    
    // Create projectiles group
    projectiles = this.physics.add.group();
    
    // Create XP orbs group
    xpOrbs = this.physics.add.group();
    
    // Spawn initial enemies
    spawnEnemy(this, 800, 680);
    spawnEnemy(this, 1600, 680);
    spawnEnemy(this, 2400, 680);
    
    // Collision between enemies and platforms
    this.physics.add.collider(enemies, platforms);
    
    // Collision between projectiles and platforms
    this.physics.add.collider(projectiles, platforms, function(proj) {
        proj.destroy();
    });
    
    // Collision between projectiles and enemies
    this.physics.add.overlap(projectiles, enemies, function(proj, enemy) {
        damageEnemy(proj, enemy);
    });
    
    // Collision between player and enemies
    this.physics.add.overlap(player, enemies, function(p, enemy) {
        damagePlayer(enemy.damage || 10);
    });
    
    // Collision between player and XP orbs
    this.physics.add.overlap(player, xpOrbs, function(p, orb) {
        gainXP(orb.xpValue || 25);
        orb.destroy();
    });
    
    // Input
    cursors = this.input.keyboard.createCursorKeys();
    wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
    
    // Jump handler - preserve horizontal velocity when jumping
    this.input.keyboard.on('keydown-SPACE', function() {
        if (player.body.touching.down) {
            const currentVelocityX = player.body.velocity.x;
            const jumpPower = 330 * SIZE_CONFIG[playerSize].jumpMultiplier;
            player.body.setVelocityY(-jumpPower);
            player.body.setVelocityX(currentVelocityX);
        }
    });
    
    // Size change handlers
    this.input.keyboard.on('keydown-Q', function() {
        changeSize('small');
    });
    
    this.input.keyboard.on('keydown-E', function() {
        changeSize('large');
    });
    
    this.input.keyboard.on('keydown-R', function() {
        changeSize('normal');
    });
    
    // Attack handler - fire projectile
    this.input.keyboard.on('keydown-F', function() {
        fireProjectile(player.scene);
    });
    
    // Create debug text
    debugText = this.add.text(10, 10, 'X: 0', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
    });
    debugText.setScrollFactor(0); // Fixed to camera, doesn't scroll
    
    // Camera follows player but allows movement to edges
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Custom camera follow with edge behavior
    const camera = this.cameras.main;
    
    // Set camera to follow player with custom positioning
    camera.startFollow(player);
    
    // Adjust camera deadzone to allow edge movement
    camera.setLerp(0.1, 0);
    camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

function update() {
    // Update debug text with player position
    debugText.setText(`X: ${Math.round(player.x)} / ${WORLD_WIDTH} | LV: ${playerStats.level} | HP: ${playerStats.health}/${playerStats.maxHealth}`);
    
    // Update size change cooldown
    if (sizeChangeTimer > 0) {
        sizeChangeTimer -= 1000 / 60; // Subtract delta time
    }
    
    // Handle continuous movement with size multiplier
    const baseSpeed = 160;
    const speedMultiplier = SIZE_CONFIG[playerSize].speedMultiplier;
    
    // WASD or Arrow key controls
    if (wasdKeys.A.isDown || cursors.left.isDown) {
        player.body.setVelocityX(-baseSpeed * speedMultiplier);
    } else if (wasdKeys.D.isDown || cursors.right.isDown) {
        player.body.setVelocityX(baseSpeed * speedMultiplier);
    } else {
        player.body.setVelocityX(0);
    }
    
    // Update enemy AI
    enemies.children.entries.forEach(enemy => {
        if (enemy.active) {
            updateEnemyAI(enemy);
        }
    });
    
    // Destroy projectiles that go out of bounds
    projectiles.children.entries.forEach(proj => {
        if (proj.x < 0 || proj.x > WORLD_WIDTH) {
            proj.destroy();
        }
    });
    
    // Clamp camera to world bounds while allowing player to reach edges
    const camera = player.scene.cameras.main;
    
    // Position camera to keep player in the middle 50% of screen (between 25% and 75%)
    // Player target screen position is at 50% (middle)
    const targetPlayerScreenX = CAMERA_PADDING; // 25% from left edge of screen
    let targetCameraX = player.x - targetPlayerScreenX;
    
    // Clamp camera to world bounds
    targetCameraX = Phaser.Math.Clamp(targetCameraX, 0, WORLD_WIDTH - camera.width);
    
    camera.setScroll(targetCameraX, 0);
}

function changeSize(newSize) {
    // Check cooldown
    if (sizeChangeTimer > 0) {
        return; // Can't change size yet
    }
    
    // Don't change if already that size
    if (newSize === playerSize) {
        return;
    }
    
    // Get old scale before changing
    const oldScale = SIZE_CONFIG[playerSize].scale;
    const newScale = SIZE_CONFIG[newSize].scale;
    
    // Apply new size
    playerSize = newSize;
    const config = SIZE_CONFIG[newSize];
    
    // Adjust Y position to keep feet on the ground
    // Height of player (40 pixels)
    const baseHeight = 40;
    const oldHeight = baseHeight * oldScale;
    const newHeight = baseHeight * newScale;
    const heightDifference = newHeight - oldHeight;
    
    // Move player up by half the height difference to keep feet in place
    player.y -= heightDifference / 2;
    
    // Update player scale
    player.setScale(config.scale);
    
    // Update player color
    player.setFillStyle(config.color);
    
    // Refresh physics body to match new scale
    player.body.updateFromGameObject();
    
    // Scale enemies inversely (when player is small, enemies are big)
    const enemyScale = 1 / newScale;
    enemies.children.entries.forEach(enemy => {
        enemy.setScale(enemyScale);
        enemy.body.updateFromGameObject();
    });
    
    // Reset cooldown timer
    sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
}

// Enemy functions
function spawnEnemy(scene, x, y) {
    const config = ENEMY_CONFIG.generic;
    const enemy = scene.add.rectangle(x, y, config.width, config.height, config.color);
    scene.physics.add.existing(enemy);
    enemy.body.setBounce(0.2);
    enemy.body.setCollideWorldBounds(true);
    
    // Enemy-specific properties
    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.damage = config.damage;
    enemy.xpReward = config.xpReward;
    enemy.speed = config.speed;
    enemy.patrolDistance = config.patrolDistance;
    enemy.startX = x;
    enemy.direction = 1; // 1 for right, -1 for left
    enemy.hasHitBoundary = false; // Track if we've hit the boundary
    
    enemies.add(enemy);
    return enemy;
}

function updateEnemyAI(enemy) {
    // Simple patrol AI with boundary detection
    const maxDistance = enemy.patrolDistance / 2;
    const distFromStart = Math.abs(enemy.x - enemy.startX);
    
    // Change direction at patrol boundaries
    if (distFromStart > maxDistance) {
        if (!enemy.hasHitBoundary) {
            enemy.direction *= -1;
            enemy.hasHitBoundary = true;
        }
    } else {
        enemy.hasHitBoundary = false;
    }
    
    enemy.body.setVelocityX(enemy.speed * enemy.direction);
}

function fireProjectile(scene) {
    const now = Date.now();
    
    // Check cooldown
    if (now - lastProjectileTime < PROJECTILE_CONFIG.basic.cooldown) {
        return;
    }
    
    lastProjectileTime = now;
    
    const config = PROJECTILE_CONFIG.basic;
    
    // Default fire to the right, unless holding left movement key
    let direction = 1; // Default right
    if (wasdKeys.A.isDown || cursors.left.isDown) {
        direction = -1; // Fire left if holding A or left arrow
    }
    
    const velocityX = config.speed * direction;
    
    // Create projectile rectangle
    const projectile = scene.add.rectangle(
        player.x,
        player.y,
        config.width,
        config.height,
        config.color
    );
    
    // Add to physics group
    projectiles.add(projectile);
    
    // Add physics body
    scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setBounce(0, 0);
    projectile.body.setVelocity(velocityX, 0);
    projectile.damage = config.damage;
}

function damageEnemy(projectile, enemy) {
    const damage = projectile.damage || PROJECTILE_CONFIG.basic.damage;
    enemy.health -= damage;
    
    projectile.destroy();
    
    if (enemy.health <= 0) {
        // Drop XP orb
        spawnXPOrb(enemy.scene, enemy.x, enemy.y, enemy.xpReward);
        enemy.destroy();
    }
}

function spawnXPOrb(scene, x, y, xpValue) {
    const orb = scene.add.circle(x, y, 6, 0xFFD700); // Gold color
    scene.physics.add.existing(orb);
    orb.body.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-100, -50)
    );
    orb.body.setCollideWorldBounds(true);
    orb.body.setBounce(0.5, 0.5);
    orb.xpValue = xpValue;
    
    xpOrbs.add(orb);
    
    // Collision with platforms
    scene.physics.add.collider(orb, platforms);
    
    // Collision with player (collect)
    scene.physics.add.overlap(player, orb, (p, o) => {
        playerStats.xp += o.xpValue;
        o.destroy();
        checkLevelUp();
    });
}

function damagePlayer(damage) {
    playerStats.health = Math.max(0, playerStats.health - damage);
    
    if (playerStats.health <= 0) {
        console.log('Player defeated! Game Over.');
        // TODO: Implement game over screen
    }
}

function gainXP(amount) {
    playerStats.xp += amount;
    
    // Check for level up
    while (playerStats.xp >= playerStats.xpToLevel) {
        playerStats.xp -= playerStats.xpToLevel;
        playerStats.level += 1;
        
        // Increase stats on level up
        playerStats.maxHealth += 20;
        playerStats.health = playerStats.maxHealth;
        playerStats.xpToLevel = Math.floor(playerStats.xpToLevel * 1.1);
        
        console.log(`Level Up! Now level ${playerStats.level}`);
    }
}
