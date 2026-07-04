import { describe, it, expect } from 'vitest';
import {
    clamp, lerp, inverseLerp, mapRange, remap,
    damp, smoothstep, easeIn, easeOut, easeInOut,
    lerpAngle, lerpAngleRad
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
});
