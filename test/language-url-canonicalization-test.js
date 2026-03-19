const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.join(__dirname, '..');

function extractBlock(source, signature) {
    const start = source.indexOf(signature);
    if (start === -1) {
        throw new Error(`Signature not found: ${signature}`);
    }

    const braceStart = source.indexOf('{', start);
    if (braceStart === -1) {
        throw new Error(`Opening brace not found: ${signature}`);
    }

    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let escaped = false;

    for (let i = braceStart; i < source.length; i += 1) {
        const char = source[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (!inDouble && !inTemplate && char === "'") {
            inSingle = !inSingle;
            continue;
        }

        if (!inSingle && !inTemplate && char === '"') {
            inDouble = !inDouble;
            continue;
        }

        if (!inSingle && !inDouble && char === '`') {
            inTemplate = !inTemplate;
            continue;
        }

        if (inSingle || inDouble || inTemplate) {
            continue;
        }

        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(start, i + 1);
            }
        }
    }

    throw new Error(`Unclosed block: ${signature}`);
}

function loadNavigateFunction(filePath) {
    const source = fs.readFileSync(filePath, 'utf8');
    const fnSource = extractBlock(source, 'function navigateToLanguage(newLang)');
    const context = {
        window: {
            location: {
                pathname: '/',
                search: '',
                hash: '',
                href: ''
            }
        },
        localStorage: {
            setItem() {}
        },
        console: {
            log() {},
            warn() {},
            error() {}
        }
    };

    vm.createContext(context);
    vm.runInContext(fnSource, context);
    return context;
}

function loadGetTargetUrl(filePath) {
    const source = fs.readFileSync(filePath, 'utf8');
    const methodSource = extractBlock(source, 'getTargetUrl(targetLang)');
    const context = {
        window: {
            location: {
                pathname: '/',
                search: '',
                hash: ''
            }
        },
        console: {
            log() {},
            warn() {},
            error() {}
        }
    };

    vm.createContext(context);
    vm.runInContext(`function ${methodSource}`, context);
    return context;
}

function runHelper(filePath, signature, pathname) {
    const source = fs.readFileSync(filePath, 'utf8');
    const fnSource = extractBlock(source, signature);
    const context = {
        window: {
            location: {
                pathname
            }
        },
        console: {
            log() {},
            warn() {},
            error() {}
        }
    };

    vm.createContext(context);
    vm.runInContext(fnSource, context);
    const functionName = signature.match(/function\s+([^(]+)/)[1];
    return context[functionName]();
}

console.log('🔎 检查语言切换 URL canonical 逻辑...');

const coreContext = loadNavigateFunction(path.join(repoRoot, 'js/core-optimized.js'));
for (const testCase of [
    { from: '/hub/1080p-vs-1440p-gaming', to: 'zh', expected: '/zh/hub/1080p-vs-1440p-gaming' },
    { from: '/blog/device-pixel-ratio', to: 'zh', expected: '/zh/blog/device-pixel-ratio' },
    { from: '/devices/ppi-calculator', to: 'zh', expected: '/zh/devices/ppi-calculator' },
    { from: '/', to: 'zh', expected: '/zh/' }
]) {
    coreContext.window.location.pathname = testCase.from;
    coreContext.window.location.search = '';
    coreContext.window.location.hash = '';
    coreContext.window.location.href = '';
    coreContext.navigateToLanguage(testCase.to);
    assert.strictEqual(coreContext.window.location.href, testCase.expected);
    console.log(`✅ core-optimized: ${testCase.from} -> ${testCase.expected}`);
}

const modalContext = loadGetTargetUrl(path.join(repoRoot, 'js/language-modal.js'));
for (const testCase of [
    { from: '/hub/1080p-vs-1440p-gaming', to: 'zh', expected: '/zh/hub/1080p-vs-1440p-gaming' },
    { from: '/blog/device-pixel-ratio', to: 'zh', expected: '/zh/blog/device-pixel-ratio' },
    { from: '/zh/blog/device-pixel-ratio', to: 'en', expected: '/blog/device-pixel-ratio' },
    { from: '/', to: 'zh', expected: '/zh/' }
]) {
    modalContext.window.location.pathname = testCase.from;
    modalContext.window.location.search = '';
    modalContext.window.location.hash = '';
    const actual = modalContext.getTargetUrl(testCase.to);
    assert.strictEqual(actual, testCase.expected);
    console.log(`✅ language-modal: ${testCase.from} -> ${testCase.expected}`);
}

console.log('🧩 检查 hub/blog/devices 页面翻译资源路径...');

for (const testCase of [
    { pathname: '/zh/hub/1080p-vs-1440p-gaming', signature: 'function getLocalesPath()', expected: '../../locales/{{lng}}/translation.json' },
    { pathname: '/hub/1080p-vs-1440p-gaming', signature: 'function getLocalesPath()', expected: '../locales/{{lng}}/translation.json' },
    { pathname: '/zh/blog/device-pixel-ratio', signature: 'function getChineseTranslationsPath()', expected: '../../locales/zh/translation.json' },
    { pathname: '/blog/device-pixel-ratio', signature: 'function getChineseTranslationsPath()', expected: '../locales/zh/translation.json' }
]) {
    const actual = runHelper(path.join(repoRoot, 'js/i18n.js'), testCase.signature, testCase.pathname);
    assert.strictEqual(actual, testCase.expected);
    console.log(`✅ ${testCase.signature}: ${testCase.pathname} -> ${testCase.expected}`);
}

console.log('🎉 语言 URL 与 i18n 路径校验通过。');
