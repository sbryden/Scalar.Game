/**
 * Options Configuration
 * Stores user-customizable game parameters
 * Values can be adjusted from the Options menu
 */

export interface GameOptions {
    playerSpeed: number;
    playerJumpHeight: number;
    playerProjectileSpeed: number;
    playerProjectileDamage: number;
    landGravity: number;
    waterGravity: number;
    microLandGravity: number;
    microWaterGravity: number;
    macroLandGravity: number;
    macroWaterGravity: number;
    startingHP: number;
}

// Default values
const DEFAULT_OPTIONS: GameOptions = {
    playerSpeed: 225,
    playerJumpHeight: 200,
    playerProjectileSpeed: 325,
    playerProjectileDamage: 10,
    landGravity: 300,
    waterGravity: 100,
    microLandGravity: 150,
    microWaterGravity: 50,
    macroLandGravity: 450,
    macroWaterGravity: 80,
    startingHP: 100
};

// Current options (loaded from localStorage or defaults)
let currentOptions: GameOptions = { ...DEFAULT_OPTIONS };

// Storage key for localStorage
const STORAGE_KEY = 'scalar_game_options';

/**
 * Load options from localStorage
 */
export function loadOptions(): GameOptions {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to handle new options in updates
            currentOptions = { ...DEFAULT_OPTIONS, ...parsed };
        } else {
            currentOptions = { ...DEFAULT_OPTIONS };
        }
    } catch (error) {
        console.warn('Failed to load options from localStorage:', error);
        currentOptions = { ...DEFAULT_OPTIONS };
    }
    return currentOptions;
}

/**
 * Save options to localStorage
 */
export function saveOptions(options: GameOptions): void {
    try {
        currentOptions = { ...options };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
        console.error('Failed to save options to localStorage:', error);
    }
}

/**
 * Get current options
 */
export function getOptions(): GameOptions {
    return currentOptions;
}

/**
 * Reset options to defaults
 */
export function resetOptions(): GameOptions {
    currentOptions = { ...DEFAULT_OPTIONS };
    saveOptions(currentOptions);
    return currentOptions;
}

/**
 * Get default options
 */
export function getDefaultOptions(): GameOptions {
    return { ...DEFAULT_OPTIONS };
}

// Load options on module initialization
loadOptions();
