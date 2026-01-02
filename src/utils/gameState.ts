/**
 * Game State Manager
 * 
 * Central singleton managing all shared game state across the application.
 * Provides a single source of truth for game objects, scene management,
 * player state, and cross-scene data persistence.
 * 
 * This class eliminates the need for setter functions across modules by
 * providing direct property access to all game state. Modules can read
 * and write to gameState properties as needed.
 * 
 * Key responsibilities:
 * - Manage references to core game objects (player, enemies, projectiles, XP orbs)
 * - Track current scene and maintain scene-specific state
 * - Store player size and size change cooldown
 * - Persist enemy and position data across scene transitions
 * - Manage input references (cursors, WASD keys)
 * - Track difficulty initialization state
 * - Store level progression data
 * 
 * Singleton pattern ensures consistent state access across all game modules.
 */
import Phaser from 'phaser';
import type { Player, Enemy, Projectile, XPOrb, WASDKeys, SavedPosition, SavedEnemy, PlayerSize, SceneKey } from '../types/game';

class GameState {
    // ========================================
    // Core Game Objects
    // ========================================
    
    /**
     * Reference to the player sprite.
     * Null when not initialized or between scenes.
     */
    player: Player | null;
    
    /**
     * Physics group containing all active enemies.
     * Managed by EnemyManager for spawning and AI updates.
     */
    enemies: Phaser.Physics.Arcade.Group | null;
    
    /**
     * Physics group containing all active projectiles.
     * Includes both player and enemy projectiles.
     */
    projectiles: Phaser.Physics.Arcade.Group | null;
    
    /**
     * Physics group containing all active XP orbs.
     * Created when enemies are defeated and collected by player.
     */
    xpOrbs: Phaser.Physics.Arcade.Group | null;
    
    /**
     * Static physics group for platforms and ground.
     * Used for collision detection with player and enemies.
     */
    platforms: Phaser.Physics.Arcade.StaticGroup | null;
    
    // ========================================
    // Scene and Input References
    // ========================================
    
    /**
     * Reference to the currently active scene.
     * Used by managers to access scene-specific functionality.
     */
    scene: Phaser.Scene | null;
    
    /**
     * Cursor keys (arrow keys) input reference.
     * Used for player movement and UI navigation.
     */
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
    
    /**
     * WASD keys input reference.
     * Alternative movement controls for player.
     */
    wasdKeys: WASDKeys | null;
    
    // ========================================
    // UI Elements
    // ========================================
    
    /**
     * Text object displaying the player's current level.
     * Updated by PlayerStatsSystem when player levels up.
     */
    levelText: Phaser.GameObjects.Text | null;
    
    // ========================================
    // Player State
    // ========================================
    
    /**
     * Cooldown timer for size changes in milliseconds.
     * Prevents rapid size transitions that could break gameplay.
     */
    sizeChangeTimer: number;
    
    /**
     * Current size of the player ('small' or 'normal').
     * Affects which scene is active and player capabilities.
     */
    playerSize: PlayerSize;
    
    // ========================================
    // Scene Management
    // ========================================
    
    /**
     * The key of the currently active scene.
     * Used to determine scene transitions and restore state.
     */
    currentSceneKey: SceneKey;
    
    /**
     * Saved player positions for each scene.
     * Allows seamless position restoration when returning to a scene.
     */
    savedPositions: Record<SceneKey, SavedPosition>;
    
    /**
     * Saved enemy states for each scene.
     * Preserves enemy positions, health, and state across scene transitions.
     */
    savedEnemies: Record<SceneKey, SavedEnemy[]>;
    
    // ========================================
    // Game Configuration
    // ========================================
    
    /**
     * Flag indicating whether difficulty has been initialized.
     * Ensures difficulty is only set once at game start.
     */
    difficultyInitialized: boolean;
    
    /**
     * Current level number for map progression.
     * Affects enemy stats and spawn patterns.
     */
    currentMapLevel: number;
    
    // ========================================
    // Function References
    // ========================================
    
    /**
     * Function reference to spawn enemy.
     * Set by EnemyManager to allow cross-module enemy spawning.
     */
    spawnEnemyFunc: ((scene: Phaser.Scene, x: number, y: number, enemyType?: string) => Enemy) | null;

    /**
     * Initialize the GameState singleton.
     * Sets all properties to their default values.
     * 
     * Properties are initialized as null for object references that will
     * be set by scenes and managers during runtime. Primitive values and
     * configurations are set to their default states.
     */
    constructor() {
        // Core game objects
        this.player = null;
        this.enemies = null;
        this.projectiles = null;
        this.xpOrbs = null;
        this.platforms = null;
        
        // Scene and input references
        this.scene = null;
        this.cursors = null;
        this.wasdKeys = null;
        
        // UI elements
        this.levelText = null;
        
        // Timers and state
        this.sizeChangeTimer = 0;
        this.playerSize = 'normal';
        
        // Scene management
        this.currentSceneKey = 'MainGameScene';
        this.savedPositions = {
            BootScene: { x: 100, y: 650 },
            MenuScene: { x: 100, y: 650 },
            MainGameScene: { x: 100, y: 650 },
            MicroScene: { x: 100, y: 650 },
            UnderwaterScene: { x: 100, y: 650 },
            UnderwaterMicroScene: { x: 100, y: 650 }
        };
        this.savedEnemies = {
            BootScene: [],
            MenuScene: [],
            MainGameScene: [],
            MicroScene: [],
            UnderwaterScene: [],
            UnderwaterMicroScene: []
        };
        
        // Difficulty
        this.difficultyInitialized = false;
        
        // Level progression
        this.currentMapLevel = 1;
        
        // Function references
        this.spawnEnemyFunc = null;
    }
    
    // ========================================
    // Public Methods
    // ========================================
    
    /**
     * Validate that critical game state is initialized.
     * 
     * Checks that essential game objects (player and scene) are set.
     * Used by managers and systems to verify state before operations.
     * 
     * @returns True if player and scene are initialized, false otherwise
     */
    isInitialized(): boolean {
        return this.player !== null && 
               this.scene !== null;
    }
}

// Export singleton instance
export default new GameState();
