/**
 * Bundle-size gate. Fails the build if the full export surface exceeds the
 * "< 1KB minified" promise in the README.
 *
 * Measures REAL minified bytes via esbuild. An approximate regex "minifier"
 * would not reflect what a bundler actually emits, so it could not defend a
 * claim that Bundlephobia checks against the real thing.
 */
import { build } from 'esbuild';
import { readFileSync, statSync, rmSync } from 'node:fs';

const BUDGET = 1024;
const OUT = 'node_modules/.cache/lite-lerp-size.min.js';

await build({
    entryPoints: ['Lerp.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    outfile: OUT,
    logLevel: 'error',
});

const bytes = statSync(OUT).size;
rmSync(OUT, { force: true });

const pct = ((bytes / BUDGET) * 100).toFixed(1);
const line = `${bytes} B minified / ${BUDGET} B budget (${pct}%)`;

if (bytes > BUDGET) {
    console.error(`\u274c  size gate FAILED — ${line}`);
    console.error(`    Over by ${bytes - BUDGET} B. Trim, or update the "< 1KB" claim in README.md.`);
    process.exit(1);
}

console.log(`\u2705  size gate passed — ${line}, ${BUDGET - bytes} B headroom`);
