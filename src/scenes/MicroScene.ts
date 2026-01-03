/**
 * Micro Scene
 * Cellular-level gameplay scene with bacteria enemies
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT, SPAWN_CONFIG, BOSS_MODE_CONFIG } from '../config';
import spawnSystem from '../systems/SpawnSystem';
import { spawnEnemy, updateEnemyAI } from '../enemies';
import projectileManager from '../managers/ProjectileManager';
import xpOrbManager from '../managers/XPOrbManager';
import { getSizeChangeTimer, setSizeChangeTimer } from '../player';
import gameState from '../utils/gameState';
import playerStatsSystem from '../systems/PlayerStatsSystem';
import combatSystem from '../systems/CombatSystem';
import levelStatsTracker from '../systems/LevelStatsTracker';
import levelProgressionSystem from '../systems/LevelProgressionSystem';
import { getStaminaSystem } from '../systems/StaminaSystem';
import { getFuelSystem } from '../systems/FuelSystem';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { HUD } from '../ui/HUD';
import { DebugDisplay } from '../ui/DebugDisplay';
import { GameOverScreen } from '../ui/GameOverScreen';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import type { Enemy, Player } from '../types/game';

export default class MicroScene extends Phaser.Scene {
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
        super({ key: 'MicroScene' });
    }
    
    create() {
        // Reset spawner boss tracking
        combatSystem.resetSpawnerTracking();
        
        // Start tracking level stats
        levelStatsTracker.startLevel(this.time.now);
        
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
        const bgGraphics = this.make.graphics({ x: 0, y: 0 });
        
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
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        
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
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'car_1') as Player;
        this.player.setScale(0.15);
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
        gameState.currentSceneKey = 'MicroScene';
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
        
        // Set up next level, replay and exit callbacks
        this.levelCompleteScreen.setNextLevelCallback(() => {
            this.handleNextLevel();
        });
        
        this.levelCompleteScreen.setReplayCallback(() => {
            this.handleReplay();
        });
        
        this.levelCompleteScreen.setExitCallback(() => {
            this.handleExitToMenu();
        });
    }
    
    restoreOrSpawnEnemies() {
        // Check if we have saved enemies for this scene
        const savedEnemies = gameState.savedEnemies.MicroScene;

        // Check if boss mode is active
        const bossMode = this.registry.get('bossMode') === true;
        
        if (savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'micro');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
                enemy.floatAngle = enemyData.floatAngle || 0;
            });
        } else {
            // Generate dynamic spawn points with randomized density distribution
            // Micro enemies can swim, so allow Y variance
            const spawnPoints = spawnSystem.generateDynamicSpawnPoints(
                SPAWN_CONFIG.defaults.baseInterval,
                SPAWN_CONFIG.defaults.midWaterY,
                true
            );
            
            // Spawn enemies at generated points
            if (bossMode) {
                // Boss mode: spawn only boss(es)
                spawnPoints.forEach(point => {
                    spawnEnemy(this, point.x, point.y, 'boss_land_micro');
                });
                
                // Set total bosses for tracking
                combatSystem.setTotalBosses(spawnPoints.length);
            } else {
                // Normal mode: regular enemies + boss
                spawnPoints.forEach(point => {
                    if (point.isBoss) {
                        // Spawn boss enemy
                        spawnEnemy(this, point.x, point.y, 'boss_land_micro');
                    } else {
                        // Spawn regular micro enemy
                        spawnEnemy(this, point.x, point.y, 'micro');
                    }
                });
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
    
    async update() {
        const playerStats = xpOrbManager.getPlayerStats();
        
        // Update stamina system
        const staminaSystem = getStaminaSystem();
        const isMeleeActive = this.player?.isMeleeMode || false;
        staminaSystem.update(isMeleeActive, this.time.now);
        
        // Update fuel system
        const fuelSystem = getFuelSystem();
        fuelSystem.update(this.time.now);
        
        // Update debug display (only if enabled)
        if (this.debugDisplay?.enabled) {
            this.debugDisplay.update(this.player.x, playerStats);
        }
        
        // Update HUD
        this.hud.update(playerStats);
        
        // Update boss count display if in boss mode
        const bossMode = this.registry.get('bossMode') === true;
        if (bossMode) {
            const bossProgress = combatSystem.getBossProgress();
            this.hud.updateBossCount(bossProgress.defeated, bossProgress.total);
        } else {
            this.hud.hideBossCount();
        }
        
        // Update size change cooldown
        let timer = getSizeChangeTimer();
        if (timer > 0) {
            timer -= 1000 / 60;
            setSizeChangeTimer(timer);
        }
        
        // Handle player movement
        this.inputManager.handleMovement();
        
        // Update enemies (bacteria)
        this.enemies.children.entries.forEach(obj => {
            const enemy = obj as Enemy;
            if (enemy.active) {
                updateEnemyAI(enemy, this.time.now);
            }
        });
        
        // Update combat stun effects
        combatSystem.updateStunEffects(this.enemies, this.player, this.time.now);
        
        // Update projectiles
        projectileManager.updateProjectiles();
        
        // Update XP orb magnetism
        xpOrbManager.updateXPOrbMagnetism();
        
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
        this.player.immuneUntil = this.time.now + 4000;
        
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
            spawnEnemy(this, x, 680, 'bacteria');
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
    
    handleNextLevel() {
        console.log('Advancing to next level');
        
        // Advance to next level
        levelProgressionSystem.advanceToNextLevel();
        
        // Reset stats tracker for new level
        levelStatsTracker.reset();
        
        // Reset player position to start
        gameState.savedPositions.MicroScene = { x: 100, y: 650 };
        
        // Clear saved enemies to spawn fresh enemies for new level
        gameState.savedEnemies.MicroScene = [];
        
        // Restart the scene with new level
        this.scene.restart();
    }
    
    handleReplay() {
        console.log('Replaying level');
        
        // Reset stats tracker for new attempt
        levelStatsTracker.reset();
        
        // Reset player position to start
        gameState.savedPositions.MicroScene = { x: 100, y: 650 };
        
        // Clear saved enemies to respawn for replay
        gameState.savedEnemies.MicroScene = [];
        
        // Restart the current scene
        this.scene.restart();
    }
    
    handleExitToMenu() {
        console.log('Exiting to main menu');
        
        // Reset stats tracker when exiting
        levelStatsTracker.reset();
        
        // Reset level progression to level 1
        levelProgressionSystem.resetToLevel1();
        
        // Go back to menu
        this.scene.start('MenuScene');
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.MicroScene = this.enemies.children.entries
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
                    enemyType: e.enemyType,
                    floatAngle: e.floatAngle
                };
            });
        
        // Save player position
        if (this.player) {
            gameState.savedPositions.MicroScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
