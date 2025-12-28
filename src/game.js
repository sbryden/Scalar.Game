import { WORLD_WIDTH, WORLD_HEIGHT, CAMERA_PADDING, SIZE_CONFIG, SIZE_CHANGE_COOLDOWN, ENEMY_CONFIG, PROJECTILE_CONFIG } from './config.js';
import { changeSize, setPlayer as setPlayerPlayer, setEnemies as setEnemiesPlayer, getPlayerSize, getSizeChangeTimer, setSizeChangeTimer } from './player.js';
import { spawnEnemy, updateEnemyAI, damageEnemy, setEnemies as setEnemiesEnemies, setPlatforms as setPlatformsEnemies } from './enemies.js';
import { fireProjectile, setPlayer as setPlayerProjectiles, setProjectiles, setInputs as setInputsProjectiles, updateProjectiles } from './projectiles.js';
import { spawnXPOrb, gainXP, checkLevelUp, damagePlayer, setPlayer as setPlayerXP, setPlatforms as setPlatformsXP, setXPOrbs, setLevelText, getPlayerStats, updateXPOrbMagnetism, setScene as setSceneXP, setSpawnEnemyFunc } from './xpOrbs.js';
import { createUIElements, updateUIBars } from './ui.js';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let wasdKeys;
let platforms;
let enemies;
let projectiles;
let xpOrbs;
let debugText;
let uiElements;

function preload() {
    // Load car images for different levels
    this.load.image('car_1', './assets/car_1.png');
    this.load.image('car_2', './assets/car_2.png');
    this.load.image('car_3', './assets/car_3.png');
    this.load.image('car_4', './assets/car_4.png');
    this.load.image('car_5', './assets/car_5.png');
    // Load rockgiant enemy image
    this.load.image('enemy', './assets/rockgiant.png');
}

function create() {
    // Create background
    const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bgGraphics.fillStyle(0x87CEEB, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.lineStyle(1, 0x4DA6D6, 0.3);
    for (let i = 0; i < WORLD_WIDTH; i += 100) {
        bgGraphics.lineBetween(i, 0, i, WORLD_HEIGHT);
    }
    for (let i = 0; i < WORLD_HEIGHT; i += 100) {
        bgGraphics.lineBetween(0, i, WORLD_WIDTH, i);
    }
    bgGraphics.generateTexture('background', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    // Create ground
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8B7355, 1);
    groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
    groundGraphics.fillStyle(0x6B5345, 1);
    for (let x = 0; x < WORLD_WIDTH; x += 50) {
        for (let y = 0; y < 50; y += 25) {
            const offset = (y === 25) ? 25 : 0;
            groundGraphics.fillRect(x + offset, y, 25, 10);
        }
    }
    groundGraphics.generateTexture('ground', WORLD_WIDTH, 50);
    groundGraphics.destroy();
    
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'background').setOrigin(0.5, 0.5).setScrollFactor(0);
    
    // Create platforms
    platforms = this.physics.add.staticGroup();
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    const ground = platforms.create(WORLD_WIDTH / 2, 750, 'ground');
    ground.setOrigin(0.5, 0.5);
    ground.setScale(1).refreshBody();
    
    // Create player (car)
    player = this.add.sprite(100, 650, 'car_1');
    player.setScale(0.25);
    this.physics.add.existing(player);
    player.body.setBounce(0.2);
    player.body.setCollideWorldBounds(true);
    player.body.setDrag(0, 0);
    player.scene = this;
    
    this.physics.add.collider(player, platforms);
    
    // Create groups
    enemies = this.physics.add.group();
    projectiles = this.physics.add.group();
    xpOrbs = this.physics.add.group();
    
    // Setup module references
    setPlayerPlayer(player);
    setEnemiesPlayer(enemies);
    setPlayerProjectiles(player);
    setProjectiles(projectiles);
    setPlayerXP(player);
    setPlatformsXP(platforms);
    setXPOrbs(xpOrbs);
    setSceneXP(this);
    setSpawnEnemyFunc(spawnEnemy);
    setEnemiesEnemies(enemies);
    setPlatformsEnemies(platforms);
    
    // Create UI
    uiElements = createUIElements(this);
    setLevelText(uiElements.levelText);
    
    // Spawn initial enemies
    for (let x = 300; x < WORLD_WIDTH; x += 300) {
        spawnEnemy(this, x, 680);
    }
    
    // Collisions
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(projectiles, platforms, (proj) => proj.destroy());
    this.physics.add.collider(projectiles, enemies, (proj, enemy) => damageEnemy(proj, enemy), null, this);
    this.physics.add.overlap(player, enemies, (p, enemy) => damagePlayer(enemy.damage || 10));
    
    // Input
    cursors = this.input.keyboard.createCursorKeys();
    wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
    setInputsProjectiles(cursors, wasdKeys);
    
    // Jump
    this.input.keyboard.on('keydown-SPACE', () => {
        if (player.body.touching.down) {
            const currentVelocityX = player.body.velocity.x;
            const jumpPower = 330 * SIZE_CONFIG[getPlayerSize()].jumpMultiplier;
            player.body.setVelocityY(-jumpPower);
            player.body.setVelocityX(currentVelocityX);
        }
    });
    
    // Size changes
    this.input.keyboard.on('keydown-Q', () => changeSize('small'));
    this.input.keyboard.on('keydown-E', () => changeSize('large'));
    this.input.keyboard.on('keydown-R', () => changeSize('normal'));
    
    // Attack
    this.input.keyboard.on('keydown-F', () => fireProjectile(player.scene));
    
    // Debug text
    debugText = this.add.text(10, 10, 'X: 0', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
    });
    debugText.setScrollFactor(0);
    
    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(player);
    this.cameras.main.setLerp(0.1, 0);
}

function update() {
    const playerStats = getPlayerStats();
    
    debugText.setText(`X: ${Math.round(player.x)} / ${WORLD_WIDTH} | LV: ${playerStats.level} | HP: ${playerStats.health}/${playerStats.maxHealth} | XP: ${playerStats.xp}/${playerStats.xpToLevel}`);
    
    updateUIBars(playerStats);
    
    // Update size change cooldown
    let timer = getSizeChangeTimer();
    if (timer > 0) {
        timer -= 1000 / 60;
        setSizeChangeTimer(timer);
    }
    
    // Movement
    const baseSpeed = 160;
    const speedMultiplier = SIZE_CONFIG[getPlayerSize()].speedMultiplier;
    
    if (wasdKeys.A.isDown || cursors.left.isDown) {
        player.body.setVelocityX(-baseSpeed * speedMultiplier);
        player.setFlipX(true);  // Face left
    } else if (wasdKeys.D.isDown || cursors.right.isDown) {
        player.body.setVelocityX(baseSpeed * speedMultiplier);
        player.setFlipX(false); // Face right
    } else {
        player.body.setVelocityX(0);
    }
    
    // Update enemies
    enemies.children.entries.forEach(enemy => {
        if (enemy.active) {
            updateEnemyAI(enemy);
        }
    });
    
    // Update projectiles
    updateProjectiles();
    
    // Update XP orb magnetism
    updateXPOrbMagnetism();
    
    // Update camera
    const camera = player.scene.cameras.main;
    const targetPlayerScreenX = CAMERA_PADDING;
    let targetCameraX = player.x - targetPlayerScreenX;
    targetCameraX = Phaser.Math.Clamp(targetCameraX, 0, WORLD_WIDTH - camera.width);
    camera.setScroll(targetCameraX, 0);
}
