/**
 * Background Generator Utility
 * Generates dynamic, randomized backgrounds for different scene types
 */

import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';

// Sky color palettes for regular (land) scenes
const SKY_PALETTES = [
    { name: 'Sky Blue', base: 0x87CEEB, grid: 0x4DA6D6 },
    { name: 'Soft Cyan', base: 0x9FD8E1, grid: 0x5EB8C8 },
    { name: 'Light Azure', base: 0xA0D2EB, grid: 0x60B2DB },
    { name: 'Pale Sky', base: 0xB4D7ED, grid: 0x74B7DD },
    { name: 'Morning Sky', base: 0xC2E0F4, grid: 0x82C0E4 },
    { name: 'Clear Day', base: 0x8DD3F2, grid: 0x4DB3D2 },
    { name: 'Spring Sky', base: 0xA1E4E6, grid: 0x61C4C6 },
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

// Underwater palettes for regular underwater scenes
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
];

// Underwater micro palettes
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
];

/**
 * Generates a sky background for regular/land scenes
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Optional seed (e.g., map level) for consistent palette selection
 */
export function generateSkyBackground(scene: Phaser.Scene, seed?: number): void {
    const palette = seed !== undefined
        ? SKY_PALETTES[seed % SKY_PALETTES.length]
        : Phaser.Utils.Array.GetRandom(SKY_PALETTES);
    
    if (!palette) return;
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    bgGraphics.fillStyle(palette.base, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.lineStyle(1, palette.grid, 0.3);
    for (let i = 0; i < WORLD_WIDTH; i += 100) {
        bgGraphics.lineBetween(i, 0, i, WORLD_HEIGHT);
    }
    for (let i = 0; i < WORLD_HEIGHT; i += 100) {
        bgGraphics.lineBetween(0, i, WORLD_WIDTH, i);
    }
    bgGraphics.generateTexture('background', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'background')
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}

/**
 * Generates a quantum realm background for micro scenes
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Optional seed (e.g., map level) for consistent palette selection
 */
export function generateQuantumBackground(scene: Phaser.Scene, seed?: number): void {
    const palette = seed !== undefined
        ? QUANTUM_PALETTES[seed % QUANTUM_PALETTES.length]
        : Phaser.Utils.Array.GetRandom(QUANTUM_PALETTES);
    
    if (!palette) return;
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Base quantum field color
    bgGraphics.fillStyle(palette.base, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add quantum membrane-like patterns
    bgGraphics.lineStyle(2, palette.accent, 0.4);
    for (let i = 0; i < WORLD_WIDTH; i += 150) {
        for (let j = 0; j < WORLD_HEIGHT; j += 150) {
            // Draw quantum circles
            const offsetX = (j / 150) % 2 === 0 ? 75 : 0;
            bgGraphics.strokeCircle(i + offsetX, j, 60);
        }
    }
    
    // Add quantum particles (organelles)
    bgGraphics.fillStyle(palette.particle, 0.3);
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const radius = 10 + Math.random() * 20;
        bgGraphics.fillCircle(x, y, radius);
    }
    
    bgGraphics.generateTexture('microBackground', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'microBackground')
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}

/**
 * Generates an underwater background
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Optional seed (e.g., map level) for consistent palette selection
 */
export function generateUnderwaterBackground(scene: Phaser.Scene, seed?: number): void {
    const palette = seed !== undefined
        ? UNDERWATER_PALETTES[seed % UNDERWATER_PALETTES.length]
        : Phaser.Utils.Array.GetRandom(UNDERWATER_PALETTES);
    
    if (!palette) return;
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Deep blue water gradient
    bgGraphics.fillGradientStyle(palette.baseTop, palette.baseTop, palette.baseBottom, palette.baseBottom, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add light rays from above
    bgGraphics.lineStyle(40, palette.ray, 0.15);
    for (let i = 0; i < WORLD_WIDTH; i += 200) {
        bgGraphics.lineBetween(i, 0, i + 100, WORLD_HEIGHT);
    }
    
    // Add kelp decorations
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
    
    bgGraphics.generateTexture('underwaterBackground', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'underwaterBackground')
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}

/**
 * Generates an underwater micro background
 * @param scene - The Phaser scene to generate the background for
 * @param seed - Optional seed (e.g., map level) for consistent palette selection
 */
export function generateUnderwaterMicroBackground(scene: Phaser.Scene, seed?: number): void {
    const palette = seed !== undefined
        ? UNDERWATER_MICRO_PALETTES[seed % UNDERWATER_MICRO_PALETTES.length]
        : Phaser.Utils.Array.GetRandom(UNDERWATER_MICRO_PALETTES);
    
    if (!palette) return;
    
    const bgGraphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Deep blue-green water
    bgGraphics.fillGradientStyle(palette.baseTop, palette.baseTop, palette.baseBottom, palette.baseBottom, 1);
    bgGraphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Add light diffusion patterns
    bgGraphics.lineStyle(30, palette.ray, 0.1);
    for (let i = 0; i < WORLD_WIDTH; i += 180) {
        bgGraphics.lineBetween(i, 0, i + 80, WORLD_HEIGHT);
    }
    
    // Add plankton (small organic shapes)
    bgGraphics.fillStyle(palette.plankton, 0.3);
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const size = 8 + Math.random() * 15;
        // Draw plankton-like shapes
        bgGraphics.fillCircle(x, y, size);
        bgGraphics.fillCircle(x - size/3, y + size/3, size * 0.5);
        bgGraphics.fillCircle(x + size/3, y + size/3, size * 0.5);
    }
    
    // Add microorganism clusters
    bgGraphics.fillStyle(palette.cluster, 0.25);
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const clusterSize = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < clusterSize; j++) {
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            bgGraphics.fillCircle(x + offsetX, y + offsetY, 5 + Math.random() * 8);
        }
    }
    
    bgGraphics.generateTexture('underwaterMicroBackground', WORLD_WIDTH, WORLD_HEIGHT);
    bgGraphics.destroy();
    
    scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'underwaterMicroBackground')
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);
}
