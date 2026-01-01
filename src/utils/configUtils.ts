/**
 * Config Utilities
 * Handles loading and applying custom configuration values from localStorage
 */
import * as config from '../config';

/**
 * Get a config value, checking localStorage first, then falling back to default
 */
export function getConfigValue<T>(path: string, defaultValue: T): T {
    try {
        const stored = localStorage.getItem('gameConfig');
        if (stored) {
            const configData = JSON.parse(stored);
            if (configData[path] !== undefined) {
                return configData[path] as T;
            }
        }
    } catch (e) {
        console.error('Error reading stored config:', e);
    }
    return defaultValue;
}

/**
 * Apply stored configuration values to the config object
 * This should be called before the game starts
 */
export function applyStoredConfig(): void {
    try {
        const stored = localStorage.getItem('gameConfig');
        if (!stored) return;
        
        const configData = JSON.parse(stored);
        
        // Apply each stored value to the config object
        for (const [path, value] of Object.entries(configData)) {
            setConfigValue(path, value);
        }
        
        console.log('Custom configuration applied');
    } catch (e) {
        console.error('Error applying stored config:', e);
    }
}

/**
 * Set a configuration value by path (e.g., "WORLD_WIDTH" or "SIZE_CONFIG.small.scale")
 */
function setConfigValue(path: string, value: any): void {
    const parts = path.split('.');
    let obj: any = config;
    
    // Navigate to the parent object
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part && obj[part] !== undefined) {
            obj = obj[part];
        } else {
            return; // Path doesn't exist
        }
    }
    
    // Set the value
    const lastKey = parts[parts.length - 1];
    if (lastKey && obj[lastKey] !== undefined) {
        obj[lastKey] = value;
    }
}

/**
 * Check if custom config is active
 */
export function hasCustomConfig(): boolean {
    const stored = localStorage.getItem('gameConfig');
    return stored !== null && stored !== '{}';
}
