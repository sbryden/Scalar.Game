/**
 * Central Game State Manager
 * Single source of truth for all shared game state.
 * Eliminates the need for setter functions across modules.
 */
class GameState {
    // Core game objects
    player: any;
    enemies: any;
    projectiles: any;
    xpOrbs: any;
    platforms: any;
    
    // Scene and input references
    scene: any;
    cursors: any;
    wasdKeys: any;
    
    // UI elements
    levelText: any;
    
    // Timers and state
    sizeChangeTimer: number;
    playerSize: string;
    
    // Scene management
    currentSceneKey: string;
    savedPositions: any;
    savedEnemies: any;
    
    // Difficulty
    difficultyInitialized: boolean;
    
    // Function references
    spawnEnemyFunc: any;

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
            MainGameScene: { x: 100, y: 650 },
            MicroScene: { x: 100, y: 650 },
            UnderwaterScene: { x: 100, y: 650 },
            UnderwaterMicroScene: { x: 100, y: 650 }
        };
        this.savedEnemies = {
            MainGameScene: [],
            MicroScene: [],
            UnderwaterScene: [],
            UnderwaterMicroScene: []
        };
        
        // Difficulty
        this.difficultyInitialized = false;
        
        // Function references
        this.spawnEnemyFunc = null;
    }
    
    // Helper method to validate state initialization
    isInitialized() {
        return this.player !== null && 
               this.scene !== null;
    }
}

// Export singleton instance
export default new GameState();
