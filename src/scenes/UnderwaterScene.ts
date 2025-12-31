/**
 * Underwater Scene
 * Submarine gameplay scene with lighter gravity
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { spawnEnemy, updateEnemyAI } from '../enemies';
import { updateProjectiles } from '../projectiles';
import { getPlayerStats, updateXPOrbMagnetism } from '../xpOrbs';
import { getSizeChangeTimer, setSizeChangeTimer } from '../player';
import gameState from '../utils/gameState';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import combatSystem from '../systems/CombatSystem';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { HUD } from '../ui/HUD';
import { DebugDisplay } from '../ui/DebugDisplay';
import type { Enemy } from '../types/game';

export default class UnderwaterScene extends Phaser.Scene {
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
        super({ key: 'UnderwaterScene' });
    }
    
    create() {
        // Initialize difficulty if this is first time entering game
        const difficulty = this.registry.get('difficulty') || 'normal';
        if (!gameState.difficultyInitialized) {
            playerStatsSystem.initializeDifficulty(difficulty);
            gameState.difficultyInitialized = true;
        }
        
        // Set lighter gravity for underwater (1/3 of normal)
        this.physics.world.gravity.y = 100;
        
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
        // Create underwater background with blue tones
        const bgGraphics = this.make.graphics({ x: 0, y: 0 });
        
        // Deep blue water gradient
        bgGraphics.fillGradientStyle(0x0A3D62, 0x0A3D62, 0x1B6CA8, 0x1B6CA8, 1);
        bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        
        // Add light rays from above
        bgGraphics.lineStyle(40, 0x2E86AB, 0.15);
        for (let i = 0; i < WORLD_WIDTH; i += 200) {
            bgGraphics.lineBetween(i, 0, i + 100, WORLD_HEIGHT);
        }
        
        // Add kelp decorations
        bgGraphics.lineStyle(8, 0x1B4D3E, 0.6);
        for (let x = 100; x < WORLD_WIDTH; x += 300) {
            // Draw wavy kelp
            bgGraphics.beginPath();
            bgGraphics.moveTo(x, WORLD_HEIGHT - 50);
            for (let y = WORLD_HEIGHT - 50; y > 200; y -= 20) {
                const wave = Math.sin(y / 30) * 15;
                bgGraphics.lineTo(x + wave, y);
            }
            bgGraphics.strokePath();
        }
        
        // Add coral decorations
        bgGraphics.fillStyle(0xE63946, 0.4);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = WORLD_HEIGHT - 100 + Math.random() * 50;
            const size = 20 + Math.random() * 30;
            // Draw coral-like shapes
            bgGraphics.fillCircle(x, y, size);
            bgGraphics.fillCircle(x - size/2, y - size/2, size * 0.7);
            bgGraphics.fillCircle(x + size/2, y - size/2, size * 0.7);
        }
        
        // Add small bubbles
        bgGraphics.fillStyle(0xFFFFFF, 0.3);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * WORLD_HEIGHT;
            const radius = 3 + Math.random() * 5;
            bgGraphics.fillCircle(x, y, radius);
        }
        
        bgGraphics.generateTexture('underwaterBackground', WORLD_WIDTH, WORLD_HEIGHT);
        bgGraphics.destroy();
        
        this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'underwaterBackground')
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
    
    createGround() {
        // Create sandy ocean floor
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        
        // Sandy base color
        groundGraphics.fillStyle(0xC2A878, 1);
        groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
        
        // Add sand texture
        groundGraphics.fillStyle(0xD4B896, 1);
        for (let x = 0; x < WORLD_WIDTH; x += 10) {
            for (let y = 0; y < 50; y += 10) {
                if (Math.random() > 0.5) {
                    groundGraphics.fillCircle(x + Math.random() * 5, y + Math.random() * 5, 2);
                }
            }
        }
        
        // Add small rocks
        groundGraphics.fillStyle(0x8B7355, 1);
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * 50;
            const size = 3 + Math.random() * 8;
            groundGraphics.fillCircle(x, y, size);
        }
        
        groundGraphics.generateTexture('underwaterGround', WORLD_WIDTH, 50);
        groundGraphics.destroy();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, 'underwaterGround');
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }
    
    createPlayer() {
        // Restore player position or use default
        const savedPos = gameState.savedPositions.UnderwaterScene;
        
        // Create player (submarine)
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'sub_1');
        this.player.setScale(0.25);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        // Add water drag for underwater feel
        this.player.setDrag(50, 50);
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
        gameState.currentSceneKey = 'UnderwaterScene';
        gameState.spawnEnemyFunc = spawnEnemy;
    }
    
    createUI() {
        // Create HUD
        this.hud = new HUD(this);
        gameState.levelText = this.hud.levelText;
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.UnderwaterScene;
        
        if (savedEnemies && savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'fish');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Spawn initial underwater enemies (80% fish, 20% crabs)
            for (let x = 300; x < WORLD_WIDTH; x += 300) {
                const enemyType = Math.random() < 0.8 ? 'fish' : 'crab';
                spawnEnemy(this, x, enemyType === 'fish' ? 400 : 680, enemyType);
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
        // Create debug display (only enabled in development)
        this.debugDisplay = new DebugDisplay(this);
    }
    
    update() {
        const playerStats = getPlayerStats();
        
        // Update debug display (only if enabled)
        if (this.debugDisplay?.enabled) {
            this.debugDisplay.update(this.player.x, playerStats);
        }
        
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
        gameState.savedEnemies.UnderwaterScene = this.enemies.children.entries
            .filter(enemy => enemy.active)
            .map((enemy: Enemy) => ({
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
            gameState.savedPositions.UnderwaterScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
