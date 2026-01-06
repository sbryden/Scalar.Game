/**
 * Underwater Macro Scene  
 * Deep ocean gameplay scene with massive sea creatures
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT, BOSS_MODE_CONFIG } from '../config';
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
import { generateUnderwaterBackground } from '../utils/backgroundGenerator';

export default class UnderwaterMacroScene extends Phaser.Scene {
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
        super({ key: 'UnderwaterMacroScene' });
    }
    
    create() {
        // Initialize difficulty if this is first time entering game
        const difficulty = this.registry.get('difficulty') || 'normal';
        if (!gameState.difficultyInitialized) {
            playerStatsSystem.initializeDifficulty(difficulty);
            gameState.difficultyInitialized = true;
        }
        
        // Reset spawner boss tracking
        combatSystem.resetSpawnerTracking();
        
        // Start tracking level stats
        levelStatsTracker.startLevel(this.time.now);
        
        // Set lighter gravity for deep ocean (very low for macro scale)
        this.physics.world.gravity.y = 80;
        
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
        // Generate dynamic underwater background with map level seed for consistency
        const mapLevel = levelProgressionSystem.getCurrentLevel();
        generateUnderwaterBackground(this, mapLevel);
        
        // Add deeper ocean visual elements for macro scale
        this.createDeepOceanEffects();
    }
    
    createDeepOceanEffects() {
        // Add dark overlay for deep ocean feeling
        const darkOverlay = this.add.rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0x000033, 0.3);
        darkOverlay.setOrigin(0, 0);
        darkOverlay.setDepth(-40);
        darkOverlay.setScrollFactor(0);
        
        // Add distant underwater rock formations
        const formationGraphics = this.add.graphics();
        formationGraphics.setScrollFactor(0.2); // Parallax effect
        formationGraphics.setDepth(-35);
        
        // Dark underwater rock silhouettes
        formationGraphics.fillStyle(0x1a2a4a, 0.5);
        
        for (let i = 0; i < 6; i++) {
            const x = (WORLD_WIDTH / 6) * i;
            const height = 150 + Math.random() * 200;
            const width = 100 + Math.random() * 150;
            
            // Draw rocky formation
            formationGraphics.fillRect(x, 800 - height, width, height);
            
            // Add jagged top
            formationGraphics.fillTriangle(
                x, 800 - height,
                x + width / 2, 800 - height - 50,
                x + width, 800 - height
            );
        }
        
        // Add subtle light rays from above
        this.createLightRays();
    }
    
    createLightRays() {
        // Create faint light rays filtering from surface
        const rayGraphics = this.add.graphics();
        rayGraphics.setDepth(-30);
        rayGraphics.setScrollFactor(0.5);
        rayGraphics.setAlpha(0.1);
        
        for (let i = 0; i < 3; i++) {
            const x = (WORLD_WIDTH / 4) * (i + 0.5);
            const gradient = rayGraphics.fillGradientStyle(
                0xFFFFFF, 0xFFFFFF, 0x000033, 0x000033, 1
            );
            
            // Draw triangular light ray
            rayGraphics.fillTriangle(
                x - 20, 0,
                x + 20, 0,
                x, 400
            );
        }
    }
    
    createGround() {
        // Create deep ocean floor with rocks and coral
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        
        // Dark sandy/rocky base for deep ocean
        groundGraphics.fillStyle(0x3a4a5a, 1);
        groundGraphics.fillRect(0, 0, WORLD_WIDTH, 50);
        
        // Add darker sand texture
        groundGraphics.fillStyle(0x4a5a6a, 1);
        for (let x = 0; x < WORLD_WIDTH; x += 15) {
            for (let y = 0; y < 50; y += 15) {
                if (Math.random() > 0.5) {
                    groundGraphics.fillCircle(x + Math.random() * 8, y + Math.random() * 8, 3);
                }
            }
        }
        
        // Add large rocks and coral formations
        groundGraphics.fillStyle(0x2a3a4a, 1);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * 50;
            const size = 8 + Math.random() * 15;
            groundGraphics.fillCircle(x, y, size);
        }
        
        // Add some bioluminescent spots (glowing)
        groundGraphics.fillStyle(0x00FFFF, 0.3);
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * WORLD_WIDTH;
            const y = Math.random() * 50;
            groundGraphics.fillCircle(x, y, 4);
        }
        
        groundGraphics.generateTexture('underwaterGroundMacro', WORLD_WIDTH, 50);
        groundGraphics.destroy();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, 'underwaterGroundMacro');
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }
    
    createPlayer() {
        // Restore player position or use default
        const savedPos = gameState.savedPositions.UnderwaterMacroScene;
        
        // Create player (submarine) - larger for macro scale
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, 'sub_1') as Player;
        this.player.setScale(0.35); // Larger than normal underwater (0.25)
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
        gameState.currentSceneKey = 'UnderwaterMacroScene';
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
        const savedEnemies = gameState.savedEnemies.UnderwaterMacroScene;

        // Check if boss mode is active
        const bossMode = this.registry.get('bossMode') === true;
        
        if (savedEnemies && savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || 'whale');
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
            });
        } else {
            if (bossMode) {
                // Boss mode: spawn macro bosses (whales, giant sharks, sea serpents)
                const { fishSpawns, crabSpawns } = spawnSystem.generateMixedSpawnPoints(0.7);
                
                // Spawn macro swimming bosses (whales, giant sharks)
                fishSpawns.forEach((point, index) => {
                    const bossType = index % 2 === 0 ? 'whale_boss' : 'giant_shark_boss';
                    spawnEnemy(this, point.x, point.y, bossType);
                });
                
                // Spawn macro ground bosses (giant crabs, sea serpents)
                crabSpawns.forEach((point, index) => {
                    const bossType = index % 2 === 0 ? 'giant_crab_boss' : 'sea_serpent_boss';
                    spawnEnemy(this, point.x, point.y, bossType);
                });
                
                // Set total bosses for tracking
                combatSystem.setTotalBosses(fishSpawns.length + crabSpawns.length);
            } else {
                // Normal mode: Generate dynamic mixed spawn points (70% swimmers, 30% ground-based)
                const { fishSpawns, crabSpawns } = spawnSystem.generateMixedSpawnPoints(0.7);
                
                // Spawn macro swimming enemies
                fishSpawns.forEach(point => {
                    if (point.isBoss) {
                        const bossTypes = ['whale_boss', 'giant_shark_boss'];
                        const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
                        spawnEnemy(this, point.x, point.y, bossType);
                    } else {
                        const enemyTypes = ['whale', 'giant_shark', 'sea_dragon'];
                        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                        spawnEnemy(this, point.x, point.y, enemyType);
                    }
                });
                
                // Spawn macro ground-based enemies
                crabSpawns.forEach(point => {
                    if (point.isBoss) {
                        const bossTypes = ['giant_crab_boss', 'sea_serpent_boss'];
                        const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
                        spawnEnemy(this, point.x, point.y, bossType);
                    } else {
                        const enemyTypes = ['giant_crab', 'sea_serpent'];
                        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                        spawnEnemy(this, point.x, point.y, enemyType);
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
    
    update() {
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
        const maxFlashes = 20;
        
        const flashTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                flashCount++;
                if (flashCount % 2 === 0) {
                    player.setAlpha(1);
                } else {
                    player.setAlpha(0.3);
                }
                
                if (flashCount >= maxFlashes) {
                    player.setAlpha(1);
                    flashTimer.destroy();
                }
            },
            loop: true
        });
    }
    
    handleContinue() {
        console.log('Player chose to continue');
        
        playerStatsSystem.reset();
        this.player.setPosition(400, 400);
        this.player.setVelocity(0, 0);
        this.player.clearTint();
        this.player.immuneUntil = this.time.now + 4000;
        this.startImmunityFlash(this.player);
        
        const collider = this.collisionManager.playerEnemyCollider;
        if (collider) {
            this.physics.world.removeCollider(collider);
        }
        
        this.time.delayedCall(2000, () => {
            this.collisionManager.setupPlayerEnemyCollision();
        });
        
        this.enemies.children.entries.forEach((enemy: any) => {
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        });
        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);
        this.xpOrbs.clear(true, true);
        
        // Spawn macro underwater enemies
        for (let x = 400; x < WORLD_WIDTH; x += 400) {
            spawnEnemy(this, x, 300 + Math.random() * 200, 'whale');
        }
        
        this.hud.update(playerStatsSystem.getStats());
    }
    
    handleQuit() {
        console.log('Player chose to quit');
        playerStatsSystem.reset();
        this.scene.start('MenuScene');
    }
    
    handleLevelComplete() {
        console.log('Level Complete - Boss Defeated!');
        levelStatsTracker.endLevel(this.time.now);
        this.levelCompleteScreen.show();
    }
    
    handleNextLevel() {
        console.log('Advancing to next level');
        levelProgressionSystem.advanceToNextLevel();
        levelStatsTracker.reset();
        gameState.savedPositions.UnderwaterMacroScene = { x: 100, y: 650 };
        gameState.savedEnemies.UnderwaterMacroScene = [];
        this.scene.restart();
    }
    
    handleReplay() {
        console.log('Replaying level');
        levelStatsTracker.reset();
        gameState.savedPositions.UnderwaterMacroScene = { x: 100, y: 650 };
        gameState.savedEnemies.UnderwaterMacroScene = [];
        this.scene.restart();
    }
    
    handleExitToMenu() {
        console.log('Exiting to main menu');
        levelStatsTracker.reset();
        levelProgressionSystem.resetToLevel1();
        this.scene.start('MenuScene');
    }
    
    shutdown() {
        // Save enemy states before leaving scene
        gameState.savedEnemies.UnderwaterMacroScene = this.enemies.children.entries
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
            gameState.savedPositions.UnderwaterMacroScene = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }
}
