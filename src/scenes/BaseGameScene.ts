/**
 * Base Game Scene
 * Abstract base class for all gameplay scenes, extracting common functionality.
 * Subclasses implement abstract methods to define scene-specific behavior.
 */
import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import spawnSystem from '../systems/SpawnSystem';
import enemyManager from '../managers/EnemyManager';
import projectileManager from '../managers/ProjectileManager';
import xpOrbManager from '../managers/XPOrbManager';
import playerManager from '../managers/PlayerManager';
import gameState from '../utils/GameContext';
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
import type { Enemy, Player, SceneKey } from '../types/game';

/**
 * Configuration for scene-specific behavior
 */
export interface SceneConfig {
    /** Scene key used for Phaser and state management */
    sceneKey: SceneKey;
    /** Physics gravity Y value (default: 300) */
    gravity: number;
    /** Player sprite texture key */
    playerTexture: string;
    /** Player scale (default: 0.25) */
    playerScale: number;
    /** Player bounce value */
    playerBounce: number;
    /** Player drag (x, y) */
    playerDrag: { x: number; y: number };
    /** Default enemy type for this scene */
    defaultEnemyType: string;
    /** Enemy spawn interval */
    spawnInterval: number;
    /** Ground Y position for spawning */
    groundY: number;
    /** Whether enemies can float/swim (Y variance in spawning) */
    allowYVariance: boolean;
}

/**
 * Abstract base class for all gameplay scenes
 */
export default abstract class BaseGameScene extends Phaser.Scene {
    // Game objects
    player!: Player;
    platforms!: Phaser.Physics.Arcade.StaticGroup;
    enemies!: Phaser.Physics.Arcade.Group;
    projectiles!: Phaser.Physics.Arcade.Group;
    xpOrbs!: Phaser.Physics.Arcade.Group;
    
    // UI components
    hud!: HUD;
    debugDisplay!: DebugDisplay;
    gameOverScreen!: GameOverScreen;
    levelCompleteScreen!: LevelCompleteScreen;
    
    // Managers
    inputManager!: InputManager;
    collisionManager!: CollisionManager;
    cameraManager!: CameraManager;

    constructor(sceneKey: SceneKey) {
        super({ key: sceneKey });
    }

    // ============================================
    // ABSTRACT METHODS - Must be implemented by subclasses
    // ============================================

    /** Returns the configuration for this scene */
    protected abstract getSceneConfig(): SceneConfig;

    /** Creates the scene-specific background */
    protected abstract createBackground(): void;

    /** Creates the scene-specific ground texture and platforms */
    protected abstract createGround(): void;

    /** Returns boss types available in this scene */
    protected abstract getBossTypes(): string[];

    /** Spawns enemies using scene-specific logic */
    protected abstract spawnSceneEnemies(bossMode: boolean): void;

    // ============================================
    // LIFECYCLE METHODS
    // ============================================

    create(): void {
        const config = this.getSceneConfig();

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

        // Set scene-specific gravity
        this.physics.world.gravity.y = config.gravity;

        // Create scene components in order
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

    update(): void {
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
        const timer = playerManager.getSizeChangeTimer();
        if (timer > 0) {
            playerManager.setSizeChangeTimer(timer - 1000 / 60);
        }

        // Handle player movement
        this.inputManager.handleMovement();

        // Update enemies
        this.enemies.children.entries.forEach(obj => {
            const enemy = obj as Enemy;
            if (enemy.active) {
                enemyManager.updateEnemyAI(enemy, this.time.now);
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

    shutdown(): void {
        const config = this.getSceneConfig();

        // Save enemy states before leaving scene
        gameState.savedEnemies[config.sceneKey] = this.enemies.children.entries
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
            gameState.savedPositions[config.sceneKey] = {
                x: this.player.x,
                y: this.player.y
            };
        }
    }

    // ============================================
    // COMMON SETUP METHODS
    // ============================================

    protected createPlayer(): void {
        const config = this.getSceneConfig();
        const savedPos = gameState.savedPositions[config.sceneKey];

        // Create player sprite
        this.player = this.physics.add.sprite(savedPos.x, savedPos.y, config.playerTexture) as Player;
        this.player.setScale(config.playerScale);
        this.player.setBounce(config.playerBounce);
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(config.playerDrag.x, config.playerDrag.y);
        this.player.scene = this;

        this.physics.add.collider(this.player, this.platforms);
    }

    protected createGroups(): void {
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.xpOrbs = this.physics.add.group();
    }

    protected initializeGameState(): void {
        const config = this.getSceneConfig();

        gameState.player = this.player;
        gameState.enemies = this.enemies;
        gameState.projectiles = this.projectiles;
        gameState.xpOrbs = this.xpOrbs;
        gameState.platforms = this.platforms;
        gameState.scene = this;
        gameState.currentSceneKey = config.sceneKey;

        // Apply correct vehicle texture based on player level
        spawnSystem.upgradePlayerCar();
    }

    protected createUI(): void {
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

    protected restoreOrSpawnEnemies(): void {
        const config = this.getSceneConfig();
        const savedEnemies = gameState.savedEnemies[config.sceneKey];
        const bossMode = this.registry.get('bossMode') === true;

        if (savedEnemies && savedEnemies.length > 0) {
            // Restore saved enemies
            savedEnemies.forEach(enemyData => {
                const enemy = enemyManager.spawnEnemy(this, enemyData.x, enemyData.y, enemyData.enemyType || config.defaultEnemyType);
                enemy.health = enemyData.health;
                enemy.startX = enemyData.startX;
                enemy.startY = enemyData.startY || enemyData.y;
                enemy.direction = enemyData.direction;
                if (enemyData.floatAngle !== undefined) {
                    enemy.floatAngle = enemyData.floatAngle;
                }
            });
        } else {
            // Spawn new enemies using scene-specific logic
            this.spawnSceneEnemies(bossMode);
        }
    }

    protected setupManagers(): void {
        this.inputManager = new InputManager(this);
        this.inputManager.setupInput();

        this.collisionManager = new CollisionManager(this);
        this.collisionManager.setupCollisions();

        this.cameraManager = new CameraManager(this);
        this.cameraManager.setupCamera();
    }

    protected createDebugText(): void {
        this.debugDisplay = new DebugDisplay(this);
    }

    // ============================================
    // GAME EVENT HANDLERS
    // ============================================

    protected handleGameOver(): void {
        console.log('Game Over - Showing screen...');
        this.gameOverScreen.show();
    }

    protected startImmunityFlash(player: Phaser.Physics.Arcade.Sprite): void {
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

    protected handleContinue(): void {
        const config = this.getSceneConfig();
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
        this.enemies.children.entries.forEach((enemy: Phaser.GameObjects.GameObject) => {
            const e = enemy as Enemy;
            if (e.healthBar) e.healthBar.destroy();
            if (e.healthBarBg) e.healthBarBg.destroy();
        });
        this.enemies.clear(true, true);

        // Clear all projectiles and XP orbs
        this.projectiles.clear(true, true);
        this.xpOrbs.clear(true, true);

        // Spawn new enemies using default type
        for (let x = 300; x < WORLD_WIDTH; x += 300) {
            enemyManager.spawnEnemy(this, x, 680, config.defaultEnemyType);
        }

        // Update HUD
        this.hud.update(playerStatsSystem.getStats());
    }

    protected handleQuit(): void {
        console.log('Player chose to quit');
        playerStatsSystem.reset();
        this.scene.start('MenuScene');
    }

    protected handleLevelComplete(): void {
        console.log('Level Complete - Boss Defeated!');
        levelStatsTracker.endLevel(this.time.now);
        this.levelCompleteScreen.show();
    }

    protected handleNextLevel(): void {
        const config = this.getSceneConfig();
        console.log('Advancing to next level');

        levelProgressionSystem.advanceToNextLevel();
        levelStatsTracker.reset();

        // Reset player position to start
        gameState.savedPositions[config.sceneKey] = { x: 100, y: 650 };

        // Clear saved enemies to spawn fresh enemies for new level
        gameState.savedEnemies[config.sceneKey] = [];

        this.scene.restart();
    }

    protected handleReplay(): void {
        const config = this.getSceneConfig();
        console.log('Replaying level');

        levelStatsTracker.reset();

        gameState.savedPositions[config.sceneKey] = { x: 100, y: 650 };
        gameState.savedEnemies[config.sceneKey] = [];

        this.scene.restart();
    }

    protected handleExitToMenu(): void {
        console.log('Exiting to main menu');

        levelStatsTracker.reset();
        levelProgressionSystem.resetToLevel1();

        this.scene.start('MenuScene');
    }

    // ============================================
    // HELPER METHODS FOR SUBCLASSES
    // ============================================

    /**
     * Creates standard ground texture with platform
     * @param textureKey Unique key for the generated texture
     * @param createTextureCallback Function to draw the ground texture
     */
    protected createGroundWithTexture(
        textureKey: string,
        createTextureCallback: (graphics: Phaser.GameObjects.Graphics) => void
    ): void {
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        createTextureCallback(groundGraphics);
        groundGraphics.generateTexture(textureKey, WORLD_WIDTH, 50);
        groundGraphics.destroy();

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const ground = this.platforms.create(WORLD_WIDTH / 2, 750, textureKey);
        ground.setOrigin(0.5, 0.5);
        ground.setScale(1).refreshBody();
    }

    /**
     * Spawns enemies using the dynamic spawn point system
     * Used by land-based scenes with standard spawning
     */
    protected spawnWithDynamicPoints(
        bossMode: boolean,
        bossTypes: string[],
        defaultEnemyType: string,
        spawnInterval: number,
        groundY: number,
        allowYVariance: boolean
    ): void {
        const spawnPoints = spawnSystem.generateDynamicSpawnPoints(
            spawnInterval,
            groundY,
            allowYVariance
        );

        if (bossMode) {
            // Boss mode: spawn bosses
            spawnPoints.forEach((point, index) => {
                const bossType = bossTypes[index % bossTypes.length];
                enemyManager.spawnEnemy(this, point.x, point.y, bossType);
            });
            combatSystem.setTotalBosses(spawnPoints.length);
        } else {
            // Normal mode: regular enemies + random boss
            spawnPoints.forEach(point => {
                if (point.isBoss) {
                    const bossType = Phaser.Utils.Array.GetRandom(bossTypes);
                    enemyManager.spawnEnemy(this, point.x, point.y, bossType);
                } else {
                    enemyManager.spawnEnemy(this, point.x, point.y, defaultEnemyType);
                }
            });
        }
    }

    /**
     * Spawns enemies using mixed spawn points (for underwater scenes with fish/crabs)
     */
    protected spawnWithMixedPoints(
        bossMode: boolean,
        fishBossType: string,
        crabBossType: string,
        defaultFishType: string,
        defaultCrabType: string,
        fishRatio: number = 0.8
    ): void {
        const { fishSpawns, crabSpawns } = spawnSystem.generateMixedSpawnPoints(fishRatio);

        if (bossMode) {
            fishSpawns.forEach(point => {
                enemyManager.spawnEnemy(this, point.x, point.y, fishBossType);
            });
            crabSpawns.forEach(point => {
                enemyManager.spawnEnemy(this, point.x, point.y, crabBossType);
            });
            combatSystem.setTotalBosses(fishSpawns.length + crabSpawns.length);
        } else {
            fishSpawns.forEach(point => {
                if (point.isBoss) {
                    enemyManager.spawnEnemy(this, point.x, point.y, fishBossType);
                } else {
                    enemyManager.spawnEnemy(this, point.x, point.y, defaultFishType);
                }
            });
            crabSpawns.forEach(point => {
                if (point.isBoss) {
                    enemyManager.spawnEnemy(this, point.x, point.y, crabBossType);
                } else {
                    enemyManager.spawnEnemy(this, point.x, point.y, defaultCrabType);
                }
            });
        }
    }
}
