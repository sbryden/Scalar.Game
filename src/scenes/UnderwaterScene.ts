/**
 * Underwater Scene
 * Submarine gameplay scene with lighter gravity
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { getEnemySpawnInterval } from '../utils/difficultyHelpers';
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
import type { Enemy, Player } from '../types/game';

export default class UnderwaterScene extends Phaser.Scene {
    player!: Player;
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
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'sub_1') as Player;
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
            const spawnInterval = getEnemySpawnInterval();
            
            for (let x = 300; x < WORLD_WIDTH; x += spawnInterval) {
                const enemyType = Math.random() < 0.8 ? 'fish' : 'crab';
                spawnEnemy(this, x, enemyType === 'fish' ? 400 : 680, enemyType);
            }
            
            // Spawn boss enemy toward the end of the level
            // Randomly choose between shark boss (swimming) or crab boss (ground)
            const bossType = Math.random() < 0.5 ? 'boss_shark' : 'boss_crab';
            // Boss shark swims at mid-depth, boss crab on ground (adjusted for 3x scale)
            const bossY = bossType === 'boss_shark' ? 400 : 600;
            spawnEnemy(this, 7500, bossY, bossType);
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
        this.enemies.children.entries.forEach(obj => {
            const enemy = obj as Enemy;
            if (enemy.active) {
                updateEnemyAI(enemy);
            }
        });
        
        // Update combat stun effects
        combatSystem.updateStunEffects(this.enemies, this.player);
        
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
        const collider = this.collisionManager.playerEnemyCollider;
        if (collider) {
            this.physics.world.removeCollider(collider);
        }
        
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
            spawnEnemy(this, x, 680, 'shark');
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
        gameState.savedEnemies.UnderwaterScene = this.enemies.children.entries
            .filter(enemy => enemy.active)
            .map((enemy) => {
                const e = enemy as Enemy;
                return {
                    x: e.x,
                    y: e.y,
                    health: e.health,
                    startX: e.startX,
                    startY: e.startY,
                    direction: e.direction,
                    enemyType: e.enemyType
                };
            });
        
        // Save player position
        if (this.player) {
            gameState.savedPositions.UnderwaterScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
