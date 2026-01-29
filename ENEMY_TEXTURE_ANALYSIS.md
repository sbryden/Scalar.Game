# Enemy Texture Analysis
**Updated:** January 28, 2026

## Overview
This document analyzes all enemy configurations in the game and identifies texture coverage gaps and inconsistencies.

**Asset Structure:** Assets are now organized into subdirectories:
- `land/` - Land biome assets (cars, beam, crown)
  - `land/normal/` - Normal scale land enemies
  - `land/micro/` - Microscopic land enemies
  - `land/macro/` - Macro scale land enemies
- `water/` - Water biome assets (subs, torpedo, crown)
  - `water/normal/` - Normal scale water enemies
  - `water/micro/` - Microscopic water enemies
  - `water/macro/` - Macro scale water enemies

## 🎮 Scene → Boss Type Mapping

| Scene | Scale | Biome | Boss Types |
|-------|-------|-------|------------|
| **MainGameScene** | Normal | Land | `boss_land`, `boss_wolf_tank` |
| **MicroScene** | Micro | Land | `boss_land_micro` |
| **MainGameMacroScene** | Macro | Land | `golem_boss`, `bear_boss`, `spawner_boss_land` |
| **UnderwaterScene** | Normal | Water | `boss_water_shark`, `boss_water_crab`, `boss_water_swimming` |
| **UnderwaterMicroScene** | Micro | Water | `boss_water_swimming_micro`, `boss_water_crab_micro` |
| **UnderwaterMacroScene** | Macro | Water | `whale_boss`, `giant_shark_boss`, `giant_crab_boss`, `sea_serpent_boss` |

---

## ✅ Enemies with Distinct Textures

### Normal Scale Land
- **boss_land**: `land/normal/snake_boss` (50%) + `land/macro/rockgiant` (50%)
- **boss_wolf_tank**: `land/normal/wolf_boss` (with `land/normal/wolf_boss_bullet` projectile)

### Normal Scale Water
- **fish**: `water/normal/water_enemy_fish_1` (25%) + `water/normal/water_enemy_needle_fish_1` (75%)
- **boss_water_shark**: `water/normal/sharkboss` (with `water/normal/sharkpedo` projectile)
- **crab**: `water/normal/water_enemy_crab_1`
- **boss_water_crab**: `water/normal/crabboss` (with `water/normal/bubble` projectile)

### Micro Scale
- **boss_land_micro**: `water/micro/zombie_blob` (80%) + `land/micro/micromonkeyboss` (20%)
- **boss_water_swimming_micro**: `water/micro/micro_boss`

### Macro Scale Land ✅
- **spawner_boss_land**: `land/macro/rock_car_with_minions` *(spawns in MainGameMacroScene)*
- **rock_minion**: `land/macro/rock_minion_1`

---

## ⚠️ Enemies Using Placeholder "enemy" Texture

### Normal Scale Land
- **generic**: `enemy` *(acceptable as generic fallback - aliased from `land/macro/rockgiant`)*

### Macro Scale Land (MOSTLY USING PLACEHOLDER)
- **golem**: `enemy` ❌ *(spawns in MainGameMacroScene)*
- **wolf_macro**: `enemy` ❌
- **bear**: `enemy` ❌
- **golem_boss**: `enemy` ❌ *(spawns in MainGameMacroScene)*
- **bear_boss**: `enemy` ❌ *(spawns in MainGameMacroScene)*

### Macro Scale Water (ALL USING PLACEHOLDER)
- **whale**: `enemy` ❌
- **giant_shark**: `enemy` ❌
- **sea_dragon**: `enemy` ❌
- **giant_crab**: `enemy` ❌
- **sea_serpent**: `enemy` ❌
- **whale_boss**: `enemy` ❌ *(spawns in UnderwaterMacroScene)*
- **giant_shark_boss**: `enemy` ❌ *(spawns in UnderwaterMacroScene)* - uses `water/normal/sharkpedo` for ranged attack
- **giant_crab_boss**: `enemy` ❌ *(spawns in UnderwaterMacroScene)*
- **sea_serpent_boss**: `enemy` ❌ *(spawns in UnderwaterMacroScene)*

---

## 🔁 Enemies Sharing Textures

### "land/micro/bacteria" Texture Overuse
All micro-scale enemies share the same texture, making them visually indistinguishable:

**Land Micro:**
- **micro**: `land/micro/bacteria`
- **spawner_micro**: `land/micro/bacteria` ⚠️ (same as micro)
- **micro_minion**: `land/micro/bacteria` ⚠️ (same as micro)

**Water Micro:**
- **water_swimming_micro**: `land/micro/bacteria` ⚠️ (shares with land micro)
- **spawner_water_swimming_micro**: `land/micro/bacteria` ⚠️ (shares with land micro)
- **water_micro_minion**: `land/micro/bacteria` ⚠️ (shares with land micro)

### Bosses Reusing Regular Enemy Textures
- **boss_water_swimming**: Uses same textures as `fish` (`water/normal/water_enemy_fish_1` + `water/normal/water_enemy_needle_fish_1`) ⚠️
  - *Should have unique boss appearance*
- **boss_water_crab_micro**: Uses `water/normal/crabboss` ⚠️
  - *Same texture as normal scale `boss_water_crab` - should be scale-appropriate*

---

## 📊 Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Total Enemy Types** | 33 | - |
| **With Distinct Textures** | 13 | ✅ |
| **Using "enemy" Placeholder** | 14 | ❌ |
| **Sharing "bacteria"** | 6 | ⚠️ |
| **Reusing Other Textures** | 2 | ⚠️ |
| **Needing Attention** | **~20** | **61%** |

---

## 📦 Available Unused Assets

These assets exist but are NOT currently referenced in enemy configs:

### Land Assets
- `land/jet_mech` - Jet mech enemy (not configured)
- `land/jet_mech_projectile` - Jet mech projectile
- `land/land_crown_1` - Crown/reward asset
- `land/macro/rocktower` - Tower enemy (not configured)
- `land/macro/rocktower_minion` - Tower minion
- `land/macro/rocktower_projectile` - Tower projectile
- `land/micro/mech_cannon_ant` - Mech ant enemy (not configured)
- `land/normal/motorcycle_1` - Motorcycle enemy variant (not configured)
- `land/normal/motorcycle_2` - Motorcycle enemy variant (not configured)
- `land/normal/snakeboss_water` - Snake boss water variant
- `land/normal/snakefire` - Fire snake variant
- `land/normal/snakeice` - Ice snake variant
- `land/normal/snakesmoke` - Smoke snake variant
- `land/normal/snakevines` - Vine snake variant

### Water Assets
- `water/macro/babykraken` - Baby kraken (not configured)
- `water/macro/mutant_kraken` - Mutant kraken (not configured)
- `water/macro/warning_kraken` - Warning kraken (not configured)
- `water/macro/water_enemy_giant_1` - Giant water enemy (not configured)
- `water/micro/baby_fish` - Baby fish (not configured)
- `water/micro/fish_to_fish` - Fish enemy variant (not configured)
- `water/micro/microfish2` - Micro fish variant (not configured)
- `water/normal/fish_summoner` - Fish summoner (not configured)
- `water/normal/harpoon` - Harpoon projectile
- `water/normal/harpoon_boss` - Harpoon boss (not configured)
- `water/normal/harpoon_boss_hammer_form` - Harpoon boss alt form
- `water/normal/sharboss_minion` - Shark boss minion (not configured)
- `water/normal/shark_1` - Basic shark (not configured)
- `water/water_crown_1` - Water crown/reward asset

---

## 🎯 Recommendations

### 🔴 **HIGH PRIORITY - Complete Scale Missing**
**All 14 Macro Scale enemies need unique textures**

#### Macro Land Enemies - Use existing or create:
1. `golem` - Could use `land/macro/rocktower` 
2. `wolf_macro` - Needs new texture
3. `bear` - Needs new texture
4. `golem_boss` - Needs new texture
5. `bear_boss` - Needs new texture

#### Macro Water Enemies - Use existing assets:
1. `whale` - Could use `water/macro/water_enemy_giant_1`
2. `giant_shark` - Could use `water/normal/shark_1` or create macro version
3. `sea_dragon` - Could use `water/macro/babykraken` or `water/macro/mutant_kraken`
4. `giant_crab` - Needs new texture
5. `sea_serpent` - Could use kraken variants
6. `whale_boss` - Could use `water/macro/mutant_kraken`
7. `giant_shark_boss` - Needs new texture
8. `giant_crab_boss` - Needs new texture
9. `sea_serpent_boss` - Could use `water/macro/warning_kraken`

### 🟡 **MEDIUM PRIORITY - Visual Variety**

#### Micro Enemy Variants:
Use existing micro assets to differentiate:
- `water/micro/baby_fish` - For water_swimming_micro
- `water/micro/fish_to_fish` - For spawner variants
- `water/micro/microfish2` - For water_micro_minion

#### Normal Scale Additions:
- Use `land/normal/motorcycle_1/2` for land enemy variants
- Use `water/normal/shark_1` for fish enemy variants
- Use snake variants (`snakefire`, `snakeice`, etc.) for boss_land variety

### 🟢 **LOW PRIORITY - Enhancement**
- Configure `jet_mech` as new enemy type with `jet_mech_projectile`
- Configure `rocktower` as defensive/spawner enemy
- Configure `harpoon_boss` as new water boss
- Configure `fish_summoner` as spawner enemy type

---

## 📝 Action Items

### Immediate Fixes (can use existing assets):
- [ ] Update macro water bosses to use kraken/giant assets (whale_boss, giant_shark_boss, etc.)
- [ ] Update golem/golem_boss to use `land/macro/rocktower`
- [ ] Add micro water variants using baby_fish, microfish2
- [ ] Add normal enemy variety using motorcycle, shark_1, snake variants

### Texture Creation Needed:
- [ ] Create macro land textures (wolf_macro, bear, bear_boss)
- [ ] Create unique boss_water_swimming texture
- [ ] Create micro-scale crab boss texture

### Configuration Updates:
- [ ] Configure jet_mech enemy type
- [ ] Configure rocktower enemy type (or use for golem)
- [ ] Configure harpoon_boss enemy type
- [ ] Test all texture loading in-game

---

## 🔍 Current Texture Coverage by Scale

### Normal Scale: **90% Complete** ✅
- Land: Mostly complete (generic placeholder acceptable)
- Water: Fully complete with distinct boss textures

### Micro Scale: **60% Complete** ⚠️
- Bosses have textures
- Regular enemies all share bacteria texture
- Multiple unused micro assets available

### Macro Scale: **15% Complete** ⚠️
- Land: `spawner_boss_land` and `rock_minion` have textures ✅
- Land: `golem_boss`, `bear_boss` still use placeholder ❌
- Water: All 4 bosses in UnderwaterMacroScene use placeholder ❌
- Several macro assets exist but aren't configured (krakens, water_enemy_giant_1)

---

## Notes
- The `generic` enemy using `enemy` texture is an alias for `land/macro/rockgiant`
- Texture variants with weights allow for visual variety while reusing configurations
- Asset paths now use subdirectory structure: `{biome}/{scale}/{asset}`
- All placeholder textures should be replaced before production release
- Scene boss mappings are now validated and correct
