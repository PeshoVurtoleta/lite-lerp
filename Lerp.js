/**
 * @zakkster/lite-lerp — Zero-dependency game math primitives
 * Tree-shakeable, pure functions for game loops and animations.
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

/**
 * Shortest-path interpolation for angles (in degrees).
 * Perfect for HSL/OKLCH color gradients and 2D game rotations.
 */
export const lerpAngle = (a, b, t) => {
    const delta = ((b - a + 540) % 360) - 180;
    return a + delta * t;
};

/**
 * Radian version of lerpAngle for canvas Math.atan2.
 */
export const lerpAngleRad = (a, b, t) => {
    const PI2 = Math.PI * 2;
    const delta = ((b - a + PI2 * 1.5) % PI2) - Math.PI;
    return a + delta * t;
};