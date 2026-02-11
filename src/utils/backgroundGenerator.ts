/**
 * Background Generator Utility
 * Generates dynamic, randomized backgrounds for different scene types
 * Uses seeded RNG for deterministic variation per stage
 */

import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';

/**
 * Seeded random number generator for deterministic backgrounds
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    /**
     * Generate next random value between 0 and 1
     * @returns Random float in range [0, 1)
     */
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    /**
     * Generate random float between min and max
     * @param min Minimum value (inclusive)
     * @param max Maximum value (exclusive)
     * @returns Random float in range [min, max)
     */
    between(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    /**
     * Generate random integer between min and max
     * @param min Minimum value (inclusive)
     * @param max Maximum value (inclusive)
     * @returns Random integer in range [min, max]
     */
    integer(min: number, max: number): number {
        return Math.min(max, Math.floor(this.between(min, max + 1)));
    }
}

/**
 * Calculate luminance from hex color to classify dark/light
 */
function getLuminance(hex: number): number {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate random dark color variations
 */
function randomizeDarkColor(baseColor: number, rng: SeededRandom): number {
    const lum = getLuminance(baseColor);
    if (lum > 120) {
        // Base color is too light, darken it
        const r = Math.max(20, ((baseColor >> 16) & 0xFF) * 0.4);
        const g = Math.max(20, ((baseColor >> 8) & 0xFF) * 0.4);
        const b = Math.max(20, (baseColor & 0xFF) * 0.4);
        return (((r << 16) | (g << 8) | b) >>> 0);
    }
    // Slightly vary the dark color
    const variation = rng.between(-20, 20);
    const r = Math.max(0, Math.min(255, ((baseColor >> 16) & 0xFF) + variation));
    const g = Math.max(0, Math.min(255, ((baseColor >> 8) & 0xFF) + variation));
    const b = Math.max(0, Math.min(255, (baseColor & 0xFF) + variation));
    return (((r << 16) | (g << 8) | b) >>> 0);
}

/**
 * Generate random light/medium color variations
 */
function randomizeLightColor(baseColor: number, rng: SeededRandom): number {
    const lum = getLuminance(baseColor);
    if (lum < 100) {
        // Base color is too dark, lighten it
        const r = Math.min(255, ((baseColor >> 16) & 0xFF) + 100);
        const g = Math.min(255, ((baseColor >> 8) & 0xFF) + 100);
        const b = Math.min(255, (baseColor & 0xFF) + 100);
        return (((r << 16) | (g << 8) | b) >>> 0);
    }
    // Slightly vary the light color
    const variation = rng.between(-30, 30);
    const r = Math.max(100, Math.min(255, ((baseColor >> 16) & 0xFF) + variation));
    const g = Math.max(100, Math.min(255, ((baseColor >> 8) & 0xFF) + variation));
    const b = Math.max(100, Math.min(255, (baseColor & 0xFF) + variation));
    return (((r << 16) | (g << 8) | b) >>> 0);
}

// Sky color palettes for regular (land) scenes (5 variations)
const SKY_PALETTES = [
    { name: 'Sky Blue', base: 0x87CEEB, grid: 0x4DA6D6 },
    { name: 'Soft Cyan', base: 0x9FD8E1, grid: 0x5EB8C8 },
    { name: 'Light Azure', base: 0xA0D2EB, grid: 0x60B2DB },
    { name: 'Pale Sky', base: 0xB4D7ED, grid: 0x74B7DD },
    { name: 'Morning Sky', base: 0xC2E0F4, grid: 0x82C0E4 },
];

// Quantum realm palettes for micro scenes
const QUANTUM_PALETTES = [
    { 
        name: 'Purple Void',
        base: 0x2D1B3D,
        accent: 0x5A3D6B,
        particle: 0x8B4F8B
    },
    {
        name: 'Magenta Matrix',
        base: 0x2A1838,
        accent: 0x5C2D6B,
        particle: 0x9B4DA0
    },
    {
        name: 'Indigo Depths',
        base: 0x1E1B3D,
        accent: 0x3D3D6B,
        particle: 0x6B5F9B
    },
    {
        name: 'Violet Realm',
        base: 0x331D45,
        accent: 0x5D3A75,
        particle: 0x8D5AA5
    },
    {
        name: 'Dark Plum',
        base: 0x291A33,
        accent: 0x4A3550,
        particle: 0x7A5580
    },
];

// Underwater palettes for regular underwater scenes (5 variations)
const UNDERWATER_PALETTES = [
    {
        name: 'Deep Ocean',
        baseTop: 0x0A3D62,
        baseBottom: 0x1B6CA8,
        ray: 0x2E86AB,
        kelp: 0x1B4D3E
    },
    {
        name: 'Azure Depths',
        baseTop: 0x0C4A6E,
        baseBottom: 0x1E7AB0,
        ray: 0x3094BB,
        kelp: 0x1C5740
    },
    {
        name: 'Cerulean Sea',
        baseTop: 0x0E5576,
        baseBottom: 0x2088B8,
        ray: 0x32A2C3,
        kelp: 0x1D6142
    },
    {
        name: 'Crystal Waters',
        baseTop: 0x0D4C70,
        baseBottom: 0x1F74AC,
        ray: 0x3090B7,
        kelp: 0x1E5943
    },
    {
        name: 'Midnight Blue',
        baseTop: 0x0A4268,
        baseBottom: 0x1A6AA5,
        ray: 0x2D88AD,
        kelp: 0x1A4C3C
    },
];

// Underwater micro palettes (5 variations)
const UNDERWATER_MICRO_PALETTES = [
    {
        name: 'Plankton Blue',
        baseTop: 0x0B5563,
        baseBottom: 0x0E7490,
        ray: 0x06B6D4,
        plankton: 0x22D3EE,
        cluster: 0x34D399
    },
    {
        name: 'Teal Current',
        baseTop: 0x0D5F6E,
        baseBottom: 0x107E9A,
        ray: 0x08C0DE,
        plankton: 0x2CD9F2,
        cluster: 0x3AD9A3
    },
    {
        name: 'Aqua Micro',
        baseTop: 0x0C5A68,
        baseBottom: 0x0F7895,
        ray: 0x07BBD9,
        plankton: 0x26D7F0,
        cluster: 0x38D7A0
    },
    {
        name: 'Cyan Depths',
        baseTop: 0x0A6170,
        baseBottom: 0x0D809D,
        ray: 0x05C2E0,
        plankton: 0x20DBF4,
        cluster: 0x32DBA5
    },
    {
        name: 'Turquoise Flow',
        baseTop: 0x0C5D6A,
        baseBottom: 0x0F7C98,
        ray: 0x07BEDB,
        plankton: 0x24D5EF,
        cluster: 0x36D9A2
    },
];

/**
 * Generates a sky background for regular/land scenes
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Stage seed for deterministic variation (1-5 variations)
 */
export function generateSkyBackground(scene: Phaser.Scene, seed?: number, textureKey?: string, textureOnly?: boolean): void {
    const effectiveSeed = seed !== undefined ? seed : 1;
    const rng = new SeededRandom(effectiveSeed * 12345); // Different multiplier per scene type for variation
    const key = textureKey ?? 'background';
    
    // Select palette based on stage
    const basePalette = SKY_PALETTES[effectiveSeed % SKY_PALETTES.length];
    if (!basePalette) return;
    
    // Randomize colors (light/medium for sky)
    const palette = {
        base: randomizeLightColor(basePalette.base, rng),
        grid: randomizeLightColor(basePalette.grid, rng)
    };
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Base sky with subtle gradient
    bgGraphics.fillGradientStyle(palette.base, palette.base, palette.grid, palette.grid, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add distant mountains in background
    bgGraphics.fillStyle(0x4A5568, 0.3);
    for (let x = 0; x < WORLD_WIDTH; x += 400) {
        const mountainHeight = 200 + rng.between(0, 150);
        bgGraphics.beginPath();
        bgGraphics.moveTo(x, WORLD_HEIGHT);
        bgGraphics.lineTo(x + 150, WORLD_HEIGHT - mountainHeight);
        bgGraphics.lineTo(x + 300, WORLD_HEIGHT - mountainHeight * 0.6);
        bgGraphics.lineTo(x + 400, WORLD_HEIGHT);
        bgGraphics.closePath();
        bgGraphics.fillPath();
    }
    
    // Add floating clouds
    bgGraphics.fillStyle(0xFFFFFF, 0.4);
    for (let i = 0; i < 15; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = 50 + rng.between(0, 200);
        const size = 40 + rng.between(0, 60);
        // Draw puffy cloud shape
        bgGraphics.fillCircle(x, y, size);
        bgGraphics.fillCircle(x + size * 0.7, y, size * 0.8);
        bgGraphics.fillCircle(x - size * 0.7, y, size * 0.8);
        bgGraphics.fillCircle(x + size * 0.35, y - size * 0.4, size * 0.6);
    }
    
    // Add small birds in the distance
    bgGraphics.lineStyle(2, 0x1F2937, 0.5);
    for (let i = 0; i < 20; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = 100 + rng.between(0, 150);
        const wingSpan = 8 + rng.between(0, 12);
        // Simple V-shape bird
        bgGraphics.beginPath();
        bgGraphics.moveTo(x - wingSpan, y);
        bgGraphics.lineTo(x, y - wingSpan * 0.4);
        bgGraphics.lineTo(x + wingSpan, y);
        bgGraphics.strokePath();
    }
    
    // Add subtle grid overlay
    bgGraphics.lineStyle(1, palette.grid, 0.15);
    for (let i = 0; i < WORLD_WIDTH; i += 100) {
        bgGraphics.lineBetween(i, 0, i, WORLD_HEIGHT);
    }
    for (let i = 0; i < WORLD_HEIGHT; i += 100) {
        bgGraphics.lineBetween(0, i, WORLD_WIDTH, i);
    }
    
    bgGraphics.generateTexture(key, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    if (!textureOnly) {
        scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, key)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
}

/**
 * Generates a quantum realm background for micro scenes
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Stage seed for deterministic variation (1-5 variations)
 */
export function generateQuantumBackground(scene: Phaser.Scene, seed?: number, textureKey?: string, textureOnly?: boolean): void {
    const effectiveSeed = seed !== undefined ? seed : 1;
    const rng = new SeededRandom(effectiveSeed * 23456); // Different multiplier per scene type for variation
    const key = textureKey ?? 'microBackground';
    
    // Select palette based on stage
    const basePalette = QUANTUM_PALETTES[effectiveSeed % QUANTUM_PALETTES.length];
    if (!basePalette) return;
    
    // Randomize colors (dark for micro quantum scenes)
    const palette = {
        base: randomizeDarkColor(basePalette.base, rng),
        accent: randomizeDarkColor(basePalette.accent, rng),
        particle: randomizeDarkColor(basePalette.particle, rng)
    };
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Base quantum field with gradient
    bgGraphics.fillGradientStyle(palette.base, palette.base, palette.accent, palette.accent, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add neural network connections
    bgGraphics.lineStyle(1, palette.particle, 0.3);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 40; i++) {
        nodes.push({
            x: rng.between(0, WORLD_WIDTH),
            y: rng.between(0, WORLD_HEIGHT)
        });
    }
    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y);
            if (dist < 250) {
                bgGraphics.lineBetween(nodes[i]!.x, nodes[i]!.y, nodes[j]!.x, nodes[j]!.y);
            }
        }
    }
    
    // Draw nodes
    bgGraphics.fillStyle(palette.particle, 0.6);
    nodes.forEach(node => {
        bgGraphics.fillCircle(node.x, node.y, 4);
    });
    
    // Add DNA helix-like structures
    bgGraphics.lineStyle(3, palette.accent, 0.4);
    for (let x = 100; x < WORLD_WIDTH; x += 400) {
        bgGraphics.beginPath();
        bgGraphics.moveTo(x, 0);
        for (let y = 0; y < WORLD_HEIGHT; y += 10) {
            const wave = Math.sin(y / 50) * 30;
            bgGraphics.lineTo(x + wave, y);
        }
        bgGraphics.strokePath();
        
        // Second helix strand
        bgGraphics.beginPath();
        bgGraphics.moveTo(x, 0);
        for (let y = 0; y < WORLD_HEIGHT; y += 10) {
            const wave = Math.sin(y / 50 + Math.PI) * 30;
            bgGraphics.lineTo(x + wave, y);
        }
        bgGraphics.strokePath();
    }
    
    // Add quantum membrane-like patterns
    bgGraphics.lineStyle(2, palette.accent, 0.3);
    for (let i = 0; i < WORLD_WIDTH; i += 150) {
        for (let j = 0; j < WORLD_HEIGHT; j += 150) {
            const offsetX = (j / 150) % 2 === 0 ? 75 : 0;
            bgGraphics.strokeCircle(i + offsetX, j, 60);
        }
    }
    
    // Add glowing organelles with halos
    bgGraphics.fillStyle(palette.particle, 0.2);
    for (let i = 0; i < 50; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const radius = 10 + rng.between(0, 20);
        // Outer glow
        bgGraphics.fillCircle(x, y, radius * 1.5);
    }
    bgGraphics.fillStyle(palette.particle, 0.4);
    for (let i = 0; i < 50; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const radius = 10 + rng.between(0, 20);
        // Core
        bgGraphics.fillCircle(x, y, radius);
    }
    
    bgGraphics.generateTexture(key, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    if (!textureOnly) {
        scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, key)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
}

/**
 * Generates an underwater background
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Stage seed for deterministic variation (1-5 variations)
 */
export function generateUnderwaterBackground(scene: Phaser.Scene, seed?: number, textureKey?: string, textureOnly?: boolean): void {
    const effectiveSeed = seed !== undefined ? seed : 1;
    const rng = new SeededRandom(effectiveSeed * 34567); // Different multiplier per scene type for variation
    const key = textureKey ?? 'underwaterBackground';
    
    // Select palette based on stage
    const basePalette = UNDERWATER_PALETTES[effectiveSeed % UNDERWATER_PALETTES.length];
    if (!basePalette) return;
    
    // Randomize colors (medium/dark for underwater)
    const palette = {
        baseTop: randomizeDarkColor(basePalette.baseTop, rng),
        baseBottom: randomizeDarkColor(basePalette.baseBottom, rng),
        ray: randomizeDarkColor(basePalette.ray, rng),
        kelp: randomizeDarkColor(basePalette.kelp, rng)
    };
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Deep blue water gradient
    bgGraphics.fillGradientStyle(palette.baseTop, palette.baseTop, palette.baseBottom, palette.baseBottom, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add coral formations on the bottom
    bgGraphics.fillStyle(palette.kelp, 0.5);
    for (let x = 50; x < WORLD_WIDTH; x += 200) {
        const coralHeight = 80 + rng.between(0, 120);
        const branches = 3 + rng.integer(0, 3);
        for (let b = 0; b < branches; b++) {
            const angle = (b / branches) * Math.PI - Math.PI / 2;
            const branchLength = coralHeight * (0.5 + rng.between(0, 0.5));
            bgGraphics.fillCircle(
                x + Math.cos(angle) * branchLength,
                WORLD_HEIGHT - Math.sin(angle) * branchLength,
                8 + rng.between(0, 12)
            );
        }
    }
    
    // Add schools of distant fish
    bgGraphics.fillStyle(0x1E40AF, 0.3);
    for (let school = 0; school < 5; school++) {
        const schoolX = rng.between(0, WORLD_WIDTH);
        const schoolY = 100 + rng.between(0, 400);
        for (let f = 0; f < 15; f++) {
            const offsetX = (rng.next() - 0.5) * 100;
            const offsetY = (rng.next() - 0.5) * 60;
            const fishSize = 6 + rng.between(0, 10);
            // Simple fish shape
            bgGraphics.fillEllipse(schoolX + offsetX, schoolY + offsetY, fishSize, fishSize * 0.6);
        }
    }
    
    // Add light rays from above (god rays)
    bgGraphics.lineStyle(50, palette.ray, 0.12);
    for (let i = 0; i < WORLD_WIDTH; i += 200) {
        bgGraphics.lineBetween(i, 0, i + 120, WORLD_HEIGHT);
    }
    
    // Add scattered bubbles
    bgGraphics.fillStyle(0xFFFFFF, 0.2);
    bgGraphics.lineStyle(1, 0xFFFFFF, 0.3);
    for (let i = 0; i < 40; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const size = 3 + rng.between(0, 8);
        bgGraphics.fillCircle(x, y, size);
        bgGraphics.strokeCircle(x, y, size);
    }
    
    // Add kelp/seaweed decorations
    bgGraphics.lineStyle(8, palette.kelp, 0.6);
    for (let x = 100; x < WORLD_WIDTH; x += 300) {
        // Draw wavy kelp
        bgGraphics.beginPath();
        bgGraphics.moveTo(x, WORLD_HEIGHT - 50);
        for (let y = WORLD_HEIGHT - 50; y > 200; y -= 20) {
            const wave = Math.sin(y / 30) * 15;
            bgGraphics.lineTo(x + wave, y);
        }
        bgGraphics.strokePath();
    }
    
    bgGraphics.generateTexture(key, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    if (!textureOnly) {
        scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, key)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
}

/**
 * Generates an underwater micro background
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Stage seed for deterministic variation (1-5 variations)
 */
export function generateUnderwaterMicroBackground(scene: Phaser.Scene, seed?: number, textureKey?: string, textureOnly?: boolean): void {
    const effectiveSeed = seed !== undefined ? seed : 1;
    const rng = new SeededRandom(effectiveSeed * 45678); // Different multiplier per scene type for variation
    const key = textureKey ?? 'underwaterMicroBackground';
    
    // Select palette based on stage
    const basePalette = UNDERWATER_MICRO_PALETTES[effectiveSeed % UNDERWATER_MICRO_PALETTES.length];
    if (!basePalette) return;
    
    // Randomize colors (medium/dark for underwater micro)
    const palette = {
        baseTop: randomizeDarkColor(basePalette.baseTop, rng),
        baseBottom: randomizeDarkColor(basePalette.baseBottom, rng),
        ray: randomizeDarkColor(basePalette.ray, rng),
        plankton: randomizeDarkColor(basePalette.plankton, rng),
        cluster: randomizeDarkColor(basePalette.cluster, rng)
    };
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Deep blue-green water
    bgGraphics.fillGradientStyle(palette.baseTop, palette.baseTop, palette.baseBottom, palette.baseBottom, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add organic membrane structures
    bgGraphics.lineStyle(4, palette.cluster, 0.25);
    for (let i = 0; i < 10; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const size = 100 + rng.between(0, 200);
        // Draw organic blob shape
        bgGraphics.beginPath();
        bgGraphics.moveTo(x, y);
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.3) {
            const wobble = 0.8 + rng.between(0, 0.4);
            const radius = size * wobble;
            bgGraphics.lineTo(
                x + Math.cos(angle) * radius,
                y + Math.sin(angle) * radius
            );
        }
        bgGraphics.closePath();
        bgGraphics.strokePath();
    }
    
    // Add flowing water currents
    bgGraphics.lineStyle(2, palette.ray, 0.15);
    for (let y = 50; y < WORLD_HEIGHT; y += 100) {
        bgGraphics.beginPath();
        bgGraphics.moveTo(0, y);
        for (let x = 0; x < WORLD_WIDTH; x += 20) {
            const wave = Math.sin(x / 80 + y / 60) * 15;
            bgGraphics.lineTo(x, y + wave);
        }
        bgGraphics.strokePath();
    }
    
    // Add light diffusion patterns
    bgGraphics.lineStyle(30, palette.ray, 0.1);
    for (let i = 0; i < WORLD_WIDTH; i += 180) {
        bgGraphics.lineBetween(i, 0, i + 80, WORLD_HEIGHT);
    }
    
    // Add bioluminescent plankton with glow effect
    bgGraphics.fillStyle(palette.plankton, 0.15);
    for (let i = 0; i < 60; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const size = 8 + rng.between(0, 15);
        // Glow halo
        bgGraphics.fillCircle(x, y, size * 2);
    }
    bgGraphics.fillStyle(palette.plankton, 0.4);
    for (let i = 0; i < 60; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const size = 8 + rng.between(0, 15);
        // Draw plankton-like shapes
        bgGraphics.fillCircle(x, y, size);
        bgGraphics.fillCircle(x - size/3, y + size/3, size * 0.5);
        bgGraphics.fillCircle(x + size/3, y + size/3, size * 0.5);
    }
    
    // Add microorganism clusters with variety
    bgGraphics.fillStyle(palette.cluster, 0.3);
    for (let i = 0; i < 30; i++) {
        const x = rng.between(0, WORLD_WIDTH);
        const y = rng.between(0, WORLD_HEIGHT);
        const clusterSize = 3 + rng.integer(0, 4);
        const clusterType = rng.integer(0, 2);
        
        for (let j = 0; j < clusterSize; j++) {
            const offsetX = (rng.next() - 0.5) * 40;
            const offsetY = (rng.next() - 0.5) * 40;
            const size = 5 + rng.between(0, 8);
            
            if (clusterType === 0) {
                // Circular clusters
                bgGraphics.fillCircle(x + offsetX, y + offsetY, size);
            } else if (clusterType === 1) {
                // Star-shaped clusters - using circle instead as fillStar is not standard
                bgGraphics.fillCircle(x + offsetX, y + offsetY, size);
            } else {
                // Oval clusters
                bgGraphics.fillEllipse(x + offsetX, y + offsetY, size * 1.5, size);
            }
        }
    }
    
    bgGraphics.generateTexture(key, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    if (!textureOnly) {
        scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, key)
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
    }
}
