import { describe, it, expect } from 'vitest';
import {
    clamp, lerp, inverseLerp, mapRange, remap,
    damp, smoothstep, easeIn, easeOut, easeInOut,
    lerpAngle, lerpAngleRad,
    wrap, repeat, pingpong, moveToward, snap, deadzone,
    smootherstep, lerpUnclamped
} from './Lerp.js';

describe('📐 lite-lerp', () => {

    describe('clamp()', () => {
        it('returns value when within range', () => { expect(clamp(5, 0, 10)).toBe(5); });
        it('clamps to min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
        it('clamps to max', () => { expect(clamp(15, 0, 10)).toBe(10); });
        it('handles equal min/max', () => { expect(clamp(5, 3, 3)).toBe(3); });
    });

    describe('lerp()', () => {
        it('returns a at t=0', () => { expect(lerp(10, 20, 0)).toBe(10); });
        it('returns b at t=1', () => { expect(lerp(10, 20, 1)).toBe(20); });
        it('returns midpoint at t=0.5', () => { expect(lerp(0, 100, 0.5)).toBe(50); });
        it('extrapolates beyond t=1', () => { expect(lerp(0, 10, 2)).toBe(20); });
        it('handles negative ranges', () => { expect(lerp(-10, 10, 0.5)).toBe(0); });
    });

    describe('inverseLerp()', () => {
        it('returns 0 when v equals a', () => { expect(inverseLerp(10, 20, 10)).toBe(0); });
        it('returns 1 when v equals b', () => { expect(inverseLerp(10, 20, 20)).toBe(1); });
        it('returns 0.5 at midpoint', () => { expect(inverseLerp(0, 100, 50)).toBe(0.5); });
        it('returns 0 when a === b (division by zero fix)', () => {
            expect(inverseLerp(5, 5, 5)).toBe(0);
        });
        it('returns 0 when a === b even with different v', () => {
            expect(inverseLerp(5, 5, 10)).toBe(0);
        });
    });

    describe('mapRange()', () => {
        it('maps value between ranges', () => {
            expect(mapRange(50, 0, 100, 0, 1)).toBeCloseTo(0.5);
        });
        it('maps to different scale', () => {
            expect(mapRange(5, 0, 10, 0, 100)).toBeCloseTo(50);
        });
        it('handles inverted output range', () => {
            expect(mapRange(0, 0, 100, 100, 0)).toBeCloseTo(100);
        });
    });

    describe('remap()', () => {
        it('is an alias for mapRange', () => {
            expect(remap).toBe(mapRange);
        });
    });

    describe('damp()', () => {
        it('approaches target over time', () => {
            const result = damp(0, 100, 5, 0.016);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(100);
        });
        it('returns a when dt is 0', () => {
            expect(damp(50, 100, 5, 0)).toBe(50);
        });
        it('converges closer with larger lambda', () => {
            const slow = damp(0, 100, 1, 0.016);
            const fast = damp(0, 100, 10, 0.016);
            expect(fast).toBeGreaterThan(slow);
        });
    });

    describe('smoothstep()', () => {
        it('returns 0 below min', () => { expect(smoothstep(10, 20, 5)).toBe(0); });
        it('returns 1 above max', () => { expect(smoothstep(10, 20, 25)).toBe(1); });
        it('returns 0.5 at midpoint', () => { expect(smoothstep(0, 10, 5)).toBe(0.5); });
        it('handles equal min/max (uses inverseLerp fix)', () => {
            expect(smoothstep(5, 5, 5)).toBe(0);
        });
    });

    describe('easeIn()', () => {
        it('returns 0 at t=0', () => { expect(easeIn(0)).toBe(0); });
        it('returns 1 at t=1', () => { expect(easeIn(1)).toBe(1); });
        it('starts slow (below linear)', () => { expect(easeIn(0.5)).toBeLessThan(0.5); });
    });

    describe('easeOut()', () => {
        it('returns 0 at t=0', () => { expect(easeOut(0)).toBe(0); });
        it('returns 1 at t=1', () => { expect(easeOut(1)).toBe(1); });
        it('starts fast (above linear)', () => { expect(easeOut(0.5)).toBeGreaterThan(0.5); });
    });

    describe('easeInOut()', () => {
        it('returns 0 at t=0', () => { expect(easeInOut(0)).toBe(0); });
        it('returns 1 at t=1', () => { expect(easeInOut(1)).toBe(1); });
        it('returns 0.5 at t=0.5', () => { expect(easeInOut(0.5)).toBeCloseTo(0.5); });
        it('is slow at start', () => { expect(easeInOut(0.25)).toBeLessThan(0.25); });
        it('is fast at end', () => { expect(easeInOut(0.75)).toBeGreaterThan(0.75); });
    });

    describe('lerpAngle()', () => {
        it('interpolates forward', () => {
            expect(lerpAngle(0, 90, 0.5)).toBeCloseTo(45);
        });
        it('takes shortest path across 360→0', () => {
            const result = ((lerpAngle(350, 10, 0.5) % 360) + 360) % 360;
            expect(result).toBeCloseTo(0);
        });
        it('takes shortest path the other way', () => {
            const result = ((lerpAngle(10, 350, 0.5) % 360) + 360) % 360;
            expect(result).toBeCloseTo(0);
        });
        it('returns a at t=0', () => { expect(lerpAngle(45, 270, 0)).toBeCloseTo(45); });
        it('returns b at t=1', () => {
            const result = ((lerpAngle(45, 270, 1) % 360) + 360) % 360;
            expect(result).toBeCloseTo(270);
        });
    });

    describe('lerpAngleRad()', () => {
        it('interpolates forward', () => {
            expect(lerpAngleRad(0, Math.PI / 2, 0.5)).toBeCloseTo(Math.PI / 4);
        });
        it('takes shortest path across 2π→0', () => {
            const a = Math.PI * 2 - 0.1;
            const b = 0.1;
            const mid = lerpAngleRad(a, b, 0.5);
            // Normalize to [0, 2π] — result near 2π or 0 are equivalent
            const normalized = ((mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            expect(Math.min(normalized, Math.PI * 2 - normalized)).toBeLessThan(0.2);
        });
    });

    // ══════════════════════════════════════════════════════════
    //  v1.1.0 — missing primitives
    // ══════════════════════════════════════════════════════════

    describe('wrap()', () => {
        it('wraps above the max into [min, max)', () => { expect(wrap(370, 0, 360)).toBe(10); });
        it('wraps below the min', () => { expect(wrap(-90, 0, 360)).toBe(270); });
        it('leaves an in-range value alone', () => { expect(wrap(180, 0, 360)).toBe(180); });
        it('is half-open: max maps back to min', () => { expect(wrap(360, 0, 360)).toBe(0); });
        it('keeps min as min', () => { expect(wrap(0, 0, 360)).toBe(0); });
        it('handles a non-zero min', () => { expect(wrap(200, -180, 180)).toBe(-160); });
        it('wraps repeatedly, not just once', () => { expect(wrap(1090, 0, 360)).toBe(10); });
        it('returns min when the range is empty', () => { expect(wrap(5, 3, 3)).toBe(3); });
        it('returns min when the range is inverted', () => { expect(wrap(5, 10, 0)).toBe(10); });
        it('never returns NaN', () => {
            for (const v of [-1e6, -1, 0, 1, 1e6]) expect(Number.isNaN(wrap(v, 0, 360))).toBe(false);
        });
    });

    describe('repeat()', () => {
        it('is a positive modulo', () => { expect(repeat(7.3, 5)).toBeCloseTo(2.3); });
        it('stays positive for negative t', () => { expect(repeat(-1, 5)).toBe(4); });
        it('returns 0 at a multiple of len', () => { expect(repeat(10, 5)).toBe(0); });
        it('returns 0 for len = 0 rather than NaN', () => { expect(repeat(7, 0)).toBe(0); });
        it('returns 0 for a negative len rather than a negative result', () => { expect(repeat(3, -5)).toBe(0); });
        it('output is always in [0, len)', () => {
            for (let i = -50; i < 50; i += 0.7) {
                const r = repeat(i, 5);
                expect(r).toBeGreaterThanOrEqual(0);
                expect(r).toBeLessThan(5);
            }
        });
    });

    describe('pingpong()', () => {
        it('ramps up on the first half-period', () => { expect(pingpong(2, 5)).toBe(2); });
        it('comes back down on the second', () => { expect(pingpong(7.3, 5)).toBeCloseTo(2.7); });
        it('peaks at len', () => { expect(pingpong(5, 5)).toBe(5); });
        it('returns to 0 after a full period', () => { expect(pingpong(10, 5)).toBe(0); });
        it('is even in t', () => { expect(pingpong(-7.3, 5)).toBeCloseTo(pingpong(7.3, 5)); });
        it('returns 0 for len = 0 rather than NaN', () => { expect(pingpong(7, 0)).toBe(0); });
        it('returns 0 for a negative len', () => { expect(pingpong(7, -5)).toBe(0); });
        it('output is always in [0, len]', () => {
            for (let i = -50; i < 50; i += 0.7) {
                const p = pingpong(i, 5);
                expect(p).toBeGreaterThanOrEqual(0);
                expect(p).toBeLessThanOrEqual(5);
            }
        });
    });

    describe('moveToward()', () => {
        it('steps by maxDelta when far away', () => { expect(moveToward(0, 100, 30)).toBe(30); });
        it('lands exactly on the target without overshooting', () => { expect(moveToward(90, 100, 30)).toBe(100); });
        it('moves in the negative direction too', () => { expect(moveToward(100, 0, 30)).toBe(70); });
        it('is a no-op when already there', () => { expect(moveToward(50, 50, 10)).toBe(50); });
        it('is a no-op for maxDelta = 0', () => { expect(moveToward(0, 100, 0)).toBe(0); });
        it('NEVER moves away from the target on a negative maxDelta', () => {
            // The naive `a + Math.sign(delta) * maxDelta` form returns -30 here.
            expect(moveToward(0, 100, -30)).toBe(0);
            expect(moveToward(100, 0, -30)).toBe(100);
        });
        it('converges on the target and stays there', () => {
            let v = 0;
            for (let i = 0; i < 10; i++) v = moveToward(v, 100, 30);
            expect(v).toBe(100);
            expect(moveToward(v, 100, 30)).toBe(100);
        });
    });

    describe('snap()', () => {
        it('rounds down to the nearest step', () => { expect(snap(7.3, 5)).toBe(5); });
        it('rounds up to the nearest step', () => { expect(snap(8, 5)).toBe(10); });
        it('handles negatives symmetrically', () => { expect(snap(-7.3, 5)).toBe(-5); });
        it('handles fractional steps', () => { expect(snap(0.27, 0.25)).toBeCloseTo(0.25); });
        it('returns v unchanged for step = 0 rather than NaN', () => { expect(snap(7.3, 0)).toBe(7.3); });
        it('returns v unchanged for a non-finite step', () => {
            expect(snap(7.3, Infinity)).toBe(7.3);
            expect(snap(7.3, NaN)).toBe(7.3);
        });
    });

    describe('deadzone()', () => {
        it('zeroes values inside the threshold', () => { expect(deadzone(0.1, 0.15)).toBe(0); });
        it('passes values outside the threshold through untouched', () => { expect(deadzone(0.5, 0.15)).toBe(0.5); });
        it('preserves the sign', () => { expect(deadzone(-0.5, 0.15)).toBe(-0.5); });
        it('is symmetric', () => { expect(deadzone(-0.1, 0.15)).toBe(deadzone(0.1, 0.15)); });
        it('is inclusive at the boundary', () => { expect(deadzone(0.15, 0.15)).toBe(0.15); });
        it('composes with mapRange to rescale out of the deadzone smoothly', () => {
            const dz = 0.2;
            const ramp = (v) => (deadzone(v, dz) === 0 ? 0 : Math.sign(v) * mapRange(Math.abs(v), dz, 1, 0, 1));
            expect(ramp(0.1)).toBe(0);
            expect(ramp(0.2)).toBeCloseTo(0);   // continuous at the boundary
            expect(ramp(0.6)).toBeCloseTo(0.5);
            expect(ramp(1)).toBeCloseTo(1);
            expect(ramp(-1)).toBeCloseTo(-1);
        });
    });

    describe('smootherstep()', () => {
        it('is 0 at the low bound', () => { expect(smootherstep(0, 10, 0)).toBe(0); });
        it('is 1 at the high bound', () => { expect(smootherstep(0, 10, 10)).toBe(1); });
        it('is 0.5 at the midpoint', () => { expect(smootherstep(0, 10, 5)).toBeCloseTo(0.5); });
        it('clamps below the range', () => { expect(smootherstep(0, 10, -5)).toBe(0); });
        it('clamps above the range', () => { expect(smootherstep(0, 10, 15)).toBe(1); });
        it('survives equal bounds (inverseLerp guard)', () => { expect(smootherstep(5, 5, 5)).toBe(0); });
        it('is flatter than smoothstep at the ends (C2 continuity)', () => {
            expect(smootherstep(0, 1, 0.1)).toBeLessThan(smoothstep(0, 1, 0.1));
            expect(smootherstep(0, 1, 0.9)).toBeGreaterThan(smoothstep(0, 1, 0.9));
        });
        it('is monotonic', () => {
            let prev = -1;
            for (let i = 0; i <= 1; i += 0.05) {
                const v = smootherstep(0, 1, i);
                expect(v).toBeGreaterThanOrEqual(prev);
                prev = v;
            }
        });
    });

    describe('lerpUnclamped()', () => {
        it('is the same function as lerp', () => { expect(lerpUnclamped).toBe(lerp); });
        it('extrapolates past t=1', () => { expect(lerpUnclamped(0, 10, 2)).toBe(20); });
        it('extrapolates below t=0', () => { expect(lerpUnclamped(0, 10, -1)).toBe(-10); });
        it('documents the truth: lerp does NOT clamp either', () => { expect(lerp(0, 10, 2)).toBe(20); });
    });

    // ══════════════════════════════════════════════════════════
    //  v1.1.0 — lerpAngle correctness fix
    // ══════════════════════════════════════════════════════════

    describe('lerpAngle() — shortest path on UN-normalized input', () => {
        const norm = (x) => ((x % 360) + 360) % 360;
        // Half-open [-180, 180), matching wrap(). The 180-degree antipode is a tie
        // -- both directions are equally short -- and wrap resolves it to -180.
        const shortest = (a, b) => {
            let d = norm(b) - norm(a);
            if (d >= 180) d -= 360;
            if (d < -180) d += 360;
            return d;
        };

        it('takes the short way from an accumulator past 360 (was: -270)', () => {
            expect(lerpAngle(720, 90, 1) - 720).toBeCloseTo(90);
        });

        it('takes the short way from a large accumulator (was: -280)', () => {
            expect(lerpAngle(1000, 0, 1) - 1000).toBeCloseTo(80);
        });

        it('handles a deeply wound rotation', () => {
            expect(lerpAngle(3600, 45, 1) - 3600).toBeCloseTo(45);
        });

        it('never sweeps more than 180 degrees, for any input', () => {
            for (let a = -1080; a <= 1080; a += 37) {
                for (let b = -1080; b <= 1080; b += 53) {
                    const swept = lerpAngle(a, b, 1) - a;
                    expect(Math.abs(swept)).toBeLessThanOrEqual(180 + 1e-9);
                    expect(swept).toBeCloseTo(shortest(a, b), 9);
                }
            }
        });

        it('resolves the 180-degree antipode deterministically', () => {
            // Equally short both ways. wrap()'s half-open interval always picks -180,
            // so a sprite facing exactly backwards turns the same way every time
            // instead of flickering between directions frame to frame.
            expect(lerpAngle(0, 180, 1) - 0).toBeCloseTo(-180);
            expect(lerpAngle(90, 270, 1) - 90).toBeCloseTo(-180);
        });

        it('is unchanged on the normalized domain (no regression)', () => {
            // Reference: the pre-1.1.0 implementation.
            const old = (a, b, t) => a + (((b - a + 540) % 360) - 180) * t;
            for (let a = 0; a < 360; a += 7) {
                for (let b = 0; b < 360; b += 11) {
                    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
                        expect(lerpAngle(a, b, t)).toBeCloseTo(old(a, b, t), 9);
                    }
                }
            }
        });
    });

    describe('lerpAngleRad() — shortest path on UN-normalized input', () => {
        const TAU = Math.PI * 2;

        it('takes the short way from an accumulator past TAU', () => {
            expect(lerpAngleRad(TAU * 2, Math.PI / 2, 1) - TAU * 2).toBeCloseTo(Math.PI / 2);
        });

        it('never sweeps more than PI, for any input', () => {
            for (let a = -20; a <= 20; a += 0.7) {
                for (let b = -20; b <= 20; b += 0.9) {
                    expect(Math.abs(lerpAngleRad(a, b, 1) - a)).toBeLessThanOrEqual(Math.PI + 1e-9);
                }
            }
        });

        it('is unchanged on the normalized domain (no regression)', () => {
            const old = (a, b, t) => a + (((b - a + TAU * 1.5) % TAU) - Math.PI) * t;
            for (let a = 0; a < TAU; a += 0.13) {
                for (let b = 0; b < TAU; b += 0.17) {
                    expect(lerpAngleRad(a, b, 0.5)).toBeCloseTo(old(a, b, 0.5), 9);
                }
            }
        });
    });
});

