/**
 * Game Context
 * Typed state container with explicit access patterns.
 * Replaces the legacy gameState with better encapsulation.
 */
import Phaser from 'phaser';
import type { Player, Enemy, Companion, WASDKeys, SavedPosition, SavedEnemy, PlayerSize, SceneKey } from '../types/game';

/**
 * Default positions for each scene
 */
const DEFAULT_POSITION: SavedPosition = { x: 100, y: 650 };

/**
 * All scene keys for initialization
 */
const ALL_SCENE_KEYS: SceneKey[] = [
    'BootScene',
    'MenuScene', 
    'MainGameScene',
    'MicroScene',
    'MainGameMacroScene',
    'UnderwaterScene',
    'UnderwaterMicroScene',
    'UnderwaterMacroScene'
];

/**
 * Game Context - Central state container
 * 
 * Usage patterns:
 * - Read: gameContext.player, gameContext.currentSceneKey
 * - Write: gameContext.setPlayer(player), gameContext.setCurrentScene('MainGameScene')
 * - Scene data: gameContext.getSavedPosition('MainGameScene')
 */
class GameContext {
    // ============================================
    // PRIVATE STATE
    // ============================================
    
    private _player: Player | null = null;
    private _enemies: Phaser.Physics.Arcade.Group | null = null;
    private _projectiles: Phaser.Physics.Arcade.Group | null = null;
    private _xpOrbs: Phaser.Physics.Arcade.Group | null = null;
    private _platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
    private _companions: Companion[] = [];
    private _scene: Phaser.Scene | null = null;
    private _cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private _wasdKeys: WASDKeys | null = null;
    private _levelText: Phaser.GameObjects.Text | null = null;
    private _sizeChangeTimer: number = 0;
    private _playerSize: PlayerSize = 'normal';
    private _currentSceneKey: SceneKey = 'MainGameScene';
    private _savedPositions: Record<SceneKey, SavedPosition>;
    private _savedEnemies: Record<SceneKey, SavedEnemy[]>;
    private _difficultyInitialized: boolean = false;
    private _currentMapLevel: number = 1;

    constructor() {
        // Initialize saved positions for all scenes
        this._savedPositions = {} as Record<SceneKey, SavedPosition>;
        this._savedEnemies = {} as Record<SceneKey, SavedEnemy[]>;
        
        for (const key of ALL_SCENE_KEYS) {
            this._savedPositions[key] = { ...DEFAULT_POSITION };
            this._savedEnemies[key] = [];
        }
    }

    // ============================================
    // GETTERS - Read access
    // ============================================

    get player(): Player | null { return this._player; }
    get enemies(): Phaser.Physics.Arcade.Group | null { return this._enemies; }
    get projectiles(): Phaser.Physics.Arcade.Group | null { return this._projectiles; }
    get xpOrbs(): Phaser.Physics.Arcade.Group | null { return this._xpOrbs; }
    get platforms(): Phaser.Physics.Arcade.StaticGroup | null { return this._platforms; }
    get companions(): Companion[] { return this._companions; }
    get scene(): Phaser.Scene | null { return this._scene; }
    get cursors(): Phaser.Types.Input.Keyboard.CursorKeys | null { return this._cursors; }
    get wasdKeys(): WASDKeys | null { return this._wasdKeys; }
    get levelText(): Phaser.GameObjects.Text | null { return this._levelText; }
    get sizeChangeTimer(): number { return this._sizeChangeTimer; }
    get playerSize(): PlayerSize { return this._playerSize; }
    get currentSceneKey(): SceneKey { return this._currentSceneKey; }
    get difficultyInitialized(): boolean { return this._difficultyInitialized; }
    get currentMapLevel(): number { return this._currentMapLevel; }

    // Read-only access to saved state maps
    // Note: The Record itself is mutable to allow gameState.savedPositions[key] = value patterns
    get savedPositions(): Record<SceneKey, SavedPosition> { return this._savedPositions; }
    set savedPositions(value: Record<SceneKey, SavedPosition>) { this._savedPositions = value; }
    get savedEnemies(): Record<SceneKey, SavedEnemy[]> { return this._savedEnemies; }
    set savedEnemies(value: Record<SceneKey, SavedEnemy[]>) { this._savedEnemies = value; }

    // ============================================
    // SETTERS - Write access with validation
    // ============================================

    set player(value: Player | null) { this._player = value; }
    set enemies(value: Phaser.Physics.Arcade.Group | null) { this._enemies = value; }
    set projectiles(value: Phaser.Physics.Arcade.Group | null) { this._projectiles = value; }
    set xpOrbs(value: Phaser.Physics.Arcade.Group | null) { this._xpOrbs = value; }
    set platforms(value: Phaser.Physics.Arcade.StaticGroup | null) { this._platforms = value; }
    set companions(value: Companion[]) { this._companions = value; }
    set scene(value: Phaser.Scene | null) { this._scene = value; }
    set cursors(value: Phaser.Types.Input.Keyboard.CursorKeys | null) { this._cursors = value; }
    set wasdKeys(value: WASDKeys | null) { this._wasdKeys = value; }
    set levelText(value: Phaser.GameObjects.Text | null) { this._levelText = value; }
    set sizeChangeTimer(value: number) { this._sizeChangeTimer = Math.max(0, value); }
    set playerSize(value: PlayerSize) { this._playerSize = value; }
    set currentSceneKey(value: SceneKey) { this._currentSceneKey = value; }
    set difficultyInitialized(value: boolean) { this._difficultyInitialized = value; }
    set currentMapLevel(value: number) { this._currentMapLevel = Math.max(1, value); }

    // ============================================
    // SCENE STATE METHODS
    // ============================================

    /**
     * Get saved position for a scene
     */
    getSavedPosition(sceneKey: SceneKey): SavedPosition {
        return this._savedPositions[sceneKey] ?? { ...DEFAULT_POSITION };
    }

    /**
     * Set saved position for a scene
     */
    setSavedPosition(sceneKey: SceneKey, position: SavedPosition): void {
        this._savedPositions[sceneKey] = { ...position };
    }

    /**
     * Get saved enemies for a scene
     */
    getSavedEnemies(sceneKey: SceneKey): SavedEnemy[] {
        return this._savedEnemies[sceneKey] ?? [];
    }

    /**
     * Set saved enemies for a scene
     */
    setSavedEnemies(sceneKey: SceneKey, enemies: SavedEnemy[]): void {
        this._savedEnemies[sceneKey] = [...enemies];
    }

    /**
     * Clear saved enemies for a scene
     */
    clearSavedEnemies(sceneKey: SceneKey): void {
        this._savedEnemies[sceneKey] = [];
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Check if the game context is properly initialized for gameplay
     */
    isInitialized(): boolean {
        return this._player !== null && this._scene !== null;
    }

    /**
     * Reset scene-specific state (call when leaving a scene)
     */
    resetSceneState(): void {
        this._player = null;
        this._enemies = null;
        this._projectiles = null;
        this._xpOrbs = null;
        this._platforms = null;
        this._companions = [];
        this._scene = null;
        this._cursors = null;
        this._wasdKeys = null;
        this._levelText = null;
    }

    /**
     * Full reset (call when returning to main menu)
     */
    fullReset(): void {
        this.resetSceneState();
        this._sizeChangeTimer = 0;
        this._playerSize = 'normal';
        this._difficultyInitialized = false;
        this._currentMapLevel = 1;
        
        // Reset all saved positions and enemies
        for (const key of ALL_SCENE_KEYS) {
            this._savedPositions[key] = { ...DEFAULT_POSITION };
            this._savedEnemies[key] = [];
        }
    }
    
    /**
     * Add a companion to the context
     */
    addCompanion(companion: Companion): void {
        this._companions.push(companion);
    }
    
    /**
     * Remove a companion from the context
     */
    removeCompanion(companion: Companion): void {
        const index = this._companions.indexOf(companion);
        if (index > -1) {
            this._companions.splice(index, 1);
        }
    }
    
    /**
     * Clear all companions
     */
    clearCompanions(): void {
        this._companions = [];
    }
    
    /**
     * Get companion by kind
     */
    getCompanionByKind(kind: string): Companion | undefined {
        return this._companions.find(c => c.companionKind === kind);
    }

}

// Export singleton instance
const gameContext = new GameContext();

// Default export for backward compatibility
export default gameContext;

// Named export for explicit imports
export { gameContext, GameContext };
