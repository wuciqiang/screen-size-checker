#!/usr/bin/env node
// Unit test for formatAspectRatioDisplay (js/utils.js) and its classic-script copy in js/core-optimized.js.
// Run: node test/aspect-ratio-display-test.js  (or npm run test:aspect-display)

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

// utils.js is an ES module without a package "type"; evaluate it with exports stripped.
function loadUtils() {
    const source = read('js/utils.js').replace(/^export\s+/gm, '');
    const context = {};
    vm.runInNewContext(`${source}\nthis.calculateAspectRatio = calculateAspectRatio; this.formatAspectRatioDisplay = formatAspectRatioDisplay;`, context);
    return context;
}

// core-optimized.js carries a classic copy: extract calculateAspectRatio + the display helper.
function loadCoreCopy() {
    const source = read('js/core-optimized.js');
    const start = source.indexOf('function calculateAspectRatio');
    const end = source.indexOf('// ====== ', source.indexOf('function formatAspectRatioDisplay'));
    assert.ok(start !== -1 && end !== -1, 'core-optimized.js copy not found');
    const context = {};
    vm.runInNewContext(`${source.slice(start, end)}\nthis.formatAspectRatioDisplay = formatAspectRatioDisplay;`, context);
    return context;
}

const utils = loadUtils();
const core = loadCoreCopy();

const cases = [
    [1366, 900, '\u2248 3:2 (683:450)'],
    [1920, 1080, '16:9'],
    [2560, 1080, '21:9'],
    [1440, 900, '16:10'],
    [390, 844, '\u2248 9:19.5 (195:422)'],
    [1366, 768, '\u2248 16:9 (683:384)'],
    [1280, 1024, '5:4'],
    [1, 1, '1:1'],
    [0, 0, '--']
];

for (const [w, h, expected] of cases) {
    assert.strictEqual(utils.formatAspectRatioDisplay(w, h), expected, `utils ${w}x${h}`);
    assert.strictEqual(core.formatAspectRatioDisplay(w, h), expected, `core-optimized copy ${w}x${h}`);
}

// Not close to any common ratio and reduced terms > 50 -> decimal form
assert.strictEqual(utils.formatAspectRatioDisplay(1451, 1000), '1.45:1');
// Not close to any common ratio, small reduced terms -> unchanged
assert.strictEqual(utils.formatAspectRatioDisplay(7, 5), '7:5');

// calculateAspectRatio itself must be unchanged for existing callers
assert.strictEqual(utils.calculateAspectRatio(1366, 900), '683:450');
assert.strictEqual(utils.calculateAspectRatio(1440, 900), '16:10');

// resolution-test.js must use the shared helper rather than its own gcd
const resolutionTest = read('js/resolution-test.js');
assert.ok(resolutionTest.includes("import { formatAspectRatioDisplay } from './utils.js'"), 'resolution-test imports helper');
assert.ok(!/function gcd/.test(resolutionTest), 'resolution-test has no private gcd');

console.log(`aspect-ratio-display-test: passed (${cases.length} table cases x 2 implementations + 6 extra assertions)`);
