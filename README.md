# @zakkster/lite-lerp

[![npm version](https://img.shields.io/npm/v/@zakkster/lite-lerp.svg?style=for-the-badge&color=latest)](https://www.npmjs.com/package/@zakkster/lite-lerp)
[![sponsor](https://img.shields.io/badge/sponsor-PeshoVurtoleta-ea4aaa.svg?logo=github)](https://github.com/sponsors/PeshoVurtoleta)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@zakkster/lite-lerp?style=for-the-badge)](https://bundlephobia.com/result?p=@zakkster/lite-lerp)
[![npm downloads](https://img.shields.io/npm/dm/@zakkster/lite-lerp?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-lerp)
[![npm total downloads](https://img.shields.io/npm/dt/@zakkster/lite-lerp?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@zakkster/lite-lerp)
![Tree-Shakeable](https://img.shields.io/badge/tree--shakeable-yes-brightgreen)
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
| `lerpUnclamped(a, b, t)` | Explicit alias for `lerp` — see the note below |
| **v1.1.0** | |
| `moveToward(a, b, maxDelta)` | Step toward b by at most maxDelta, never overshooting |
| `wrap(v, min, max)` | Wrap into `[min, max)` — toroidal worlds, hue, angles |
| `repeat(t, len)` | Positive modulo — always in `[0, len)` |
| `pingpong(t, len)` | Triangle wave `0 → len → 0` |
| `snap(v, step)` | Round to the nearest multiple of step |
| `deadzone(v, threshold)` | Zero inside the threshold, pass-through outside |
| `smootherstep(min, max, val)` | Quintic Hermite — C² continuous, no acceleration snap |

> **On `lerpUnclamped`.** This is *not* the Unity distinction. In Unity, `Mathf.Lerp` clamps `t` and `Mathf.LerpUnclamped` does not. Here **`lerp` does not clamp either** — `lerp(0, 10, 2) === 20`. The alias exists only to make extrapolation explicit at the call site. If you want Unity's clamping `Lerp`, clamp it yourself: `lerp(a, b, clamp(t, 0, 1))`.

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

`lite-lerp` gives you the number. For the colour, reach for the peer library — because a naive RGB lerp from green to red dips through a muddy dark brown, and perceived brightness swings wildly across the bar:

```javascript
import { inverseLerp, lerp, clamp } from '@zakkster/lite-lerp';
import { lerpOklch, toCssOklch } from '@zakkster/lite-color';

const t = clamp(inverseLerp(0, maxHP, currentHP), 0, 1);

bar.style.width = `${lerp(0, 200, t)}px`;

// OKLCH holds lightness and chroma constant and moves only the hue, so the bar
// keeps the same perceived brightness from full health to nearly dead.
const danger  = { l: 0.7, c: 0.25, h: 25 };   // red
const healthy = { l: 0.7, c: 0.25, h: 145 };  // green
bar.style.background = toCssOklch(lerpOklch(danger, healthy, t));
```

Numbers from `lite-lerp`, perception from [`@zakkster/lite-color`](https://github.com/PeshoVurtoleta/lite-color).

### Angle Blending for 2D Sprite Rotation

`lerpAngle` always takes the shortest path — no more sprites spinning 350° the wrong way. The delta is wrapped into `[-180, 180)`, so this holds for **any** input, including un-normalized accumulators like `rotation += spin * dt` that run past 360°:

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

### Input Smoothing (deadzone + moveToward + damp)

```javascript
import { deadzone, moveToward, damp, mapRange, clamp } from '@zakkster/lite-lerp';

// Raw deadzone is discontinuous: output jumps from 0 to ±0.15 at the boundary.
// Rescale the remainder so the stick ramps smoothly out of the dead centre.
const DZ = 0.15;
const stick = (v) => (deadzone(v, DZ) === 0 ? 0 : Math.sign(v) * mapRange(Math.abs(v), DZ, 1, 0, 1));

// Speed-capped movement, then frame-rate independent smoothing.
player.x = moveToward(player.x, player.x + stick(gamepad.axes[0]) * 300, maxSpeed * dt);
camera.x = damp(camera.x, player.x, 6, dt);
```

### Looping Animation (pingpong + smootherstep)

```javascript
import { pingpong, smootherstep, lerp } from '@zakkster/lite-lerp';

const t = smootherstep(0, 1, pingpong(elapsed * 0.5, 1));   // eased breathe, 0→1→0
sprite.scale = lerp(1, 1.2, t);
```

### Grid Snapping (snap + wrap)

```javascript
import { snap, wrap } from '@zakkster/lite-lerp';

node.x = snap(pointer.x, 16);                 // 16px grid
enemy.x = wrap(enemy.x + vx * dt, 0, world.width);   // toroidal world
hue = wrap(hue + 1, 0, 360);                  // hue never leaves [0, 360)
```

---

## Bundle Size

The `< 1KB minified` claim is **enforced, not aspirational**. `npm run size` builds the full export surface with esbuild and fails if it exceeds 1024 bytes:

```
✅  size gate passed — 997 B minified / 1024 B budget (97.4%), 27 B headroom
```

It runs on `prepublishOnly`, so the claim cannot silently go stale. Adding v1.1.0's eight primitives took the surface from 590 B to 997 B — the gate is now the thing that decides whether a ninth one is affordable.

Because `sideEffects: false` and every export is a pure function, a real import costs far less than the full surface: `lerp` + `clamp` is **80 B**, `lerpAngle` is **107 B**.

---

## Division Safety

`inverseLerp(5, 5, v)` returns `0` instead of `NaN`. This prevents cascade failures through `mapRange` and `smoothstep` when min equals max — a common edge case with dynamic data ranges.

## TypeScript

Every function is fully typed with JSDoc and `.d.ts` declarations:

```typescript
import { lerp, damp, type mapRange } from '@zakkster/lite-lerp';
```

## License

MIT
