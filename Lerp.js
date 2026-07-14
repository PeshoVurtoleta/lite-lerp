/**
 * @zakkster/lite-lerp — Zero-dependency game math primitives
 * Tree-shakeable, pure functions for game loops and animations.
 *
 * Every function is pure and total: degenerate inputs (len === 0, step === 0,
 * min === max) return a sane value rather than NaN or Infinity.
 */

/** Constrains a value between a minimum and maximum. */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

/** Linear interpolation between a and b by t (0 to 1). */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * The exact opposite of lerp. Returns the t value (0 to 1) of v between a and b.
 * Returns 0 when a === b (avoids division by zero).
 *
 * NOTE: Intentionally returns values outside [0, 1] when v is outside [a, b].
 * This enables extrapolation in mapRange/remap. If you need clamped output,
 * wrap the result: clamp(inverseLerp(a, b, v), 0, 1)
 *
 * @param {number} a - Start of range
 * @param {number} b - End of range
 * @param {number} v - Value to find t for
 * @returns {number} Unbounded t value (may be < 0 or > 1)
 */
export const inverseLerp = (a, b, v) => (a === b) ? 0 : (v - a) / (b - a);

/** Maps a value from one range to another. Extrapolates if val is outside [inMin, inMax]. */
export const mapRange = (val, inMin, inMax, outMin, outMax) => {
    return lerp(outMin, outMax, inverseLerp(inMin, inMax, val));
};

/** Ergonomic alias for developers coming from Unity/Processing. */
export const remap = mapRange;

/** Frame-rate independent lerp using exponential smoothing. */
export const damp = (a, b, lambda, dt) => {
    return lerp(a, b, 1 - Math.exp(-lambda * dt));
};

/** Smooth Hermite interpolation. Great for camera/UI easing. */
export const smoothstep = (min, max, val) => {
    const t = clamp(inverseLerp(min, max, val), 0, 1);
    return t * t * (3 - 2 * t);
};

// ── Standard Cubic Easings (t must be 0–1) ──

export const easeIn = (t) => t * t * t;

export const easeOut = (t) => {
    const f = t - 1;
    return f * f * f + 1;
};

export const easeInOut = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// ── Range primitives (v1.1.0) ──

/**
 * Wraps v into the half-open interval [min, max). Toroidal worlds, circular
 * buffers, hue wrapping, angle normalization.
 *
 * Returns min when the range is empty or inverted (max <= min).
 *
 * @example wrap(370, 0, 360) // 10
 * @example wrap(-90, 0, 360) // 270
 */
export const wrap = (v, min, max) => {
    const range = max - min;
    return !(range > 0) ? min : min + (((v - min) % range) + range) % range;
};

/**
 * Positive modulo. Always returns a value in [0, len), even for negative t.
 * Unity's Mathf.Repeat. Looping animations, texture offsets, patrol paths.
 *
 * Returns 0 for a non-positive len.
 *
 * @example repeat(7.3, 5)  // 2.3
 * @example repeat(-1, 5)   // 4
 */
export const repeat = (t, len) => (!(len > 0) ? 0 : t - Math.floor(t / len) * len);

/**
 * Triangle wave: ramps 0 → len → 0 with period 2 * len. Unity's Mathf.PingPong.
 * Even in t, so negative input mirrors.
 *
 * Returns 0 for a non-positive len.
 *
 * @example pingpong(7.3, 5) // 2.7 (on the way back down)
 */
export const pingpong = (t, len) =>
    !(len > 0) ? 0 : len - Math.abs((Math.abs(t) % (len * 2)) - len);

// ── Angles ──

/**
 * Shortest-path interpolation for angles (in degrees).
 * Perfect for HSL/OKLCH color gradients and 2D game rotations.
 *
 * The delta is wrapped into [-180, 180), so this holds for ANY input — including
 * un-normalized accumulators like `rotation += spin * dt`, which routinely run
 * past 360°. (Before v1.1.0 the delta was computed with a fixed +540 offset,
 * which silently took the long way round once |b - a| exceeded 360°.)
 *
 * @example lerpAngle(350, 10, 1)  // 370  -> +20°, not -340°
 * @example lerpAngle(720, 90, 1)  // 810  -> +90°, not -270°
 */
export const lerpAngle = (a, b, t) => a + wrap(b - a, -180, 180) * t;

/**
 * Radian version of lerpAngle for canvas Math.atan2.
 * Same [-PI, PI) delta wrapping; safe for un-normalized input.
 */
export const lerpAngleRad = (a, b, t) => a + wrap(b - a, -Math.PI, Math.PI) * t;

// ── Movement & stepping (v1.1.0) ──

/**
 * Moves a toward b by at most maxDelta, never overshooting. Unity's
 * Mathf.MoveTowards. Character/AI movement, camera follow with a speed cap.
 *
 * A non-positive maxDelta is a no-op: returns a. (Passing a negative maxDelta to
 * the naive `a + sign(delta) * maxDelta` form would move *away* from the target.)
 *
 * @example moveToward(0, 100, 30)  // 30
 * @example moveToward(90, 100, 30) // 100 — lands exactly, no overshoot
 */
export const moveToward = (a, b, maxDelta) =>
    !(maxDelta > 0) ? a
        : Math.abs(b - a) <= maxDelta ? b
            : a + Math.sign(b - a) * maxDelta;

/**
 * Rounds v to the nearest multiple of step. Grid snapping, UI alignment,
 * discrete stepping. Returns v unchanged when step is 0 or non-finite.
 *
 * @example snap(7.3, 5)   // 5
 * @example snap(-7.3, 5)  // -5
 */
export const snap = (v, step) => (step === 0 || !Number.isFinite(step) ? v : Math.round(v / step) * step);

/**
 * Input deadzone. Returns 0 inside the threshold, otherwise v unchanged (sign
 * preserved). Gamepad sticks, mouse-delta filtering.
 *
 * NOTE: this is the *raw* deadzone — output jumps discontinuously from 0 to
 * ±threshold at the boundary. For a stick that ramps smoothly out of the
 * deadzone, rescale the remainder:
 *
 *   const dz = 0.15;
 *   const out = deadzone(v, dz) === 0 ? 0
 *       : Math.sign(v) * mapRange(Math.abs(v), dz, 1, 0, 1);
 */
export const deadzone = (v, threshold) => (Math.abs(v) < threshold ? 0 : v);

// ── Easing (v1.1.0) ──

/**
 * Quintic (Perlin) smoothstep. C² continuous — the second derivative is zero at
 * both ends, so there is no acceleration snap. Preferred over smoothstep for
 * camera paths and premium UI transitions.
 */
export const smootherstep = (min, max, val) => {
    const t = clamp(inverseLerp(min, max, val), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Explicit alias for `lerp`, for call sites that want to state that
 * extrapolation is intended.
 *
 * IMPORTANT — this is NOT the Unity distinction. In Unity, `Mathf.Lerp` clamps t
 * and `Mathf.LerpUnclamped` does not. Here **`lerp` does not clamp either**:
 * lerp(0, 10, 2) === 20. The two are the same function. If you want Unity's
 * clamping `Lerp`, clamp t at the call site: lerp(a, b, clamp(t, 0, 1)).
 */
export const lerpUnclamped = lerp;