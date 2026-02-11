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
import targetingSystem from '../systems/TargetingSystem';
import stageStatsTracker from '../systems/StageStatsTracker';
import stageProgressionSystem from '../systems/StageProgressionSystem';
import { getStaminaSystem } from '../systems/StaminaSystem';
import { getFuelSystem } from '../systems/FuelSystem';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { CameraManager } from '../managers/CameraManager';
import { initializeCompanionManager, getCompanionManager } from '../managers/CompanionManager';
import { Services } from '../services';
import { HUD } from '../ui/HUD';
import { DebugDisplay } from '../ui/DebugDisplay';
import { GameOverScreen } from '../ui/GameOverScreen';
import { StageCompleteScreen } from '../ui/StageCompleteScreen';
import sizeTransitionSystem from '../systems/SizeTransitionSystem';
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
    stageCompleteScreen!: StageCompleteScreen;
    
    // Managers
    inputManager!: InputManager;
    collisionManager!: CollisionManager;
    cameraManager!: CameraManager;
    
    // Stage completion state
    private isStageCompleting: boolean = false;

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

        // Reset stage completion state (important for scene.restart() which reuses the same instance)
        this.isStageCompleting = false;
        
        // Reset jet mech state on scene change
        playerStatsSystem.resetJetMechState();

        // Initialize difficulty if this is first time entering game
        const difficulty = this.registry.get('difficulty') || 'normal';
        if (!gameState.difficultyInitialized) {
            playerStatsSystem.initializeDifficulty(difficulty);
            gameState.difficultyInitialized = true;
        }

        // Reset spawner boss tracking
        combatSystem.resetSpawnerTracking();

        // Start tracking stage stats (keep run totals across scene swaps)
        stageStatsTracker.startStage(this.time.now, stageProgressionSystem.getCurrentStage());

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
        
        // Initialize and register companion manager for this scene
        const companionManager = initializeCompanionManager(this);
        Services.register('companionManager', companionManager);
        
        // Respawn companions if they should be active in this scene
        companionManager.respawnCompanions();

        // Setup managers (includes collision setup, now aware of companions)
        this.setupManagers();
        this.createDebugText();

        // If arriving from a size transition, run the arrival zoom animation
        sizeTransitionSystem.finishTransition(this);
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

        // Skip gameplay updates during size transition (world is frozen)
        if (!sizeTransitionSystem.isTransitioning) {
            // Update enemies
            this.enemies.children.entries.forEach(obj => {
                const enemy = obj as Enemy;
                if (enemy.active) {
                    enemyManager.updateEnemyAI(enemy, this.time.now);
                }
            });

            // Update combat stun effects
            combatSystem.updateStunEffects(this.enemies, this.player, this.time.now);

            // Update targeting system (validate target, update reticle)
            targetingSystem.update(this);

            // Update projectiles
            projectileManager.updateProjectiles();

            // Update XP orb magnetism
            xpOrbManager.updateXPOrbMagnetism();
            
            // Update companions
            const companionManager = getCompanionManager();
            if (companionManager) {
                companionManager.update(this.game.loop.delta); // delta in ms
            }
        }

        // Update camera
        this.cameraManager.update();
        
        // Update jet mech health decay (if active)
        if (playerStatsSystem.isJetMechActive()) {
            const mechStillActive = playerStatsSystem.updateMechHealth(this.game.loop.delta);
            if (!mechStillActive) {
                // Mech died - trigger respawn
                this.handleMechDeath();
            }
        }
        
        // Check for player-flag collision
        if (gameState.stageCompleteFlag && this.player && !this.isStageCompleting) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                gameState.stageCompleteFlag.x, gameState.stageCompleteFlag.y
            );
            
            if (distance < 100) { // Collision threshold (increased for easier collection)
                this.isStageCompleting = true;
                this.handleFlagReached();
            }
        }
    }

    shutdown(): void {
        const config = this.getSceneConfig();

        // Clean up transition overlay, but preserve transition state if a
        // size transition is in progress (shutdown fires between departure and arrival)
        if (!gameState.transitionZoom && !gameState.transitionDirection) {
            sizeTransitionSystem.cleanup();
        }

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
        
        // Clear targeting state and reticle on scene shutdown
        targetingSystem.destroyReticle();

        // Despawn companions on scene shutdown (they'll respawn in next scene if appropriate)
        const companionManager = getCompanionManager();
        if (companionManager) {
            companionManager.despawnAll();
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
        gameState.levelText = this.hud.xpLabel;

        // Create Game Over Screen
        this.gameOverScreen = new GameOverScreen(this);
        this.gameOverScreen.create();

        // Set up game over callback
        playerStatsSystem.setGameOverCallback(() => {
            this.handleGameOver();
        });

        // Set up mech death callback (when mech HP reaches 0 from damage)
        playerStatsSystem.setMechDeathCallback(() => {
            this.handleMechDeath();
        });

        // Set up continue and quit callbacks
        this.gameOverScreen.setContinueCallback(() => {
            this.handleContinue();
        });

        this.gameOverScreen.setQuitCallback(() => {
            this.handleQuit();
        });

        // Create Stage Complete Screen
        this.stageCompleteScreen = new StageCompleteScreen(this);
        this.stageCompleteScreen.create();

        // Set up boss defeat callback
        combatSystem.setBossDefeatCallback(() => {
            this.handleStageComplete();
        });

        // Set up next stage and exit callbacks
        this.stageCompleteScreen.setNextStageCallback(() => {
            this.handleNextStage();
        });

        this.stageCompleteScreen.setExitCallback(() => {
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

        // Initialize targeting system reticle for this scene
        targetingSystem.initReticle(this);
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
    
    /**
     * Handle jet mech death - restore player and trigger respawn animation
     */
    protected handleMechDeath(): void {
        console.log('Jet Mech destroyed! Restoring player...');
        
        // Restore player texture and scale
        if (gameState.preMechPlayerTexture && this.player) {
            this.player.setTexture(gameState.preMechPlayerTexture);
            this.player.setScale(gameState.preMechPlayerScale);
            
            // Update physics body
            if (this.player.body) {
                this.player.body.updateFromGameObject();
            }
        }
        
        // Clear pre-mech state
        gameState.preMechPlayerTexture = null;
        
        // Respawn player from top (same as death continue)
        this.player.setPosition(this.player.x, 100);
        this.player.setVelocity(0, 0);
        
        // Clear any tint
        this.player.clearTint();
        
        // Grant brief immunity (2 seconds)
        this.player.immuneUntil = this.time.now + 2000;
        this.startImmunityFlash(this.player);
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

        // Reset stage completing flag so player can collect the flag again
        this.isStageCompleting = false;

        // Game over resets the run score
        stageStatsTracker.resetRun();
        stageStatsTracker.startStage(this.time.now, stageProgressionSystem.getCurrentStage());

        // Reset player stats
        playerStatsSystem.reset();
        
        // Clear companions on continue (keep diedThisRun to prevent revival)
        playerStatsSystem.clearCompanionsOnContinue();
        const companionManager = getCompanionManager();
        if (companionManager) {
            companionManager.despawnAll();
        }

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
        stageStatsTracker.resetRun();
        
        // Full reset of companions for new run
        playerStatsSystem.resetCompanions();
        
        this.scene.start('MenuScene');
    }

    protected handleStageComplete(): void {
        console.log('Stage Complete - All Bosses Defeated! Spawning flag...');
        this.spawnStageCompleteFlag();
    }
    
    /**
     * Spawn the stage complete flag near the end of the stage
     */
    protected spawnStageCompleteFlag(): void {
        // Flag spawns at a fixed distance from the end of the stage
        const flagX = WORLD_WIDTH - 300; // 300 pixels from the end
        const flagY = 650; // Near the ground
        
        const flagTextureKey = 'stage_complete_flag';
        
        // Generate the flag texture once per scene, if it does not already exist
        if (!this.textures.exists(flagTextureKey)) {
            const flag = this.add.graphics();
            flag.fillStyle(0xFFD700, 1); // Gold color
            flag.fillRect(0, 0, 5, 60); // Pole (1/4 of 20 = 5 pixels wide)
            flag.fillStyle(0xFF0000, 1); // Red flag
            flag.fillTriangle(5, 0, 5, 40, 70, 20); // Triangular flag starting from pole edge
            flag.generateTexture(flagTextureKey, 80, 70);
            flag.destroy();
        }
        
        // Create the flag as a sprite
        const flagSprite = this.physics.add.sprite(flagX, flagY, flagTextureKey);
        flagSprite.setScale(1.5);
        flagSprite.setDepth(100);
        
        // Prevent flag from falling due to gravity
        flagSprite.body.setAllowGravity(false);
        flagSprite.body.setImmovable(true);
        
        // Increase the physics body size for easier collection
        flagSprite.body.setSize(120, 120);
        flagSprite.body.setOffset(-20, -25);
        
        // Store flag reference in gameState
        gameState.stageCompleteFlag = flagSprite;
        
        // Add a bounce animation to make it noticeable
        this.tweens.add({
            targets: flagSprite,
            y: flagY - 20,
            duration: 500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        console.log(`Flag spawned at (${flagX}, ${flagY})`);
    }
    
    /**
     * Handle player reaching the stage complete flag
     */
    protected handleFlagReached(): void {
        if (!gameState.stageCompleteFlag) return;
        
        console.log('Player reached the flag!');
        
        // Destroy the flag
        gameState.stageCompleteFlag.destroy();
        gameState.stageCompleteFlag = null;
        
        // End stage timer
        stageStatsTracker.endStage(this.time.now);
        
        // Play firework animation, then show stage complete screen
        this.createFireworkAnimation(() => {
            this.stageCompleteScreen.show();
        });
    }
    
    /**
     * Create a firework celebration animation
     * @param onComplete - Callback to execute when animation finishes
     */
    protected createFireworkAnimation(onComplete: () => void): void {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Create multiple bursts for a more impressive effect
        const burstCount = 5;
        let burstsCompleted = 0;
        
        const createBurst = (delay: number, color: number) => {
            this.time.delayedCall(delay, () => {
                // Central flash
                const flash = this.add.circle(centerX, centerY, 50, color, 1);
                flash.setDepth(3000);
                flash.setScrollFactor(0); // Fixed to camera
                
                this.tweens.add({
                    targets: flash,
                    scale: 3,
                    alpha: 0,
                    duration: 800,
                    ease: 'Cubic.out',
                    onComplete: () => flash.destroy()
                });
                
                // Particle burst
                const particleCount = 30;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 * i) / particleCount;
                    const distance = 150 + Math.random() * 100;
                    
                    const particle = this.add.circle(centerX, centerY, 8, color, 1);
                    particle.setDepth(3000);
                    particle.setScrollFactor(0);
                    
                    const targetX = centerX + Math.cos(angle) * distance;
                    const targetY = centerY + Math.sin(angle) * distance;
                    
                    this.tweens.add({
                        targets: particle,
                        x: targetX,
                        y: targetY,
                        alpha: 0,
                        scale: 0.5,
                        duration: 1000 + Math.random() * 500,
                        ease: 'Cubic.out',
                        onComplete: () => particle.destroy()
                    });
                }
                
                // Camera shake for impact
                this.cameras.main.shake(200, 0.01);
                
                burstsCompleted++;
                if (burstsCompleted >= burstCount) {
                    // All bursts complete, call the callback
                    this.time.delayedCall(1000, onComplete);
                }
            });
        };
        
        // Create firework bursts with different colors and delays
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
        colors.forEach((color, index) => {
            createBurst(index * 200, color);
        });
    }

    protected handleNextStage(): void {
        const config = this.getSceneConfig();
        console.log('Advancing to next stage');

        stageProgressionSystem.advanceToNextStage();

        // Reset player position to start
        gameState.savedPositions[config.sceneKey] = { x: 100, y: 650 };

        // Clear saved enemies to spawn fresh enemies for new stage
        gameState.savedEnemies[config.sceneKey] = [];
        
        // Clear flag if it exists
        if (gameState.stageCompleteFlag) {
            gameState.stageCompleteFlag.destroy();
            gameState.stageCompleteFlag = null;
        }

        this.scene.restart();
    }

    protected handleExitToMenu(): void {
        console.log('Exiting to main menu');

        stageStatsTracker.reset();
        stageProgressionSystem.resetToStage1();
        
        // Full reset of companions for new run
        playerStatsSystem.resetCompanions();

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
                    // 20% chance to spawn spawner variant for micro enemies
                    let enemyTypeToSpawn = defaultEnemyType;
                    if (defaultEnemyType === 'micro' && Math.random() < 0.2) {
                        enemyTypeToSpawn = 'spawner_micro';
                    } else if (defaultEnemyType === 'water_swimming_micro' && Math.random() < 0.2) {
                        enemyTypeToSpawn = 'spawner_water_swimming_micro';
                    }
                    enemyManager.spawnEnemy(this, point.x, point.y, enemyTypeToSpawn);
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
