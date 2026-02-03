/**
 * Service Locator
 * Centralized dependency injection container for managers and systems.
 * Breaks circular dependencies by providing a single point of access.
 * 
 * @description
 * The ServiceLocator provides a runtime registry for singleton services,
 * enabling loose coupling between modules. Services are registered in
 * BootScene during game initialization.
 * 
 * @example Registration (in BootScene)
 * ```typescript
 * Services.register('enemyManager', enemyManager);
 * Services.initialize(); // Call after all registrations
 * ```
 * 
 * @example Retrieval (type-safe)
 * ```typescript
 * import type { EnemyManager } from '../managers/EnemyManager';
 * const enemyManager = Services.get<EnemyManager>('enemyManager');
 * ```
 * 
 * @example Safe retrieval (returns undefined if not registered)
 * ```typescript
 * const manager = Services.tryGet<EnemyManager>('enemyManager');
 * if (manager) { manager.spawnEnemy(...); }
 * ```
 * 
 * @example Testing (reset between tests)
 * ```typescript
 * beforeEach(() => Services.reset());
 * ```
 */

type ServiceKey = 
    // Managers
    | 'playerManager'
    | 'enemyManager'
    | 'projectileManager'
    | 'xpOrbManager'
    | 'companionManager'
    // Systems
    | 'combatSystem'
    | 'spawnSystem'
    | 'playerStatsSystem'
    | 'staminaSystem'
    | 'fuelSystem'
    | 'stageProgressionSystem'
    | 'stageStatsTracker'
    | 'magnetismSystem';

class ServiceLocator {
    private services: Map<ServiceKey, unknown> = new Map();
    private initialized = false;

    /**
     * Register a service instance
     */
    register<T>(key: ServiceKey, service: T): void {
        if (this.services.has(key)) {
            console.warn(`Service '${key}' is being re-registered`);
        }
        this.services.set(key, service);
    }

    /**
     * Get a registered service
     * @throws Error if service is not registered
     */
    get<T>(key: ServiceKey): T {
        const service = this.services.get(key);
        if (service === undefined) {
            throw new Error(`Service '${key}' not registered. Did you forget to call Services.initialize()?`);
        }
        return service as T;
    }

    /**
     * Check if a service is registered
     */
    has(key: ServiceKey): boolean {
        return this.services.has(key);
    }

    /**
     * Get a service if registered, otherwise return undefined
     */
    tryGet<T>(key: ServiceKey): T | undefined {
        return this.services.get(key) as T | undefined;
    }

    /**
     * Initialize all core services
     * Called from BootScene after game starts
     */
    initialize(): void {
        if (this.initialized) {
            console.warn('ServiceLocator already initialized');
            return;
        }
        this.initialized = true;
    }

    /**
     * Reset all services (useful for testing or game restart)
     */
    reset(): void {
        this.services.clear();
        this.initialized = false;
    }

    /**
     * Check if services are initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

// Export singleton instance
export const Services = new ServiceLocator();

// Export type for external use
export type { ServiceKey };
