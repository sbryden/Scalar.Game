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
 * 
 * Note: This mutates the imported config object at runtime. 
 * Code that caches config values before this is called may see stale values.
 * Ensure this is called early in the boot sequence.
 */
export function applyStoredConfig(): void {
    try {
        const stored = localStorage.getItem('gameConfig');
        if (!stored) return;
        
        const configData = JSON.parse(stored);
        
        // Validate that configData is an object
        if (typeof configData !== 'object' || configData === null || Array.isArray(configData)) {
            console.error('Invalid config data format in localStorage');
            return;
        }
        
        // Apply each stored value to the config object
        for (const [path, value] of Object.entries(configData)) {
            // Validate value type
            if (typeof value !== 'number' && typeof value !== 'string') {
                console.warn(`Skipping invalid value type for ${path}:`, typeof value);
                continue;
            }
            
            // Validate number values are in reasonable range
            if (typeof value === 'number') {
                if (!Number.isFinite(value)) {
                    console.warn(`Skipping non-finite number for ${path}:`, value);
                    continue;
                }
            }
            
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
function setConfigValue(path: string, value: number | string): void {
    const parts = path.split('.');
    let obj: Record<string, any> = config as Record<string, any>;
    
    // Navigate to the parent object
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part && obj[part] !== undefined) {
            obj = obj[part] as Record<string, any>;
        } else {
            console.warn(`Config path does not exist; skipping stored value for ${path} (missing part: ${part})`);
            return;
        }
    }
    
    // Set the value
    const lastKey = parts[parts.length - 1];
    if (lastKey && obj[lastKey] !== undefined) {
        obj[lastKey] = value;
    } else {
        console.warn(`Config path does not exist; skipping stored value for ${path} (missing key: ${lastKey})`);
    }
}

/**
 * Check if custom config is active
 */
export function hasCustomConfig(): boolean {
    const stored = localStorage.getItem('gameConfig');
    return stored !== null && stored !== '{}';
}
