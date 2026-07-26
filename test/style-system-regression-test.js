#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

function getBlock(source, selector) {
    const start = source.indexOf(`${selector} {`);
    assert.notStrictEqual(start, -1, `Missing CSS block: ${selector}`);

    const open = source.indexOf('{', start);
    let depth = 0;
    for (let index = open; index < source.length; index += 1) {
        if (source[index] === '{') depth += 1;
        if (source[index] === '}') depth -= 1;
        if (depth === 0) return source.slice(open + 1, index);
    }

    throw new Error(`Unclosed CSS block: ${selector}`);
}

function getHexVariable(block, name) {
    const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'));
    assert.ok(match, `Missing color variable: ${name}`);
    return match[1];
}

function luminance(hex) {
    const channels = hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255);
    const linear = channels.map(value => value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

function getColoredHighlightTokens(css, darkTheme) {
    const tokens = new Set();
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

    for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
        if (!/(^|;)\s*color\s*:/.test(match[2])) continue;
        if (match[1].includes('[data-theme="dark"]') !== darkTheme) continue;
        for (const token of match[1].matchAll(/\.(hljs-[\w-]+)/g)) tokens.add(token[1]);
    }

    return tokens;
}

const footerHtml = read('components/footer-optimized.html');
const footerCss = read('css/footer-optimized.css');
assert.match(footerHtml, /footer-logo-image-light" src="\/logo\.png"/);
assert.match(footerHtml, /footer-logo-image-dark" src="\/logo-light\.png"/);
assert.match(footerCss, /\[data-theme="dark"\] \.footer-logo-image-light\s*\{[^}]*display:\s*none/s);
assert.match(footerCss, /\[data-theme="dark"\] \.footer-logo-image-dark\s*\{[^}]*display:\s*block/s);
assert.match(getBlock(footerCss, '.footer-description'), /var\(--footer-text-secondary, var\(--text-secondary\)\)/);
assert.match(getBlock(footerCss, '.footer-copyright'), /var\(--footer-text-secondary, var\(--text-secondary\)\)/);

const blogJs = read('js/blog.js');
const blogCss = read('css/blog.css');
assert.doesNotMatch(blogJs, /highlight\.min\.css|ensureHighlightStylesheet/);
const requiredTokens = [
    'hljs-attr', 'hljs-attribute', 'hljs-built_in', 'hljs-comment', 'hljs-function',
    'hljs-keyword', 'hljs-literal', 'hljs-meta', 'hljs-name', 'hljs-number',
    'hljs-operator', 'hljs-params', 'hljs-property', 'hljs-selector-attr',
    'hljs-selector-class', 'hljs-selector-pseudo', 'hljs-selector-tag', 'hljs-string',
    'hljs-subst', 'hljs-tag', 'hljs-title', 'hljs-type', 'hljs-variable'
];
for (const darkTheme of [false, true]) {
    const coloredTokens = getColoredHighlightTokens(blogCss, darkTheme);
    assert.deepStrictEqual(requiredTokens.filter(token => !coloredTokens.has(token)), []);
}

const hubCss = read('css/hub.css');
for (const selector of ['.hub-hero', '.hub-content table thead', '.hub-tag']) {
    assert.match(getBlock(hubCss, selector), /color:\s*var\(--text-inverse\)/);
}

const coreCss = read('css/core-optimized.css');
const light = getBlock(coreCss, ':root');
const dark = getBlock(coreCss, '[data-theme="dark"]');
assert.ok(contrast(getHexVariable(light, '--text-secondary'), getHexVariable(light, '--background-secondary')) >= 4.5);
assert.ok(contrast(getHexVariable(dark, '--text-secondary'), getHexVariable(dark, '--background-secondary')) >= 4.5);
assert.ok(contrast(getHexVariable(dark, '--text-inverse'), getHexVariable(dark, '--primary-500')) >= 4.5);
assert.ok(contrast(getHexVariable(dark, '--text-inverse'), getHexVariable(dark, '--primary-600')) >= 4.5);

console.log('Style system theme, syntax highlighting, and contrast regressions are covered.');
