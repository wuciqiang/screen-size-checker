// core-optimized.js - Phase 1.1 JavaScript优化
// 整合核心功能模块，减少HTTP请求，保持所有业务逻辑完整性

console.log('🚀 Starting core-optimized.js...');

// ====== 核心工具函数 ======

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Calculate aspect ratio from width and height
 */
function calculateAspectRatio(width, height) {
    const gcd = (a, b) => {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };

    const divisor = gcd(width, height);
    const aspectWidth = width / divisor;
    const aspectHeight = height / divisor;

    const commonRatios = {
        '16:9': [16, 9],
        '16:10': [16, 10],
        '4:3': [4, 3],
        '3:2': [3, 2],
        '21:9': [21, 9],
        '1:1': [1, 1]
    };

    for (const [ratio, [w, h]] of Object.entries(commonRatios)) {
        if (aspectWidth === w && aspectHeight === h) {
            return ratio;
        }
    }

    return `${aspectWidth}:${aspectHeight}`;
}

// ====== 设备检测核心功能 ======

let deviceInfoCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000;

/**
 * 收集设备信息（优化版本）
 */
function collectDeviceInfo() {
    const info = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth || 'Unknown',
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    info.aspectRatio = calculateAspectRatio(info.viewportWidth, info.viewportHeight);
    info.operatingSystem = detectOperatingSystem();
    info.browserInfo = detectBrowser();

    return info;
}

/**
 * 检测操作系统
 */
function detectOperatingSystem() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) {
        if (userAgent.includes('Windows NT 10.0')) {
            return userAgent.includes('Chrome/110') || userAgent.includes('Edg/110') ? 'Windows 11' : 'Windows 10';
        }
        return 'Windows';
    } else if (userAgent.includes('Mac')) {
        return 'macOS';
    } else if (userAgent.includes('Linux')) {
        return 'Linux';
    } else if (userAgent.includes('Android')) {
        return 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        return 'iOS';
    }

    return 'Unknown';
}

/**
 * 检测浏览器信息
 */
function detectBrowser() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
        return `Chrome ${version || ''}`.trim();
    } else if (userAgent.includes('Edg')) {
        const version = userAgent.match(/Edg\/(\d+)/)?.[1];
        return `Edge ${version || ''}`.trim();
    } else if (userAgent.includes('Firefox')) {
        const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
        return `Firefox ${version || ''}`.trim();
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        const version = userAgent.match(/Version\/(\d+)/)?.[1];
        return `Safari ${version || ''}`.trim();
    }

    return 'Unknown';
}

/**
 * 更新设备显示信息
 */
function updateDisplay() {
    try {
        const deviceInfo = collectDeviceInfo();
        applyDeviceInfo(deviceInfo);
        deviceInfoCache = deviceInfo;
        cacheTimestamp = Date.now();
        console.log('Device information updated successfully');
    } catch (error) {
        console.error('Error during device detection:', error);
        setFallbackValues();
    }
}

/**
 * 应用设备信息到UI
 */
function applyDeviceInfo(deviceInfo) {
    requestAnimationFrame(() => {
        updateScreenResolution(deviceInfo);
        updateViewportSize(deviceInfo);
        updateElementText('dpr', Math.round(deviceInfo.devicePixelRatio));
        updateElementText('color-depth', `${deviceInfo.colorDepth}-bit`);
        updateElementText('os-info', deviceInfo.operatingSystem);
        updateElementText('browser-info', deviceInfo.browserInfo);
        // 使用翻译键处理 cookies 和 touch support
        const cookiesStatus = deviceInfo.cookiesEnabled ? 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : '是') : 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : '否');
        updateElementText('cookies-enabled', cookiesStatus);
        
        const touchStatus = deviceInfo.touchSupported ? 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : '支持') : 
            (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : '不支持');
        updateElementText('touch-support', touchStatus);
        updateElementText('user-agent', deviceInfo.userAgent);
        updateElementText('aspect-ratio', deviceInfo.aspectRatio);
    });
}

/**
 * 更新屏幕分辨率显示
 */
function updateScreenResolution(deviceInfo) {
    const resolution = `${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}`;
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (screenResolutionDisplay) {
        const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
        if (detectingSpan) {
            detectingSpan.parentNode.removeChild(detectingSpan);
        }

        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

        if (!labelSpan) {
            labelSpan = document.createElement('span');
            labelSpan.setAttribute('data-i18n', 'screen_resolution');
            labelSpan.textContent = '屏幕分辨率';
            screenResolutionDisplay.innerHTML = '';
            screenResolutionDisplay.appendChild(labelSpan);
            screenResolutionDisplay.appendChild(document.createTextNode(': '));
        }

        if (!valueSpan) {
            valueSpan = document.createElement('span');
            screenResolutionDisplay.appendChild(valueSpan);
        }

        valueSpan.removeAttribute('data-i18n');
        valueSpan.textContent = resolution;
    }
}

/**
 * 更新视口尺寸显示
 */
function updateViewportSize(deviceInfo) {
    const viewport = `${deviceInfo.viewportWidth} × ${deviceInfo.viewportHeight}`;
    const viewportDisplay = document.getElementById('viewport-display');

    if (viewportDisplay) {
        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = viewport;
    }
}

/**
 * 安全更新元素文本内容
 */
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        // 清除data-i18n属性防止被i18next覆盖
        element.removeAttribute('data-i18n');
        // 清除子元素的data-i18n
        const children = element.querySelectorAll('[data-i18n]');
        children.forEach(child => child.removeAttribute('data-i18n'));
        // 设置文本内容
        element.textContent = text;
        console.log(`Updated ${id}: ${text}`);
    } else {
        console.warn(`Element not found: ${id}`);
    }
}

/**
 * 设置降级值
 */
function setFallbackValues() {
    console.log('Setting fallback values...');

    updateElementText('viewport-display', '检测失败');
    updateElementText('aspect-ratio', '不可用');
    updateElementText('dpr', '不可用');
    updateElementText('color-depth', '不可用');
    updateElementText('os-info', '不可用');
    updateElementText('browser-info', '不可用');
    const notAvailable = typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_available') : '不可用';
    updateElementText('cookies-enabled', notAvailable);
    updateElementText('touch-support', notAvailable);
    updateElementText('user-agent', '不可用');
}

// ====== 主题系统核心功能 ======

/**
 * 初始化主题系统
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * 切换主题
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    setTimeout(() => {
        const appliedTheme = document.documentElement.getAttribute('data-theme');
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme: currentTheme, newTheme: appliedTheme }
        }));
    }, 50);
}

/**
 * 应用主题
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * 更新主题图标
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// ====== 复制功能核心 ======

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * 处理复制按钮点击事件
 */
async function handleCopyClick(event) {
    const button = event.target;
    const targetId = button.getAttribute('data-clipboard-target');
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
        console.error(`Target element with id '${targetId}' not found`);
        return;
    }

    const originalText = button.textContent;
    button.disabled = true;

    try {
        const textToCopy = targetElement.textContent || targetElement.innerText;
        const success = await copyToClipboard(textToCopy);

        if (success) {
            button.textContent = '已复制!';
            button.classList.add('copied');
        } else {
            button.textContent = '复制失败';
            button.classList.add('error');
        }
    } catch (error) {
        console.error('Copy failed:', error);
        button.textContent = '复制失败';
        button.classList.add('error');
    }

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('copied', 'error');
    }, 1500);
}

/**
 * 复制所有信息
 */
async function copyAllInfo() {
    try {
        const info = [];

        const viewportDisplay = document.getElementById('viewport-display');
        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        const aspectRatioElement = document.getElementById('aspect-ratio');
        const dprElement = document.getElementById('dpr');
        const colorDepthElement = document.getElementById('color-depth');
        const osInfoElement = document.getElementById('os-info');
        const browserInfoElement = document.getElementById('browser-info');
        const cookiesElement = document.getElementById('cookies-enabled');
        const touchElement = document.getElementById('touch-support');

        if (viewportDisplay) info.push(`视口尺寸: ${viewportDisplay.textContent}`);
        if (screenResolutionDisplay) info.push(`屏幕分辨率: ${screenResolutionDisplay.textContent}`);
        if (aspectRatioElement) info.push(`宽高比: ${aspectRatioElement.textContent}`);
        if (dprElement) info.push(`设备像素比: ${dprElement.textContent}`);
        if (colorDepthElement) info.push(`色深: ${colorDepthElement.textContent}`);
        if (osInfoElement) info.push(`操作系统: ${osInfoElement.textContent}`);
        if (browserInfoElement) info.push(`浏览器: ${browserInfoElement.textContent}`);
        if (cookiesElement) info.push(`Cookies: ${cookiesElement.textContent}`);
        if (touchElement) info.push(`触控支持: ${touchElement.textContent}`);

        const textToCopy = info.join('\n');
        const success = await copyToClipboard(textToCopy);

        if (success) {
            showToast('所有信息已复制到剪贴板');
        }

        return success;
    } catch (error) {
        console.error('Failed to copy all info:', error);
        return false;
    }
}

// ====== 语言功能核心 ======

/**
 * 导航到指定语言
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;

    localStorage.setItem('i18nextLng', newLang);

    let newPath;

    if (currentPath.includes('/multilang-build/')) {
        const buildMatch = currentPath.match(/^(.*)\/multilang-build\/([a-z]{2})(\/.*)?$/);
        if (buildMatch) {
            const basePath = buildMatch[1] || '';
            const currentLang = buildMatch[2];
            const pathAfterLang = buildMatch[3] || '/index.html';

            if (currentLang === newLang) return;

            if (newLang === 'en') {
                if (pathAfterLang.startsWith('/blog/')) {
                    newPath = `${basePath}/multilang-build/en${pathAfterLang}`;
                } else {
                    newPath = `${basePath}/multilang-build${pathAfterLang}`;
                }
            } else {
                newPath = `${basePath}/multilang-build/${newLang}${pathAfterLang}`;
            }
        } else {
            if (newLang === 'en') {
                newPath = `/multilang-build/index.html`;
            } else {
                newPath = `/multilang-build/${newLang}/index.html`;
            }
        }
    } else {
        const pathParts = currentPath.split('/').filter(part => part);
        let currentLang = 'en';
        let pagePath = '';

        if (pathParts.length === 0) {
            currentLang = 'en';
            pagePath = '';
        } else {
            const possibleLang = pathParts[0];
            const supportedLangs = ['en', 'zh', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru'];

            if (supportedLangs.includes(possibleLang)) {
                currentLang = possibleLang;
                pagePath = pathParts.slice(1).join('/');
            } else {
                currentLang = 'en';
                pagePath = pathParts.join('/');
            }
        }

        if (currentLang === newLang) return;

        if (newLang === 'en') {
            if (pagePath) {
                if (pagePath.startsWith('blog/')) {
                    newPath = `/en/${pagePath}`;
                } else {
                    newPath = `/${pagePath}`;
                }
            } else {
                newPath = '/';
            }
        } else {
            newPath = `/${newLang}`;
            if (pagePath) {
                newPath += `/${pagePath}`;
            }

            if (!pagePath || (!pagePath.includes('.') && !pagePath.endsWith('/'))) {
                newPath += '/';
            }
        }
    }

    const newUrl = newPath + currentSearch + currentHash;
    window.location.href = newUrl;
}

// ====== FAQ功能核心 ======

/**
 * 设置FAQ切换功能
 */
function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            const answer = faqItem.querySelector('.faq-answer');

            // 关闭所有FAQ项目
            document.querySelectorAll('.faq-question').forEach(q => {
                const item = q.closest('.faq-item');
                if (item) {
                    item.classList.remove('active');
                    q.setAttribute('aria-expanded', 'false');

                    const ans = item.querySelector('.faq-answer');
                    if (ans) {
                        ans.style.maxHeight = '0px';
                        ans.setAttribute('hidden', '');
                    }
                }
            });

            // 切换当前项目
            if (!isExpanded) {
                faqItem.classList.add('active');
                question.setAttribute('aria-expanded', 'true');

                if (answer) {
                    answer.removeAttribute('hidden');
                    answer.style.maxHeight = '0px';
                    answer.style.overflow = 'hidden';

                    answer.style.maxHeight = 'none';
                    answer.style.display = 'block';
                    const height = answer.scrollHeight;

                    answer.style.maxHeight = '0px';
                    answer.offsetHeight;
                    answer.style.maxHeight = height + 'px';

                    setTimeout(() => {
                        answer.style.maxHeight = '200px';
                    }, 300);
                }

                question.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

// ====== Toast通知功能 ======

/**
 * 显示Toast通知
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = toast?.querySelector('.toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// ====== 主初始化函数 ======

let isInitialized = false;

/**
 * 初始化应用
 */
function initializeApp() {
    if (isInitialized) return;

    try {
        console.log('Starting optimized application initialization...');

        // 立即执行的关键初始化
        updateInitialDisplayValues();
        initializeTheme();
        setupBasicEventListeners();

        // 延迟非关键功能
        setTimeout(() => {
            updateDisplay();
            setupAdvancedEventListeners();
        }, 50);

        isInitialized = true;
        console.log('✅ Critical application initialization completed!');

    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage();
        updateInitialDisplayValues();

        try {
            initializeTheme();
            setupBasicEventListeners();
        } catch (fallbackError) {
            console.error('❌ Even fallback initialization failed:', fallbackError);
        }
    }
}

/**
 * 更新初始显示值
 */
function updateInitialDisplayValues() {
    try {
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;

            viewportDisplay.removeAttribute('data-i18n');

            const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                viewportDisplay.innerHTML = '';
            }

            viewportDisplay.textContent = `${width} × ${height}`;
        }

        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                detectingSpan.parentNode.removeChild(detectingSpan);
            }

            let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
            let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');

            if (!labelSpan) {
                labelSpan = screenResolutionDisplay.querySelector('span:first-child') || document.createElement('span');
                labelSpan.setAttribute('data-i18n', 'screen_resolution');
                labelSpan.textContent = '屏幕分辨率';

                if (!labelSpan.parentNode) {
                    screenResolutionDisplay.appendChild(labelSpan);
                }
            }

            let colonNode = null;
            for (let i = 0; i < screenResolutionDisplay.childNodes.length; i++) {
                const node = screenResolutionDisplay.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE &&
                    (node.textContent.includes(':') || node.textContent.includes('：'))) {
                    colonNode = node;
                    break;
                }
            }

            if (!colonNode) {
                colonNode = document.createTextNode(': ');
                screenResolutionDisplay.appendChild(colonNode);
            }

            if (!valueSpan) {
                valueSpan = document.createElement('span');
                screenResolutionDisplay.appendChild(valueSpan);
            }

            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }
    } catch (error) {
        console.error('更新初始显示值时出错:', error);
    }
}

/**
 * 设置基础事件监听器
 */
function setupBasicEventListeners() {
    console.log('🎧 Setting up basic event listeners...');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('✅ Found theme toggle button, binding click event');
        themeToggle.addEventListener('click', toggleTheme);
    }

    setupBasicLanguageSelector();

    window.addEventListener('resize', debounce(updateViewportDisplay, 100));

    setupFAQToggles();
    setupNavigationActiveState();
    setupInternalLinks();

    console.log('✅ Basic event listeners setup completed');
}

/**
 * 设置高级事件监听器
 */
function setupAdvancedEventListeners() {
    console.log('🎧 Setting up advanced event listeners...');

    // 复制按钮事件
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('copy-btn') && event.target.getAttribute('data-clipboard-target')) {
            event.preventDefault();
            await handleCopyClick(event);
        }
    });

    // 一键复制全部按钮
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            copyAllBtn.disabled = true;
            const originalText = copyAllBtn.textContent;

            try {
                const result = await copyAllInfo();

                if (result) {
                    copyAllBtn.textContent = '已复制!';
                    copyAllBtn.classList.add('copied');
                } else {
                    copyAllBtn.textContent = '复制失败';
                    copyAllBtn.classList.add('error');
                }
            } catch (e) {
                console.error('Copy all info failed:', e);
                copyAllBtn.textContent = '复制失败';
                copyAllBtn.classList.add('error');
            }

            setTimeout(() => {
                copyAllBtn.textContent = originalText;
                copyAllBtn.classList.remove('copied', 'error');
                copyAllBtn.disabled = false;
            }, 1500);
        });
    }

    console.log('✅ Advanced event listeners setup completed');
}

/**
 * 设置导航激活状态
 */
function setupNavigationActiveState() {
    // 检查是否已经由服务器端设置了active状态
    const hasServerSideActive = document.querySelector('.nav-link.active');
    
    // 如果服务器端已经设置了active状态，跳过客户端更新
    if (hasServerSideActive) {
        console.log('Navigation state already set by server, skipping client-side update');
        return;
    }
    
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // Remove any existing active classes
            link.classList.remove('active');

            // Check if this link matches the current page
            if (href === currentPath ||
                (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/index.html'))) ||
                (href === currentPath.split('/').pop())) {
                link.classList.add('active');
            }
        }
    });
}

/**
 * 设置内链功能
 */
function setupInternalLinks() {
    const container = document.getElementById('internal-links-container');
    const loading = document.getElementById('internal-links-loading');

    if (!container) {
        console.log('Internal links container not found');
        return;
    }

    // Simulate loading delay for better UX
    setTimeout(() => {
        try {
            const links = generateInternalLinks();
            renderInternalLinks(container, links);

            if (loading) {
                loading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error setting up internal links:', error);
            if (loading) {
                loading.innerHTML = '<span class="error-text">Failed to load resources</span>';
            }
        }
    }, 300);
}

/**
 * 检测当前语言
 */
function detectCurrentLanguage() {
    const path = window.location.pathname;

    // 从路径中检测语言
    if (path.includes('/zh/') || path.endsWith('/zh')) {
        return 'zh';
    }
    if (path.includes('/en/') || path.endsWith('/en')) {
        return 'en';
    }

    // 从localStorage检测
    const storedLang = localStorage.getItem('i18nextLng') || localStorage.getItem('lang');
    if (storedLang && ['en', 'zh'].includes(storedLang)) {
        return storedLang;
    }

    // 从HTML lang属性检测
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang && ['en', 'zh'].includes(htmlLang)) {
        return htmlLang;
    }

    // 默认返回英文
    return 'en';
}

/**
 * 调整相对路径
 */
function adjustRelativePath(url, currentPath) {
    // 如果URL已经是相对路径（不以/开头），直接返回
    if (!url.startsWith('/')) {
        return url;
    }

    // 解析当前路径
    const pathParts = currentPath.split('/').filter(part => part);
    const urlParts = url.split('/').filter(part => part);

    // 检测当前路径的语言和深度
    let currentLang = 'en';
    let currentDepth = 0;
    let isInLanguageDir = false;
    let isInBlogDir = false;

    // 分析当前路径结构
    if (pathParts.length >= 1 && ['en', 'zh'].includes(pathParts[0])) {
        currentLang = pathParts[0];
        isInLanguageDir = true;
        currentDepth = 1;

        // 检查是否在博客目录下
        if (pathParts.length >= 2 && pathParts[1] === 'blog') {
            isInBlogDir = true;
            currentDepth = 2;
        }
    }

    // 生成正确的相对路径
    if (isInLanguageDir && isInBlogDir) {
        // 当前在博客目录下: /en/blog/xxx
        if (urlParts[0] === 'blog') {
            // 跳转到博客页面: blog/index.html -> ../blog/index.html
            return '../' + urlParts.join('/');
        } else {
            // 跳转到工具页面: devices/xxx.html -> ../../devices/xxx.html
            return '../../' + urlParts.join('/');
        }
    } else if (isInLanguageDir && !isInBlogDir) {
        // 当前在语言目录下但不在博客目录: /en/xxx
        if (urlParts[0] === 'blog') {
            // 跳转到博客页面: blog/index.html -> ./blog/index.html
            return urlParts.join('/');
        } else {
            // 跳转到工具页面: devices/xxx.html -> ./devices/xxx.html
            return urlParts.join('/');
        }
    } else {
        // 当前在根目录下: /xxx
        if (urlParts[0] === 'blog') {
            // 跳转到博客页面，需要添加语言前缀: blog/index.html -> en/blog/index.html
            return currentLang + '/' + urlParts.join('/');
        } else {
            // 跳转到工具页面: devices/xxx.html -> devices/xxx.html
            return urlParts.join('/');
        }
    }
}

/**
 * 生成内链数据
 */
function generateInternalLinks() {
    const currentPath = window.location.pathname;
    const currentPageId = getCurrentPageId(currentPath);
    const allLinks = [];

    // 内链配置数据 - 基于internal-links-config.json
    const INTERNAL_LINKS_CONFIG = {
        pages: {
            "iphone-viewport-sizes": {
                id: "iphone-viewport-sizes",
                category: "device-info",
                priority: 1,
                icon: "📱",
                urls: {
                    "en": "devices/iphone-viewport-sizes.html",
                    "zh": "devices/iphone-viewport-sizes.html"
                },
                title: "iPhone Viewport Sizes",
                description: "Complete list of iPhone viewport sizes for all models"
            },
            "ipad-viewport-sizes": {
                id: "ipad-viewport-sizes",
                category: "device-info",
                priority: 2,
                icon: "🖥️",
                urls: {
                    "en": "devices/ipad-viewport-sizes.html",
                    "zh": "devices/ipad-viewport-sizes.html"
                },
                title: "iPad Viewport Sizes",
                description: "Complete list of iPad viewport sizes for all models"
            },
            "android-viewport-sizes": {
                id: "android-viewport-sizes",
                category: "device-info",
                priority: 3,
                icon: "🤖",
                urls: {
                    "en": "devices/android-viewport-sizes.html",
                    "zh": "devices/android-viewport-sizes.html"
                },
                title: "Android Viewport Sizes",
                description: "Common Android device viewport sizes and resolutions"
            },
            "ppi-calculator": {
                id: "ppi-calculator",
                category: "calculator",
                priority: 1,
                icon: "🔍",
                urls: {
                    "en": "devices/ppi-calculator.html",
                    "zh": "devices/ppi-calculator.html"
                },
                title: "PPI Calculator",
                description: "Calculate pixels per inch for any display"
            },
            "aspect-ratio-calculator": {
                id: "aspect-ratio-calculator",
                category: "calculator",
                priority: 2,
                icon: "📐",
                urls: {
                    "en": "devices/aspect-ratio-calculator.html",
                    "zh": "devices/aspect-ratio-calculator.html"
                },
                title: "Aspect Ratio Calculator",
                description: "Calculate and convert aspect ratios for displays"
            },
            "compare": {
                id: "compare",
                category: "tools",
                priority: 1,
                icon: "🆚",
                urls: {
                    "en": "devices/compare.html",
                    "zh": "devices/compare.html"
                },
                title: "Screen Size Comparison",
                description: "Compare different screen sizes side by side"
            },
            "standard-resolutions": {
                id: "standard-resolutions",
                category: "reference",
                priority: 1,
                icon: "📊",
                urls: {
                    "en": "devices/standard-resolutions.html",
                    "zh": "devices/standard-resolutions.html"
                },
                title: "Standard Screen Resolutions",
                description: "Common screen resolutions and their uses"
            },
            "responsive-tester": {
                id: "responsive-tester",
                category: "tools",
                priority: 2,
                icon: "📱",
                urls: {
                    "en": "devices/responsive-tester.html",
                    "zh": "devices/responsive-tester.html"
                },
                title: "Responsive Design Tester",
                description: "Test your website on different screen sizes"
            },
            "blog": {
                id: "blog",
                category: "content",
                priority: 1,
                icon: "📝",
                urls: {
                    "en": "blog/index.html",
                    "zh": "blog/index.html"
                },
                title: "Blog",
                description: "Latest articles about screen sizes and responsive design"
            }
        },
        categories: {
            "device-info": {
                name: "Device Info",
                maxItems: 4
            },
            "calculator": {
                name: "Calculators",
                maxItems: 3
            },
            "tools": {
                name: "Tools",
                maxItems: 3
            },
            "reference": {
                name: "Reference",
                maxItems: 2
            },
            "content": {
                name: "Content",
                maxItems: 1
            }
        },
        display: {
            maxTotal: 9
        },
        rules: {
            excludeCurrent: true,
            prioritizeCategory: true,
            fallbackToAll: true
        }
    };

    // 检测当前语言
    const currentLang = detectCurrentLanguage();

    // 收集所有页面的链接
    for (const [pageKey, page] of Object.entries(INTERNAL_LINKS_CONFIG.pages)) {
        // 跳过当前页面
        if (page.id === currentPageId) {
            continue;
        }

        // 获取适合当前语言的URL
        let url = page.urls[currentLang] || page.urls.en || Object.values(page.urls)[0];

        // 根据当前页面路径调整相对路径
        url = adjustRelativePath(url, currentPath);

        allLinks.push({
            ...page,
            url: url,
            categoryName: INTERNAL_LINKS_CONFIG.categories[page.category]?.name || page.category
        });
    }

    // 按优先级排序并限制数量
    allLinks.sort((a, b) => (a.priority || 999) - (b.priority || 999));

    return allLinks.slice(0, INTERNAL_LINKS_CONFIG.display.maxTotal);
}

/**
 * 获取当前页面ID
 */
function getCurrentPageId(path) {
    const pathParts = path.split('/').filter(part => part);
    const fileName = pathParts[pathParts.length - 1] || '';

    if (fileName.includes('iphone')) return 'iphone-viewport-sizes';
    if (fileName.includes('ipad')) return 'ipad-viewport-sizes';
    if (fileName.includes('android')) return 'android-viewport-sizes';
    if (fileName.includes('ppi')) return 'ppi-calculator';
    if (fileName.includes('aspect')) return 'aspect-ratio-calculator';
    if (fileName.includes('responsive')) return 'responsive-tester';
    if (fileName.includes('compare')) return 'compare';
    if (fileName.includes('standard')) return 'standard-resolutions';
    if (fileName.includes('blog')) return 'blog';

    return 'home';
}

/**
 * 渲染内链到页面
 */
function renderInternalLinks(container, links) {
    if (!links || links.length === 0) {
        container.innerHTML = '<div class="no-links">No related resources available</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'internal-links-grid';

    links.forEach(link => {
        const card = createInternalLinkCard(link);
        grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

/**
 * 创建内链卡片元素
 */
function createInternalLinkCard(link) {
    const template = document.getElementById('internal-link-template');
    const card = template ? template.content.cloneNode(true) : createDefaultLinkCard();

    const linkElement = card.querySelector('.internal-link-card');
    if (linkElement) {
        linkElement.href = link.url;
        linkElement.setAttribute('data-category', link.category);
        linkElement.setAttribute('data-page-id', link.id);

        const icon = linkElement.querySelector('.link-icon');
        if (icon) {
            icon.textContent = link.icon || getLinkIcon(link.category);
        }

        const title = linkElement.querySelector('.link-title');
        if (title) {
            title.textContent = link.title;
        }

        const description = linkElement.querySelector('.link-description');
        if (description) {
            description.textContent = link.description;
        }
    }

    return card;
}

/**
 * 创建默认链接卡片
 */
function createDefaultLinkCard() {
    const fragment = document.createDocumentFragment();
    const link = document.createElement('a');
    link.className = 'internal-link-card';
    link.innerHTML = `
        <span class="link-icon" aria-hidden="true">📱</span>
        <div class="link-content">
            <span class="link-title"></span>
            <span class="link-description"></span>
        </div>
    `;
    fragment.appendChild(link);
    return fragment;
}

/**
 * 获取链接图标
 */
function getLinkIcon(category) {
    const icons = {
        'device-info': '📱',
        'calculator': '🧮',
        'tools': '🔧',
        'reference': '📚',
        'content': '📝'
    };

    return icons[category] || '🔗';
}

/**
 * 设置基础语言选择器
 */
function setupBasicLanguageSelector() {
    const languageModalTrigger = document.getElementById('language-modal-trigger');
    const languageModal = document.getElementById('language-modal');
    const languageModalClose = document.getElementById('language-modal-close');
    const languageModalBackdrop = document.getElementById('language-modal-backdrop');

    if (languageModalTrigger && languageModal) {
        console.log('Setting up basic language modal');

        languageModalTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            languageModal.classList.add('show');
            languageModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });

        const closeModal = () => {
            languageModal.classList.remove('show');
            languageModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        if (languageModalClose) {
            languageModalClose.addEventListener('click', closeModal);
        }

        if (languageModalBackdrop) {
            languageModalBackdrop.addEventListener('click', closeModal);
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && languageModal.classList.contains('show')) {
                closeModal();
            }
        });

        const languageCards = languageModal.querySelectorAll('.language-card:not(.disabled)');
        languageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const newLang = card.getAttribute('data-lang');

                const originalContent = card.innerHTML;
                card.innerHTML = '<div class="lang-name">Loading...</div>';

                try {
                    const modal = document.getElementById('language-modal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    navigateToLanguage(newLang);
                } catch (error) {
                    console.error('Error changing language:', error);
                    card.innerHTML = originalContent;
                    alert('Language switch failed. Please try again.');
                }
            });
        });
    }
}

/**
 * 更新视口显示
 */
function updateViewportDisplay() {
    const viewportDisplay = document.getElementById('viewport-display');
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');

    if (viewportDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        viewportDisplay.removeAttribute('data-i18n');
        viewportDisplay.textContent = `${width} × ${height}`;
    }

    if (screenResolutionDisplay) {
        const valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        if (valueSpan) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }
    }
}

/**
 * 显示错误消息
 */
function showErrorMessage() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>检测失败</h2>
            <p>无法检测设备信息，请刷新页面重试。</p>
            <button onclick="window.location.reload()">重试</button>
        `;
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
}

// ====== 自动初始化 ======

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    setTimeout(initializeApp, 0);
}

setTimeout(() => {
    if (!isInitialized) {
        console.log('Fallback initialization...');
        initializeApp();
    }
}, 100);

// 监听i18next初始化完成事件，重新更新需要翻译的值
document.addEventListener('i18nextInitialized', () => {
    console.log('i18next initialized, updating translated values...');
    
    // 延迟执行，确保在 i18next 的 updateUIElements 之后
    setTimeout(() => {
        if (deviceInfoCache) {
            // 重新更新cookies和touch support状态
            const cookiesStatus = deviceInfoCache.cookiesEnabled ? 
                (typeof i18next !== 'undefined' && i18next.t ? i18next.t('yes') : '是') : 
                (typeof i18next !== 'undefined' && i18next.t ? i18next.t('no') : '否');
            updateElementText('cookies-enabled', cookiesStatus);
            
            const touchStatus = deviceInfoCache.touchSupported ? 
                (typeof i18next !== 'undefined' && i18next.t ? i18next.t('supported') : '支持') : 
                (typeof i18next !== 'undefined' && i18next.t ? i18next.t('not_supported') : '不支持');
            updateElementText('touch-support', touchStatus);
            
            console.log('✅ Updated cookies and touch support after i18next');
        }
    }, 100);
});

// ====== 导出全局函数 ======

if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.updateThemeIcon = updateThemeIcon;
    window.initializeTheme = initializeTheme;
    window.copyToClipboard = copyToClipboard;
    window.handleCopyClick = handleCopyClick;
    window.copyAllInfo = copyAllInfo;
    window.showToast = showToast;
    window.navigateToLanguage = navigateToLanguage;
    window.updateDisplay = updateDisplay;
    window.calculateAspectRatio = calculateAspectRatio;
    window.debounce = debounce;

    console.log('🌍 Core functions exposed to global scope for compatibility');
}

// Functions are already exposed to global scope for compatibility

console.log('✅ core-optimized.js loaded successfully');