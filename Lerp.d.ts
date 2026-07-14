/** Constrains a value between min and max. */
export declare const clamp: (val: number, min: number, max: number) => number;
/** Linear interpolation between a and b by t (0–1). */
export declare const lerp: (a: number, b: number, t: number) => number;
/** Inverse of lerp. Returns t given v between a and b. Returns 0 when a === b. */
export declare const inverseLerp: (a: number, b: number, v: number) => number;
/** Maps a value from one range to another. */
export declare const mapRange: (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => number;
/** Alias for mapRange (Unity/Processing convention). */
export declare const remap: typeof mapRange;
/** Frame-rate independent lerp using exponential smoothing. */
export declare const damp: (a: number, b: number, lambda: number, dt: number) => number;
/** Smooth Hermite interpolation (0–1 output). */
export declare const smoothstep: (min: number, max: number, val: number) => number;
/** Cubic ease-in (t³). */
export declare const easeIn: (t: number) => number;
/** Cubic ease-out. */
export declare const easeOut: (t: number) => number;
/** Cubic ease-in-out. */
export declare const easeInOut: (t: number) => number;
/** Shortest-path angle interpolation in degrees. */
export declare const lerpAngle: (a: number, b: number, t: number) => number;
/** Shortest-path angle interpolation in radians. */
export declare const lerpAngleRad: (a: number, b: number, t: number) => number;

// ── v1.1.0 ──

/** Wraps v into the half-open interval [min, max). Returns min when max <= min. */
export declare const wrap: (v: number, min: number, max: number) => number;

/** Positive modulo — always in [0, len). Unity's Mathf.Repeat. Returns 0 when len <= 0. */
export declare const repeat: (t: number, len: number) => number;

/** Triangle wave, 0 -> len -> 0 with period 2*len. Unity's Mathf.PingPong. Returns 0 when len <= 0. */
export declare const pingpong: (t: number, len: number) => number;

/** Moves a toward b by at most maxDelta, never overshooting. A non-positive maxDelta is a no-op. */
export declare const moveToward: (a: number, b: number, maxDelta: number) => number;

/** Rounds v to the nearest multiple of step. Returns v when step is 0 or non-finite. */
export declare const snap: (v: number, step: number) => number;

/** Input deadzone: 0 inside the threshold, v (sign preserved) outside. Raw — the output is discontinuous at the boundary. */
export declare const deadzone: (v: number, threshold: number) => number;

/** Quintic (Perlin) smoothstep. C2 continuous — no acceleration snap at the ends. */
export declare const smootherstep: (min: number, max: number, val: number) => number;

/**
 * Explicit alias for `lerp`. NOT the Unity distinction: `lerp` does not clamp
 * either. For Unity's clamping Lerp, clamp t at the call site.
 */
export declare const lerpUnclamped: (a: number, b: number, t: number) => number;

