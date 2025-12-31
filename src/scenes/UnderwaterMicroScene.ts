/**
 * Underwater Micro Scene
 * Microscopic underwater scene with plankton and microorganisms
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { spawnEnemy, updateEnemyAI } from '../enemies';
import { updateProjectiles } from '../projectiles';
import { getPlayerStats, updateXPOrbMagnetism } from '../xpOrbs';
import { getSizeChangeTimer, setSizeChangeTimer } from '../player';
import gameState from '../utils/gameState';
import combatSystem from '../systems/CombatSystem';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { HUD } from '../ui/HUD';
import { DebugDisplay } from '../ui/DebugDisplay';

export default class UnderwaterMicroScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    enemies!: Phaser.Physics.Arcade.Group;
    projectiles!: Phaser.Physics.Arcade.Group;
    xpOrbs!: Phaser.Physics.Arcade.Group;
    hud!: HUD;
    debugDisplay!: DebugDisplay;
    inputManager!: InputManager;
    collisionManager!: CollisionManager;
    cameraManager!: CameraManager;

    constructor() {
        super({ key: 'UnderwaterMicroScene' });
        
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
        // Set very light gravity for micro underwater (half of underwater)
        this.physics.world.gravity.y = 50;
        
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
        // Create microscopic underwater background (blue-green with plankton)
        const bgGraphics = this.make.graphics({ x: 0, y: 0 });
        
        // Deep blue-green water
        bgGraphics.fillGradientStyle(0x0B5563, 0x0B5563, 0x0E7490, 0x0E7490, 1);
        bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        
        // Add light diffusion patterns
        bgGraphics.lineStyle(30, 0x06B6D4, 0.1);
        for (let i = 0; i < WORLD_WIDTH; i += 180) {
            bgGraphics.lineBetween(i, 0, i + 80, WORLD_HEIGHT);
        }
        
        // Add plankton (small organic shapes)
        bgGraphics.fillStyle(0x22D3EE, 0.3);
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            const size = 8 + Math.random() * 15;
            // Draw plankton-like shapes
            bgGraphics.fillCircle(x, y, size);
            bgGraphics.fillCircle(x - size/3, y + size/3, size * 0.5);
            bgGraphics.fillCircle(x + size/3, y + size/3, size * 0.5);
        }
        
        // Add microorganism clusters
        bgGraphics.fillStyle(0x34D399, 0.25);
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            const clusterSize = 3 + Math.floor(Math.random() * 5);
            for (let j = 0; j < clusterSize; j++) {
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 40;
                bgGraphics.fillCircle(x + offsetX, y + offsetY, 5 + Math.random() * 8);
            }
        }
        
        // Add small particles
        bgGraphics.fillStyle(0xA7F3D0, 0.4);
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            bgGraphics.fillCircle(x, y, 2 + Math.random() * 3);
        }
        
        bgGraphics.generateTexture('underwaterMicroBackground', WORLD_WIDTH, WORLD_HEIGHT);
        bgGraphics.destroy();
        
        this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'underwaterMicroBackground')
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
    
    createGround() {
        // Create microscopic membrane-like ground
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        
        // Base membrane color (blue-green)
        groundGraphics.fillStyle(0x065F46, 1);
        groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
        
        // Add organic membrane texture
        groundGraphics.fillStyle(0x047857, 1);
        for (let x = 0; x < WORLD_WIDTH; x += 35) {
            for (let y = 0; y < 50; y += 18) {
                const offset = (y === 18) ? 18 : 0;
                groundGraphics.fillCircle(x + offset + 8, y + 8, 6);
            }
        }
        
        // Add micro-particles on ground
        groundGraphics.fillStyle(0x10B981, 0.5);
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * 50;
            groundGraphics.fillCircle(x, y, 2 + Math.random() * 4);
        }
        
        groundGraphics.generateTexture('underwaterMicroGround', WORLD_WIDTH, 50);
        groundGraphics.destroy();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, 'underwaterMicroGround');
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }
    
    createPlayer() {
        // Restore player position or use default
        const savedPos = gameState.savedPositions.UnderwaterMicroScene;
        
        // Create player (smaller submarine)
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'sub_1');
        this.player.setScale(0.15);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        // More drag for micro environment
        this.player.setDrag(70, 70);
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
        gameState.currentSceneKey = 'UnderwaterMicroScene';
        gameState.spawnEnemyFunc = spawnEnemy;
    }
    
    createUI() {
        // Create HUD
        this.hud = new HUD(this);
        gameState.levelText = this.hud.levelText;
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.UnderwaterMicroScene;
        
        if (savedEnemies && savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'plankton');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Spawn initial micro enemies (all floating plankton-like)
            for (let x = 300; x < WORLD_WIDTH; x += 300) {
                spawnEnemy(this, x, 300 + Math.random() * 200, 'plankton');
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
        
        // Update enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                updateEnemyAI(enemy);
            }
        });
        
        // Update combat stun effects
        combatSystem.updateStunEffects(this.enemies.children.entries, this.player);
        
        // Update projectiles
        updateProjectiles();
        
        // Update XP orb magnetism
        updateXPOrbMagnetism();
        
        // Update camera
        this.cameraManager.update();
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.UnderwaterMicroScene = this.enemies.children.entries
            .filter(enemy => enemy.active)
            .map((enemy: any) => ({
                x: enemy.x,
                y: enemy.y,
                health: enemy.health,
                startX: enemy.startX,
                startY: enemy.startY,
                direction: enemy.direction,
                enemyType: enemy.enemyType
            }));
        
        // Save player position
        if (this.player) {
            gameState.savedPositions.UnderwaterMicroScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
