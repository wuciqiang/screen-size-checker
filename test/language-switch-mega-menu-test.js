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
    '.ico': 'image/x-icon',
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

async function getVisibleMegaMenus(page) {
    return page.$$eval('.mega-menu', menus => menus.filter(menu => {
        const style = window.getComputedStyle(menu);
        const rect = menu.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0;
    }).map(menu => menu.className));
}

async function run() {
    console.log('🧪 检查语言切换后导航下拉菜单状态...');

    const executablePath = resolveBrowserExecutable();
    assert.ok(
        executablePath,
        '未找到 Chromium/Chrome/Edge。可设置 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH 或先安装 Playwright 浏览器。'
    );

    const { server, origin } = await startStaticServer();
    const browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
            return route.continue();
        }
        return route.abort();
    });

    try {
        await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#language-modal-trigger');
        await page.click('#language-modal-trigger');
        await page.waitForFunction(() => document.getElementById('language-modal')?.classList.contains('show'));

        await Promise.all([
            page.waitForURL(url => url.pathname === '/de/'),
            page.click('.language-card[data-lang="de"]')
        ]);

        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(400);

        const menusAfterSwitch = await getVisibleMegaMenus(page);
        assert.deepStrictEqual(
            menusAfterSwitch,
            [],
            `语言切换后不应自动展开导航下拉菜单，实际可见菜单: ${menusAfterSwitch.join(', ')}`
        );
        console.log('✅ 语言切换后不会自动展开导航下拉菜单');

        await page.hover('.nav-item.has-megamenu .nav-link[data-i18n="nav_gaming"]');
        await page.waitForTimeout(250);

        const menusAfterHover = await getVisibleMegaMenus(page);
        assert.ok(
            menusAfterHover.some(menu => menu.includes('mega-menu-gaming')),
            '桌面端悬停 Gaming 导航后应显示 mega menu'
        );
        console.log('✅ 悬停导航后 mega menu 仍可正常展开');

        const viewport = page.viewportSize();
        await page.mouse.move(viewport.width - 10, viewport.height - 10);
        await page.waitForTimeout(650);

        const menusAfterLeave = await getVisibleMegaMenus(page);
        assert.deepStrictEqual(menusAfterLeave, [], '鼠标移开后 mega menu 应恢复隐藏');
        console.log('✅ 鼠标移开后 mega menu 可正常收起');
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }

    console.log('🎉 语言切换导航状态测试通过。');
}

run().catch(error => {
    console.error('❌ 语言切换导航状态测试失败');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
});
