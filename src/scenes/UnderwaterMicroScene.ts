/**
 * Underwater Micro Scene
 * Microscopic underwater scene with swimming micro organisms
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT, SPAWN_CONFIG } from '../config';
import spawnSystem from '../systems/SpawnSystem';
import { spawnEnemy, updateEnemyAI } from '../enemies';
import { updateProjectiles } from '../projectiles';
import { getPlayerStats, updateXPOrbMagnetism } from '../xpOrbs';
import { getSizeChangeTimer, setSizeChangeTimer } from '../player';
import gameState from '../utils/gameState';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import combatSystem from '../systems/CombatSystem';
import levelStatsTracker from '../systems/LevelStatsTracker';
import { getStaminaSystem } from '../systems/StaminaSystem';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { HUD } from '../ui/HUD';
import { DebugDisplay } from '../ui/DebugDisplay';
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import type { Enemy, Player } from '../types/game';

export default class UnderwaterMicroScene extends Phaser.Scene {
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
        super({ key: 'UnderwaterMicroScene' });
    }
    
    create() {
        // Start tracking level stats
        levelStatsTracker.startLevel(this.time.now);
        
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
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'sub_1') as Player;
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
        
        // Apply correct vehicle texture based on player level
        spawnSystem.upgradePlayerCar();
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
        const savedEnemies = gameState.savedEnemies.UnderwaterMicroScene;
        
        if (savedEnemies && savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'water_swimming_micro');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            // Generate dynamic spawn points with random density distribution
            // Water swimming micro enemies are floating enemies, so allow Y variance
            const spawnPoints = spawnSystem.generateDynamicSpawnPoints(
                SPAWN_CONFIG.defaults.baseInterval,
                SPAWN_CONFIG.defaults.microWaterY,
                true
            );
            
            // Spawn water swimming micro enemies at generated points
            spawnPoints.forEach(point => {
                if (point.isBoss) {
                    // Spawn boss water swimming micro
                    spawnEnemy(this, point.x, point.y, 'boss_water_swimming_micro');
                } else {
                    // Spawn regular water swimming micro
                    spawnEnemy(this, point.x, point.y, 'water_swimming_micro');
                }
            });
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
        
        // Update stamina system
        const staminaSystem = getStaminaSystem();
        const isMeleeActive = this.player?.isMeleeMode || false;
        staminaSystem.update(isMeleeActive, this.time.now);
        
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
                updateEnemyAI(enemy, this.time.now);
            }
        });
        
        // Update combat stun effects
        combatSystem.updateStunEffects(this.enemies, this.player, this.time.now);
        
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
        
        // Activate immunity for 2 seconds
        this.player.immuneUntil = this.time.now + 2000;
        
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
        for (let x = 300; x < WORLD_WIDTH; x += 400) {
            spawnEnemy(this, x, 680, 'water_swimming_micro');
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
        
        // End level tracking
        levelStatsTracker.endLevel(this.time.now);
        
        this.levelCompleteScreen.show();
    }
    
    handleReplay() {
        console.log('Replaying level');
        
        // Reset stats tracker for new attempt
        levelStatsTracker.reset();
        
        // Restart the current scene
        this.scene.restart();
    }
    
    handleExitToMenu() {
        console.log('Exiting to main menu');
        
        // Reset stats tracker when exiting
        levelStatsTracker.reset();
        
        // Go back to menu
        this.scene.start('MenuScene');
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.UnderwaterMicroScene = this.enemies.children.entries
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
            gameState.savedPositions.UnderwaterMicroScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
