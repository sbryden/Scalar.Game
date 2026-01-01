/**
 * Type Guards
 * Type guard functions for narrowing union types
 */

import type Phaser from 'phaser';

/**
 * Type guard to check if a Body is an Arcade Body (not StaticBody)
 * @param body - The physics body to check
 * @returns True if the body is an Arcade Body with velocity property
 */
export function isArcadeBody(
  body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null
): body is Phaser.Physics.Arcade.Body {
  return body !== null && 'velocity' in body;
}
