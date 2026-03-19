#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');

const CONTENT_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8'
};

function resolveBrowserExecutable() {
    const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    if (envPath && fs.existsSync(envPath)) {
        return envPath;
    }

    const bundledPath = typeof chromium.executablePath === 'function'
        ? chromium.executablePath()
        : null;
    if (bundledPath && fs.existsSync(bundledPath)) {
        return bundledPath;
    }

    const candidates = process.platform === 'win32'
        ? [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        ]
        : [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        ];

    return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

function safeDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function resolveRequestPath(urlPathname) {
    const decodedPath = safeDecodeURIComponent(urlPathname);
    const normalizedPath = decodedPath.endsWith('/') && decodedPath !== '/'
        ? decodedPath.slice(0, -1)
        : decodedPath;

    if (decodedPath === '/') {
        return path.join(buildRoot, 'index.html');
    }

    let candidate = path.join(buildRoot, normalizedPath.replace(/^\/+/, ''));
    if (decodedPath.endsWith('/')) {
        const indexCandidate = path.join(candidate, 'index.html');
        if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
            return indexCandidate;
        }
    }

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
    }

    if (!path.extname(candidate)) {
        const htmlCandidate = `${candidate}.html`;
        if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
            return htmlCandidate;
        }
    }

    return null;
}

function resolveDirectoryRedirect(urlPathname) {
    const decodedPath = safeDecodeURIComponent(urlPathname);
    if (decodedPath === '/' || decodedPath.endsWith('/')) {
        return null;
    }

    const candidate = path.join(buildRoot, decodedPath.replace(/^\/+/, ''));
    const indexCandidate = path.join(candidate, 'index.html');
    return fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()
        ? `${decodedPath}/`
        : null;
}

function startStaticServer() {
    const server = http.createServer((req, res) => {
        const requestUrl = new URL(req.url, 'http://127.0.0.1');
        const redirectTarget = resolveDirectoryRedirect(requestUrl.pathname);

        if (redirectTarget) {
            res.writeHead(301, { Location: redirectTarget });
            res.end();
            return;
        }

        const filePath = resolveRequestPath(requestUrl.pathname);

        if (!filePath) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });

    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            resolve({
                server,
                origin: `http://127.0.0.1:${server.address().port}`
            });
        });
    });
}

async function run() {
    console.log('🧪 检查博客页语言弹窗回归...');

    const executablePath = resolveBrowserExecutable();
    assert.ok(
        executablePath,
        '未找到 Chromium/Chrome/Edge。可设置 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 或先安装 Playwright 浏览器。'
    );

    const { server, origin } = await startStaticServer();
    const browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
            return route.continue();
        }
        return route.abort();
    });

    try {
        for (const scenario of [
            {
                name: '博客首页',
                path: '/blog/',
                expectedZhPath: '/zh/blog/'
            },
            {
                name: '博客详情页',
                path: '/blog/device-pixel-ratio',
                expectedZhPath: '/zh/blog/device-pixel-ratio'
            }
        ]) {
            const pageErrors = [];
            page.removeAllListeners('pageerror');
            page.on('pageerror', error => {
                pageErrors.push(error.message);
            });

            await page.goto(`${origin}${scenario.path}`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('#language-modal-trigger');
            await page.waitForSelector('#language-modal', { state: 'attached' });
            await page.waitForTimeout(300);

            assert.deepStrictEqual(
                pageErrors,
                [],
                `${scenario.name} 存在脚本报错: ${pageErrors.join(' | ')}`
            );

            const beforeClass = await page.$eval('#language-modal', element => element.className);
            assert.strictEqual(beforeClass.includes('show'), false, `${scenario.name} 初始弹窗不应为打开状态`);

            await page.click('#language-modal-trigger');
            await page.waitForFunction(() => {
                const modal = document.getElementById('language-modal');
                return modal && modal.classList.contains('show') && modal.getAttribute('aria-hidden') === 'false';
            });

            const afterClass = await page.$eval('#language-modal', element => element.className);
            assert.ok(afterClass.includes('show'), `${scenario.name} 点击语言按钮后未打开弹窗`);
            console.log(`✅ ${scenario.name}：语言弹窗可正常打开`);

            await Promise.all([
                page.waitForURL(url => url.pathname === scenario.expectedZhPath),
                page.click('#language-modal.show .language-card[data-lang="zh"]')
            ]);

            await page.waitForTimeout(300);
            assert.deepStrictEqual(
                pageErrors,
                [],
                `${scenario.name} 语言切换后存在脚本报错: ${pageErrors.join(' | ')}`
            );
            assert.strictEqual(new URL(page.url()).pathname, scenario.expectedZhPath);
            console.log(`✅ ${scenario.name}：切换中文后跳转到 ${scenario.expectedZhPath}`);
        }
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('🎉 博客语言弹窗回归测试通过。');
}

run().catch(error => {
    console.error('❌ 博客语言弹窗回归失败');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
