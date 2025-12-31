/**
 * Test Setup File
 * Configures the testing environment for Vitest
 */

import { vi } from 'vitest';

// Mock canvas context with all required properties
const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(() => false),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arcTo: vi.fn(),
  ellipse: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createPattern: vi.fn(() => ({})),
  getLineDash: vi.fn(() => []),
  setLineDash: vi.fn(),
  canvas: {
    width: 800,
    height: 600
  }
};

// Mock canvas for Phaser tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any;

// Mock toDataURL
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 0);
  return 0;
});

global.cancelAnimationFrame = vi.fn();

// Mock Image
global.Image = class Image {
  src: string = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width: number = 0;
  height: number = 0;
} as any;

// Mock Audio
global.Audio = class Audio {
  src: string = '';
  play = vi.fn();
  pause = vi.fn();
  load = vi.fn();
} as any;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null)
};
