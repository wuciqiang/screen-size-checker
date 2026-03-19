#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const buildRoot = path.join(repoRoot, 'multilang-build');

function walkHtmlFiles(dir) {
    const results = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...walkHtmlFiles(fullPath));
            continue;
        }

        if (entry.isFile() && fullPath.endsWith('.html')) {
            results.push(fullPath);
        }
    }

    return results;
}

function normalizeInternalAnchorHref(href) {
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) {
        return href;
    }

    const sameSiteMatch = href.match(/^(https?:\/\/screensizechecker\.com)(\/[^?#]*)?([?#].*)?$/i);
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !sameSiteMatch) {
        return href;
    }

    let origin = '';
    let rawPath = href;
    let suffix = '';

    if (sameSiteMatch) {
        origin = sameSiteMatch[1];
        rawPath = sameSiteMatch[2] || '/';
        suffix = sameSiteMatch[3] || '';
    } else {
        const parts = href.match(/^([^?#]*)([?#].*)?$/);
        if (!parts) {
            return href;
        }

        rawPath = parts[1];
        suffix = parts[2] || '';
    }

    const isCanonicalCandidate =
        rawPath === '' ||
        rawPath === '/' ||
        /(^|\/)en(?:\/|$)/.test(rawPath) ||
        /(^|\/)index\.html$/i.test(rawPath) ||
        /\.html$/i.test(rawPath);

    if (!isCanonicalCandidate) {
        return href;
    }

    const isRootRelative = rawPath.startsWith('/');
    let normalizedPath = rawPath;

    if (isRootRelative) {
        if (normalizedPath === '/en' || normalizedPath === '/en/') {
            normalizedPath = '/';
        } else {
            normalizedPath = normalizedPath.replace(/^\/en(?=\/|$)/, '');
            if (!normalizedPath) {
                normalizedPath = '/';
            }
        }

        if (normalizedPath === '/index.html') {
            normalizedPath = '/';
        } else if (normalizedPath.endsWith('/index.html')) {
            normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
        } else {
            normalizedPath = normalizedPath.replace(/\.html$/i, '');
        }

        if (!normalizedPath) {
            normalizedPath = '/';
        }
    } else {
        let relativePrefix = '';

        while (normalizedPath.startsWith('../')) {
            relativePrefix += '../';
            normalizedPath = normalizedPath.slice(3);
        }

        if (normalizedPath.startsWith('./')) {
            relativePrefix += './';
            normalizedPath = normalizedPath.slice(2);
        }

        if (normalizedPath === 'en' || normalizedPath === 'en/') {
            normalizedPath = '';
        } else if (normalizedPath.startsWith('en/')) {
            normalizedPath = normalizedPath.slice(3);
        }

        if (normalizedPath === 'index.html') {
            normalizedPath = '';
        } else if (normalizedPath.endsWith('/index.html')) {
            normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
        } else {
            normalizedPath = normalizedPath.replace(/\.html$/i, '');
        }

        if (!normalizedPath) {
            normalizedPath = relativePrefix || './';
        } else {
            normalizedPath = relativePrefix + normalizedPath;
        }
    }

    return `${origin}${normalizedPath}${suffix}`;
}

console.log('🔗 检查生成站点中的站内链接是否已统一为 canonical 形式...');

assert.ok(fs.existsSync(buildRoot), 'multilang-build 不存在，请先执行构建');

const htmlFiles = walkHtmlFiles(buildRoot);
const issues = [];
let linkCount = 0;

for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const href = match[2];
        const normalizedHref = normalizeInternalAnchorHref(href);
        linkCount += 1;

        if (normalizedHref !== href) {
            issues.push({
                file: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
                href,
                expected: normalizedHref
            });
        }
    }
}

if (issues.length > 0) {
    console.error(`❌ 发现 ${issues.length} 个仍会触发 /en/ 或 .html 重定向的站内链接：`);
    issues.slice(0, 30).forEach((issue) => {
        console.error(`   - ${issue.file}`);
        console.error(`     当前: ${issue.href}`);
        console.error(`     应为: ${issue.expected}`);
    });

    if (issues.length > 30) {
        console.error(`   ... 其余 ${issues.length - 30} 个问题未展开`);
    }

    process.exit(1);
}

console.log(`✅ 已扫描 ${htmlFiles.length} 个 HTML 文件、${linkCount} 个锚点链接，未发现 /en/ 或 .html 遗留内链。`);
