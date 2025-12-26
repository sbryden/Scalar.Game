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
    debugText.setText(`X: ${Math.round(player.x)} / ${WORLD_WIDTH}`);
    
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
    
    // Reset cooldown timer
    sizeChangeTimer = SIZE_CHANGE_COOLDOWN;
}
