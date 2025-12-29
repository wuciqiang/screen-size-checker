// 修复建议：更新 js/internal-links.js 的 getConfigPath() 方法

getConfigPath() {
    const currentPath = window.location.pathname;
    const hostname = window.location.hostname;

    // 检测是否在dev-server环境
    const isDevServer = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168');

    console.log(`🔍 Path detection: ${currentPath}, isDevServer: ${isDevServer}`);

    // Dev server 环境：尝试多个可能的路径
    if (isDevServer) {
        // 优先尝试绝对路径
        return '/data/internal-links-config.json';
    }

    // 生产环境：根据当前页面位置计算
    if (currentPath.includes('/blog/')) {
        return '../data/internal-links-config.json';
    } else if (currentPath.includes('/devices/')) {
        return '../data/internal-links-config.json';
    } else if (currentPath.includes('/multilang-build/')) {
        if (currentPath.includes('/multilang-build/en/') || currentPath.includes('/multilang-build/zh/')) {
            return '../data/internal-links-config.json';
        }
    }

    // 默认路径
    return 'data/internal-links-config.json';
}
