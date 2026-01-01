/**
 * Main Game Scene
 * Primary gameplay scene
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT, HARD_MODE_CONFIG } from '../config';
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
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import type { Enemy } from '../types/game';

export default class MainGameScene extends Phaser.Scene {
    player!: Phaser.Physics.Arcade.Sprite;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    enemies!: Phaser.Physics.Arcade.Group;
    projectiles!: Phaser.Physics.Arcade.Group;
    xpOrbs!: Phaser.Physics.Arcade.Group;
    hud!: HUD;
    debugDisplay!: DebugDisplay;
    gameOverScreen!: GameOverScreen;
    levelCompleteScreen!: LevelCompleteScreen;
    inputManager!: InputManager;
    collisionManager!: CollisionManager;
    cameraManager!: CameraManager;

    constructor() {
        super({ key: 'MainGameScene' });
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
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'car_1');
        this.player.setScale(0.25);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(0, 0);
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
        
        // Create Game Over Screen
        this.gameOverScreen = new GameOverScreen(this);
        this.gameOverScreen.create();
        
        // Set up game over callback
        playerStatsSystem.setGameOverCallback(() => {
            this.handleGameOver();
        });
        
        // Set up continue and quit callbacks
        this.gameOverScreen.setContinueCallback(() => {
            this.handleContinue();
        });
        
        this.gameOverScreen.setQuitCallback(() => {
            this.handleQuit();
        });
        
        // Create Level Complete Screen
        this.levelCompleteScreen = new LevelCompleteScreen(this);
        this.levelCompleteScreen.create();
        
        // Set up boss defeat callback
        combatSystem.setBossDefeatCallback(() => {
            this.handleLevelComplete();
        });
        
        // Set up replay and exit callbacks
        this.levelCompleteScreen.setReplayCallback(() => {
            this.handleReplay();
        });
        
        this.levelCompleteScreen.setExitCallback(() => {
            this.handleExitToMenu();
        });
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.MainGameScene;
        
        if (savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'generic');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Spawn initial enemies
            // Calculate spawn interval based on difficulty
            const isHardMode = playerStatsSystem.difficulty === 'hard';
            const spawnInterval = isHardMode ? 300 / HARD_MODE_CONFIG.enemySpawnMultiplier : 300;
            
            for (let x = 300; x < WORLD_WIDTH; x += spawnInterval) {
                spawnEnemy(this, x, 680, 'generic');
            }
            
            // Spawn boss enemy toward the end of the level
            spawnEnemy(this, 7500, 680, 'boss_generic');
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
    
    handleGameOver() {
        console.log('Game Over - Showing screen...');
        this.gameOverScreen.show();
    }
    
    startImmunityFlash(player: Phaser.Physics.Arcade.Sprite): void {
        let flashCount = 0;
        const maxFlashes = 20; // Flash 20 times over 2 seconds (10 on/off cycles)
        
        const flashTimer = this.time.addEvent({
            delay: 100, // Flash every 100ms
            callback: () => {
                flashCount++;
                if (flashCount % 2 === 0) {
                    player.setAlpha(1);
                } else {
                    player.setAlpha(0.3);
                }
                
                if (flashCount >= maxFlashes) {
                    player.setAlpha(1); // Ensure fully visible at end
                    flashTimer.destroy();
                }
            },
            loop: true
        });
    }
    
    handleContinue() {
        console.log('Player chose to continue');
        
        // Reset player stats
        playerStatsSystem.reset();
        
        // Reset player position
        this.player.setPosition(400, 100);
        this.player.setVelocity(0, 0);
        
        // Clear player tint if any
        this.player.clearTint();
        
        // Activate immunity for 4 seconds
        const now = Date.now();
        this.player.immuneUntil = now + 4000;
        
        // Start flashing effect
        this.startImmunityFlash(this.player);
        
        // Disable collisions with enemies temporarily
        this.physics.world.removeCollider(this.collisionManager.playerEnemyCollider);
        
        // Re-enable collisions after immunity ends
        this.time.delayedCall(2000, () => {
            this.collisionManager.setupPlayerEnemyCollision();
        });
        
        // Clear all enemies and their health bars
        this.enemies.children.entries.forEach((enemy: any) => {
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        });
        this.enemies.clear(true, true);
        
        // Clear all projectiles and XP orbs
        this.projectiles.clear(true, true);
        this.xpOrbs.clear(true, true);
        
        // Spawn new enemies
        for (let x = 300; x < WORLD_WIDTH; x += 300) {
            spawnEnemy(this, x, 680, 'generic');
        }
        
        // Update HUD
        this.hud.update(playerStatsSystem.getStats());
    }
    
    handleQuit() {
        console.log('Player chose to quit');
        
        // Reset player stats
        playerStatsSystem.reset();
        
        // Go back to menu
        this.scene.start('MenuScene');
    }
    
    handleLevelComplete() {
        console.log('Level Complete - Boss Defeated!');
        this.levelCompleteScreen.show();
    }
    
    handleReplay() {
        console.log('Replaying level');
        
        // Restart the current scene
        this.scene.restart();
    }
    
    handleExitToMenu() {
        console.log('Exiting to main menu');
        
        // Go back to menu
        this.scene.start('MenuScene');
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.MainGameScene = this.enemies.children.entries
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
            gameState.savedPositions.MainGameScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
