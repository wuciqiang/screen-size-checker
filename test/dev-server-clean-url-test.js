#!/usr/bin/env node

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const python = process.env.PYTHON || 'python';
const pythonScriptPath = path.join(repoRoot, 'dev-server.py');

function resolvePythonExecutable() {
    if (process.platform !== 'win32') {
        return python;
    }

    const probe = spawnSync(
        'powershell',
        ['-NoProfile', '-Command', 'python -c "import sys; print(sys.executable)"'],
        {
            cwd: repoRoot,
            encoding: 'utf8'
        }
    );

    if (probe.status === 0) {
        const executable = probe.stdout
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .pop();

        if (executable) {
            return executable;
        }
    }

    return python;
}

const testCases = {
    '/zh/hub/curved-vs-flat-monitor-gaming/': '/zh/hub/curved-vs-flat-monitor-gaming.html',
    '/zh/hub/curved-vs-flat-monitor-gaming': '/zh/hub/curved-vs-flat-monitor-gaming.html',
    '/hub/curved-vs-flat-monitor-gaming/': '/hub/curved-vs-flat-monitor-gaming.html',
    '/hub/curved-vs-flat-monitor-gaming': '/hub/curved-vs-flat-monitor-gaming.html',
    '/zh/blog/': '/zh/blog/index.html'
};

const redirectCases = {
    '/zh/hub/curved-vs-flat-monitor-gaming/': '/zh/hub/curved-vs-flat-monitor-gaming',
    '/hub/curved-vs-flat-monitor-gaming/': '/hub/curved-vs-flat-monitor-gaming'
};

const okRequestPaths = [
    '/zh/hub/curved-vs-flat-monitor-gaming',
    '/hub/curved-vs-flat-monitor-gaming',
    '/zh/blog/'
];

const assetPaths = [
    '/css/core-optimized.css',
    '/css/hub.css',
    '/css/mega-menu.css',
    '/css/internal-links.css',
    '/css/footer-optimized.css',
    '/css/visual-enhancements.css',
    '/locales/zh/translation.json',
    '/js/blog.js',
    '/js/app.js',
    '/js/core-optimized.js',
    '/js/mega-menu.js'
];

const inlineScript = `
import importlib.util
import json
import sys
import threading
import time
import http.client

spec = importlib.util.spec_from_file_location("dev_server", r"${pythonScriptPath.replace(/\\/g, '\\\\')}")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.LOGGER.disabled = True

payload = json.loads(sys.stdin.read())
rewrite_paths = payload["rewrite_paths"]
redirect_paths = payload["redirect_paths"]
ok_paths = payload["ok_paths"]
asset_paths = payload["asset_paths"]

rewrite_results = {
    path: module.CleanURLHandler._resolve_clean_url(None, path)
    for path in rewrite_paths
}

server = module.ThreadingTCPServer(("127.0.0.1", 0), module.CleanURLHandler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()

redirect_results = {}
ok_results = {}
asset_results = {}

try:
    time.sleep(0.2)
    port = server.server_address[1]
    for path in redirect_paths:
        conn = http.client.HTTPConnection("127.0.0.1", port)
        conn.request("GET", path)
        response = conn.getresponse()
        redirect_results[path] = {
            "status": response.status,
            "location": response.getheader("Location"),
        }
        response.read()
        conn.close()

    for path in ok_paths:
        conn = http.client.HTTPConnection("127.0.0.1", port)
        conn.request("GET", path)
        response = conn.getresponse()
        ok_results[path] = {
            "status": response.status,
            "content_type": response.getheader("Content-Type"),
        }
        response.read()
        conn.close()

    for path in asset_paths:
        conn = http.client.HTTPConnection("127.0.0.1", port)
        conn.request("GET", path)
        response = conn.getresponse()
        asset_results[path] = {
            "status": response.status,
            "content_type": response.getheader("Content-Type"),
        }
        response.read()
        conn.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)

print(json.dumps({
    "rewrites": rewrite_results,
    "redirects": redirect_results,
    "ok": ok_results,
    "assets": asset_results,
}))
`;

console.log('🔎 检查 dev-server clean URL 重写逻辑...');

const result = spawnSync(resolvePythonExecutable(), ['-c', inlineScript], {
    cwd: repoRoot,
    encoding: 'utf8',
    input: JSON.stringify({
        rewrite_paths: Object.keys(testCases),
        redirect_paths: Object.keys(redirectCases),
        ok_paths: okRequestPaths,
        asset_paths: assetPaths
    })
});

if (result.error) {
    console.error('❌ 无法启动 Python 进行 dev-server 校验:', result.error.message);
    process.exit(1);
}

if (result.status !== 0) {
    console.error('❌ dev-server 校验脚本执行失败');
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
}

let actualResults;

try {
    actualResults = JSON.parse(result.stdout.trim());
} catch (error) {
    console.error('❌ 无法解析 dev-server 校验结果');
    console.error(result.stdout);
    throw error;
}

let failed = false;

for (const [requestPath, expectedPath] of Object.entries(testCases)) {
    const actualPath = actualResults.rewrites[requestPath];

    try {
        assert.strictEqual(actualPath, expectedPath);
        assert.ok(!actualPath.includes('/.html'), `${requestPath} 仍然错误地生成了 /.html`);
        console.log(`✅ ${requestPath} -> ${actualPath}`);
    } catch (error) {
        failed = true;
        console.error(`❌ ${requestPath}`);
        console.error(`   期望: ${expectedPath}`);
        console.error(`   实际: ${actualPath}`);
    }
}

console.log('↪️  验证 trailing slash 是否重定向到规范 clean URL...');

for (const [requestPath, expectedLocation] of Object.entries(redirectCases)) {
    const response = actualResults.redirects[requestPath];

    try {
        assert.ok(response, `${requestPath} 缺少实际响应结果`);
        assert.strictEqual(response.status, 301);
        assert.strictEqual(response.location, expectedLocation);
        console.log(`✅ ${requestPath} -> ${response.status} ${response.location}`);
    } catch (error) {
        failed = true;
        console.error(`❌ ${requestPath} 重定向失败`);
        console.error(`   响应: ${JSON.stringify(response)}`);
    }
}

console.log('🌐 验证规范 clean URL 页面可正常访问...');

for (const requestPath of okRequestPaths) {
    const response = actualResults.ok[requestPath];

    try {
        assert.ok(response, `${requestPath} 缺少页面响应结果`);
        assert.strictEqual(response.status, 200);
        assert.ok((response.content_type || '').includes('text/html'));
        console.log(`✅ ${requestPath} -> ${response.status} ${response.content_type}`);
    } catch (error) {
        failed = true;
        console.error(`❌ ${requestPath} 页面访问失败`);
        console.error(`   响应: ${JSON.stringify(response)}`);
    }
}

console.log('🧩 验证页面依赖的静态资源可正常加载...');

for (const requestPath of assetPaths) {
    const response = actualResults.assets[requestPath];

    try {
        assert.ok(response, `${requestPath} 缺少资源响应结果`);
        assert.strictEqual(response.status, 200);
        console.log(`✅ ${requestPath} -> ${response.status} ${response.content_type}`);
    } catch (error) {
        failed = true;
        console.error(`❌ ${requestPath} 资源访问失败`);
        console.error(`   响应: ${JSON.stringify(response)}`);
    }
}

if (failed) {
    process.exit(1);
}

console.log('🎉 dev-server clean URL 校验通过。');
