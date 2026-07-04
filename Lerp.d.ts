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
