/**
 * Phaser Type Extensions
 * Extends Phaser types with custom properties used in the game
 */

declare module 'phaser' {
  namespace Physics {
    namespace Arcade {
      interface Body {
        lastDamageTime?: number;
        stunVelocity?: { x: number; y: number };
      }
    }
  }
  
  namespace GameObjects {
    interface Sprite {
      xpValue?: number;
      lastDamageTime?: number;
      health?: number;
    }
  }
}

export {};
