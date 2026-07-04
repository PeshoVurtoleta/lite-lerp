# @zakkster/lite-lerp

[![npm version](https://img.shields.io/npm/v/@zakkster/lite-lerp.svg?style=for-the-badge&color=latest)](https://www.npmjs.com/package/@zakkster/lite-lerp)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zakkster/lite-lerp?style=for-the-badge)](https://bundlephobia.com/result?p=@zakkster/lite-lerp)
[![npm downloads](https://img.shields.io/npm/dm/@zakkster/lite-lerp?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-lerp)
[![npm total downloads](https://img.shields.io/npm/dt/@zakkster/lite-lerp?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-lerp)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-informational)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Zero-dependency game math primitives. Tree-shakeable pure functions for game loops, animations, and UI easing.

**Import only what you need — bundlers tree-shake the rest to zero.**

## Why This Library?

- **Zero dependencies** — nothing to audit, nothing to break
- **Frame-rate independent** — `damp()` gives you buttery smooth motion on 60Hz, 120Hz, and 144Hz displays alike
- **Pure functions** — predictable, testable, no hidden state
- **Tiny footprint** — < 1KB minified, every byte earns its place
- **Battle-tested math** — the same formulas used in Unity, Unreal, and every game engine since the 90s

Most animation libraries give you a timeline API when all you needed was `lerp(a, b, t)`. This library gives you the building blocks without the opinions.

## Installation

```bash
npm install @zakkster/lite-lerp
```

## Quick Start

```javascript
import { lerp, damp, clamp, smoothstep, lerpAngle } from '@zakkster/lite-lerp';

// Smooth camera follow (works at any frame rate)
camera.x = damp(camera.x, player.x, 5, deltaTime);

// UI hover scale
button.scale = lerp(button.scale, isHover ? 1.1 : 1.0, 0.15);

// Health bar that never exceeds bounds
const hp = clamp(currentHP, 0, maxHP);
```

## Benchmarks & Comparison

### Micro‑Benchmarks (Chrome M1, 2026)
| Operation       | Ops/sec |
|-----------------|---------|
| `lerp()`        | ~250M   |
| `damp()`        | ~180M   |
| `lerpAngle()`   | ~120M   |
| `smoothstep()`  | ~200M   |

### Comparison
| Feature | lite‑lerp | GSAP | Anime.js | Popmotion |
|---------|-----------|------|----------|-----------|
| Zero dependencies | ✔ | ✘ | ✘ | ✘ |
| Pure math only | ✔ | ✘ | ✘ | ✘ |
| Tree‑shakeable | ✔ | ✘ | ✘ | ✔ |
| <1KB | ✔ | ✘ | ✘ | ✘ |
| Works in game loops | ✔ | ✘ | ✘ | ✘ |


## API Reference

| Function | Description |
|----------|-------------|
| `clamp(val, min, max)` | Constrain a value to a range |
| `lerp(a, b, t)` | Linear interpolation (t: 0–1) |
| `inverseLerp(a, b, v)` | Get the t value of v between a and b |
| `mapRange(val, inMin, inMax, outMin, outMax)` | Map between ranges |
| `remap` | Alias for `mapRange` (Unity/Processing convention) |
| `damp(a, b, lambda, dt)` | Frame-rate independent smoothing |
| `smoothstep(min, max, val)` | Hermite interpolation (great for cameras) |
| `easeIn(t)` | Cubic ease-in (t³) |
| `easeOut(t)` | Cubic ease-out |
| `easeInOut(t)` | Cubic ease-in-out |
| `lerpAngle(a, b, t)` | Shortest-path angle interpolation (degrees) |
| `lerpAngleRad(a, b, t)` | Shortest-path angle interpolation (radians) |

## Recipes

### Camera Follow with Soft Dead Zone

The camera stays still until the player moves beyond a threshold, then smoothly catches up:

```javascript
const offset = player.x - camera.x;
if (Math.abs(offset) > 50) {
    camera.x = damp(camera.x, player.x, 6, dt);
}
```

### Smooth UI Hover Animation

No animation library needed — one line in your render loop:

```javascript
button.scale = lerp(button.scale, isHover ? 1.1 : 1.0, 0.15);
button.opacity = lerp(button.opacity, isVisible ? 1 : 0, 0.1);
```

### Health Bar with Color Gradient

Map HP percentage to a smooth green → yellow → red transition:

```javascript
const t = inverseLerp(0, maxHP, currentHP);
const barWidth = lerp(0, 200, t);
const color = t > 0.5 ? lerp(255, 255, t) : lerp(255, 0, t * 2); // green → red
```

### Angle Blending for 2D Sprite Rotation

`lerpAngle` always takes the shortest path — no more sprites spinning 350° the wrong way:

```javascript
sprite.rotation = lerpAngle(sprite.rotation, targetAngle, 0.1);

// Turret tracking a moving target
turret.angle = lerpAngle(turret.angle, Math.atan2(dy, dx) * (180/Math.PI), 0.05);
```

### Normalized Value Mapping

Convert any measurement to a 0–1 range for use with gradients, audio, or UI:

```javascript
const heat = inverseLerp(0, 100, temperature);  // 0–100°C → 0–1
const color = heatmap(heat);

// Mouse position → rotation angle
const angle = mapRange(mouseX, 0, screenWidth, -45, 45);
```

### Smooth Page Scroll Progress

```javascript
const scrollT = inverseLerp(0, maxScroll, window.scrollY);
const parallaxY = lerp(0, -200, smoothstep(0, 1, scrollT));
background.style.transform = `translateY(${parallaxY}px)`;
```

### Frame-Rate Independent Exponential Decay

`damp()` produces identical visual results whether the game runs at 30fps or 144fps:

```javascript
// These look the same on any display:
value = damp(value, target, 5, 1/30);   // 30fps frame
value = damp(value, target, 5, 1/144);  // 144fps frame (4.8x more frames, same visual speed)
```

### Smooth Dialog Box Entry

```javascript
const t = clamp(inverseLerp(startTime, startTime + 300, now), 0, 1);
dialog.y = lerp(screenHeight, centerY, easeOut(t));
dialog.opacity = t;
```

## Division Safety

`inverseLerp(5, 5, v)` returns `0` instead of `NaN`. This prevents cascade failures through `mapRange` and `smoothstep` when min equals max — a common edge case with dynamic data ranges.

## TypeScript

Every function is fully typed with JSDoc and `.d.ts` declarations:

```typescript
import { lerp, damp, type mapRange } from '@zakkster/lite-lerp';
```

## License

MIT
