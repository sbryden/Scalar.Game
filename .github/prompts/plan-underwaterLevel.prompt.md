## Plan: Add Underwater Level with Submarine Gameplay

Add a new underwater environment accessible from the main menu, featuring submarine-style controls with vertical thrust, lighter gravity, and modified physics for enemies, orbs, and projectiles.

### Steps
1. **Update [MenuScene.ts](src/scenes/MenuScene.ts)** — Add environment selector dropdown (Land/Water/Air-coming-soon) alongside difficulty selector, store selection in registry as `gameEnvironment`, and launch appropriate scene
2. **Create [UnderwaterScene.ts](src/scenes/UnderwaterScene.ts)** — Implement new scene based on MainGameScene structure with `gravity.y = 100`, blue-tinted background with kelp and coral decorations, and scene lifecycle with state persistence. Handle transitions to UnderwaterMicroScene when shrinking
3. **Create [UnderwaterMicroScene.ts](src/scenes/UnderwaterMicroScene.ts)** — Implement microscopic underwater scene (plankton/microorganism level) with even lighter gravity, appropriate background, and transition back to UnderwaterScene when growing
4. **Modify [player.ts](src/player.ts)** — Replace jump logic with up/down thrust controls when in underwater mode, apply water drag to movement, and use submarine sprite/appearance
5. **Update [enemies.ts](src/enemies.ts)** — Add two underwater enemy types:
   - **Swimming enemies (fish, 80%)** — `setGravityY(0)` with floating movement patterns similar to micro enemies
   - **Ground enemies (crabs, 20%)** — Walk on ground with minimal gravity impact, small jump capability
6. **Modify [xpOrbs.ts](src/xpOrbs.ts) and [projectiles.ts](src/projectiles.ts)** — Disable gravity on orbs and reduce projectile speed (e.g., `150` instead of `300`) when spawned in underwater scenes

### Further Considerations
1. **Enemy spawn rates** — Maintain same total spawn rate as land, but distribute as 80% swimming, 20% ground-based crabs
2. **Underwater Micro theme** — Plankton and microorganisms visual style with appropriate background/decorations
3. **Size-change restrictions** — Underwater allows shrinking/growing between regular and micro sizes only (no large size). Q/E keys toggle between UnderwaterScene and UnderwaterMicroScene
4. **Visual effects** — Add bubble particles, caustic light effects, animated kelp/coral?
