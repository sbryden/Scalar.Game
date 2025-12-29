/**
 * Micro Scene
 * Cellular-level gameplay scene with bacteria enemies
 */
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config.js';
import { spawnEnemy, updateEnemyAI } from '../enemies.js';
import { updateProjectiles } from '../projectiles.js';
import { getPlayerStats, updateXPOrbMagnetism } from '../xpOrbs.js';
import { getSizeChangeTimer, setSizeChangeTimer } from '../player.js';
import gameState from '../utils/gameState.js';
import { InputManager } from '../managers/InputManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { CameraManager } from '../managers/CameraManager.js';
import { HUD } from '../ui/HUD.js';
import { DebugDisplay } from '../ui/DebugDisplay.js';

export default class MicroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MicroScene' });
        
        // Scene variables
        this.player = null;
        this.platforms = null;
        this.enemies = null;
        this.projectiles = null;
        this.xpOrbs = null;
        this.hud = null;
        this.debugDisplay = null;
        
        // Managers
        this.inputManager = null;
        this.collisionManager = null;
        this.cameraManager = null;
    }
    
    create() {
        // Set reduced gravity for micro scene (half of normal)
        this.physics.world.gravity.y = 150;
        
        this.createBackground();
        this.createGround();
        this.createPlayer();
        this.createGroups();
        this.initializeGameState();
        this.createUI();
        this.restoreOrSpawnEnemies();
        this.setupManagers();
        this.createDebugText();
    }
    
    createBackground() {
        // Create cellular-themed background (purple/pink tones)
        const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Base cellular fluid color
        bgGraphics.fillStyle(0x2D1B3D, 1);
        bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        
        // Add cellular membrane-like patterns
        bgGraphics.lineStyle(2, 0x5A3D6B, 0.4);
        for (let i = 0; i < WORLD_WIDTH; i += 150) {
            for (let j = 0; j < WORLD_HEIGHT; j += 150) {
                // Draw cellular circles
                const offsetX = (j / 150) % 2 === 0 ? 75 : 0;
                bgGraphics.strokeCircle(i + offsetX, j, 60);
            }
        }
        
        // Add organic looking dots (organelles)
        bgGraphics.fillStyle(0x8B4F8B, 0.3);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            const radius = 10 + Math.random() * 20;
            bgGraphics.fillCircle(x, y, radius);
        }
        
        bgGraphics.generateTexture('microBackground', WORLD_WIDTH, WORLD_HEIGHT);
        bgGraphics.destroy();
        
        this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'microBackground')
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
    
    createGround() {
        // Create cellular membrane-like ground
        const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Base membrane color
        groundGraphics.fillStyle(0x4A2D5A, 1);
        groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
        
        // Add membrane texture
        groundGraphics.fillStyle(0x5A3D6A, 1);
        for (let x = 0; x < WORLD_WIDTH; x += 40) {
            for (let y = 0; y < 50; y += 20) {
                const offset = (y === 20) ? 20 : 0;
                groundGraphics.fillCircle(x + offset + 10, y + 10, 8);
            }
        }
        
        groundGraphics.generateTexture('microGround', WORLD_WIDTH, 50);
        groundGraphics.destroy();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, 'microGround');
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }
    
    createPlayer() {
        // Restore player position or use default
        const savedPos = gameState.savedPositions.MicroScene;
        
        // Create player (car)
        this.player = this.add.sprite(savedPos.x, savedPos.y, 'car_1');
        this.player.setScale(0.25);
        this.physics.add.existing(this.player);
        this.player.body.setBounce(0.2);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setDrag(0, 0);
        this.player.scene = this;
        
        this.physics.add.collider(this.player, this.platforms);
    }
    
    createGroups() {
        // Create groups
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.xpOrbs = this.physics.add.group();
    }
    
    initializeGameState() {
        // Initialize gameState with all game objects
        gameState.player = this.player;
        gameState.enemies = this.enemies;
        gameState.projectiles = this.projectiles;
        gameState.xpOrbs = this.xpOrbs;
        gameState.platforms = this.platforms;
        gameState.scene = this;
        gameState.currentSceneKey = 'MicroScene';
        gameState.spawnEnemyFunc = spawnEnemy;
    }
    
    createUI() {
        // Create HUD
        this.hud = new HUD(this);
        gameState.levelText = this.hud.levelText;
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.MicroScene;
        
        if (savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, 'micro');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Spawn initial bacteria enemies
            for (let x = 300; x < WORLD_WIDTH; x += 300) {
                spawnEnemy(this, x, 680, 'micro');
            }
        }
    }
    
    setupManagers() {
        // Setup managers
        this.inputManager = new InputManager(this);
        this.inputManager.setupInput();
        
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.setupCollisions();
        
        this.cameraManager = new CameraManager(this);
        this.cameraManager.setupCamera();
    }
    
    createDebugText() {
        // Create debug display
        this.debugDisplay = new DebugDisplay(this);
    }
    
    update() {
        const playerStats = getPlayerStats();
        
        // Update debug display
        this.debugDisplay.update(this.player.x, playerStats);
        
        // Update HUD
        this.hud.update(playerStats);
        
        // Update size change cooldown
        let timer = getSizeChangeTimer();
        if (timer > 0) {
            timer -= 1000 / 60;
            setSizeChangeTimer(timer);
        }
        
        // Handle player movement
        this.inputManager.handleMovement();
        
        // Update enemies (bacteria)
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                updateEnemyAI(enemy);
            }
        });
        
        // Update projectiles
        updateProjectiles();
        
        // Update XP orb magnetism
        updateXPOrbMagnetism();
        
        // Update camera
        this.cameraManager.update();
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.MicroScene = this.enemies.children.entries
            .filter(enemy => enemy.active)
            .map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                health: enemy.health,
                startX: enemy.startX,
                direction: enemy.direction
            }));
        
        // Save player position
        if (this.player) {
            gameState.savedPositions.MicroScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
