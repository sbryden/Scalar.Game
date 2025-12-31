/**
 * Main Game Scene
 * Primary gameplay scene
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

export default class MainGameScene extends Phaser.Scene {
    player: any;
    platforms: any;
    enemies: any;
    projectiles: any;
    xpOrbs: any;
    hud: any;
    debugDisplay: any;
    inputManager: any;
    collisionManager: any;
    cameraManager: any;

    constructor() {
        super({ key: 'MainGameScene' });
        
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
        // Initialize difficulty if this is first time entering game
        const difficulty = this.registry.get('difficulty') || 'normal';
        if (!gameState.difficultyInitialized) {
            playerStatsSystem.initializeDifficulty(difficulty);
            gameState.difficultyInitialized = true;
        }
        
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
        // Create background
        const bgGraphics = this.make.graphics({ x: 0, y: 0 });
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
        
        this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'background')
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
    
    createGround() {
        // Create ground texture
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
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
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, 'ground');
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }
    
    createPlayer() {
        // Restore player position or use default
        const savedPos = gameState.savedPositions.MainGameScene;
        
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
        gameState.currentSceneKey = 'MainGameScene';
        gameState.spawnEnemyFunc = spawnEnemy;
    }
    
    createUI() {
        // Create HUD
        this.hud = new HUD(this);
        gameState.levelText = this.hud.levelText;
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.MainGameScene;
        
        if (savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, 'generic');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Spawn initial enemies
            for (let x = 300; x < WORLD_WIDTH; x += 300) {
                spawnEnemy(this, x, 680, 'generic');
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
        gameState.savedEnemies.MainGameScene = this.enemies.children.entries
            .filter(enemy => enemy.active)
            .map(enemy => ({
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
            gameState.savedPositions.MainGameScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
