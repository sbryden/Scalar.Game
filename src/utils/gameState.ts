/**
 * Central Game State Manager
 * Single source of truth for all shared game state.
 * Eliminates the need for setter functions across modules.
 */
import Phaser from 'phaser';
import type { Player, Enemy, Projectile, XPOrb, WASDKeys, SavedPosition, SavedEnemy, PlayerSize, SceneKey } from '../types/game';

class GameState {
    // Core game objects
    player: Player | null;
    enemies: Phaser.Physics.Arcade.Group | null;
    projectiles: Phaser.Physics.Arcade.Group | null;
    xpOrbs: Phaser.Physics.Arcade.Group | null;
    platforms: Phaser.Physics.Arcade.StaticGroup | null;
    
    // Scene and input references
    scene: Phaser.Scene | null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
    wasdKeys: WASDKeys | null;
    
    // UI elements
    levelText: Phaser.GameObjects.Text | null;
    
    // Timers and state
    sizeChangeTimer: number;
    playerSize: PlayerSize;
    
    // Scene management
    currentSceneKey: SceneKey;
    savedPositions: Record<SceneKey, SavedPosition>;
    savedEnemies: Record<SceneKey, SavedEnemy[]>;
    
    // Difficulty
    difficultyInitialized: boolean;
    
    // Level progression
    currentMapLevel: number;
    
    // Function references
    spawnEnemyFunc: ((scene: Phaser.Scene, x: number, y: number, enemyType?: string) => Enemy) | null;

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
    
    // Helper method to validate state initialization
    isInitialized(): boolean {
        return this.player !== null && 
               this.scene !== null;
    }
}

// Export singleton instance
export default new GameState();
