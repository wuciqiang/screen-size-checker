// app.js - Main application entry point

console.log('🚀 Starting app.js module load...');

// Import all required modules
import { initializeI18next, updateUIElements, setupLanguageSelector, setTextContent } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { handleCopyClick } from './clipboard.js';
import { debounce } from './utils.js';
import { LanguageModal } from './language-modal.js';
// import { initializeSimulator } from './simulator.js';

console.log('✅ All modules imported successfully');

// Global initialization flag
let isInitialized = false;

/**
 * Initialize the complete application
 */
async function initializeApp() {
    if (isInitialized) {
        console.log('App already initialized');
        return;
    }

    try {
        console.log('Starting application initialization...');
        
        // 直接设置初始值，不等待翻译加载完成
        updateInitialDisplayValues();
        
        // Step 1: Initialize internationalization
        console.log('Step 1: Initializing i18n...');
        await initializeI18next();
        
        // Step 2: Setup language selector
        console.log('Step 2: Setting up language selector...');
        setupLanguageSelector();
        
        // Step 3: Update UI elements with current language
        console.log('Step 3: Updating UI elements...');
        updateUIElements();
        
        // Step 4: Setup event listeners
        console.log('Step 4: Setting up event listeners...');
        setupEventListeners();
        
        // Step 5: Initialize navigation highlighting
        console.log('Step 5: Setting up navigation highlighting...');
        setupNavigationHighlighting();
        
        // Step 6: Initialize theme system
        console.log('Step 6: Initializing theme...');
        initializeTheme();
        
        // Step 7: Start device detection
        console.log('Step 7: Starting device detection...');
        await updateDisplay();
        
        // Step 8: Setup viewport monitoring
        console.log('Step 8: Setting up viewport monitoring...');
        updateViewportSize();
        updateViewportDisplay();
        
        // Step 9: Initialize simulator if on responsive tester page
        console.log('Step 9: Checking for responsive tester page...');
        if (window.location.pathname.includes('responsive-tester')) {
            console.log('Responsive tester page detected, initializing simulator...');
            if (typeof window.initializeSimulator === 'function') {
                window.initializeSimulator();
            } else {
                console.error('Simulator initialization function not available');
            }
        }
        
        // Step 10: Initialize PPI calculator if on PPI calculator page
        console.log('Step 10: Checking for PPI calculator page...');
        if (window.location.pathname.includes('ppi-calculator')) {
            console.log('PPI calculator page detected, loading PPI calculator module...');
            try {
                import('./ppi-calculator.js').then(module => {
                    console.log('PPI calculator module loaded, initializing...');
                    module.initializePPICalculator();
                }).catch(error => {
                    console.error('Failed to load PPI calculator module:', error);
                });
            } catch (error) {
                console.error('Error importing PPI calculator module:', error);
            }
        }
        
        // Step 11: Initialize Aspect Ratio calculator if on Aspect Ratio calculator page
        console.log('Step 11: Checking for Aspect Ratio calculator page...');
        if (window.location.pathname.includes('aspect-ratio-calculator')) {
            console.log('Aspect Ratio calculator page detected, loading Aspect Ratio calculator module...');
            try {
                import('./aspect-ratio-calculator.js').then(module => {
                    console.log('Aspect Ratio calculator module loaded, initializing...');
                    module.initializeAspectRatioCalculator();
                }).catch(error => {
                    console.error('Failed to load Aspect Ratio calculator module:', error);
                });
            } catch (error) {
                console.error('Error importing Aspect Ratio calculator module:', error);
            }
        }
        
        // Step 12: Initialize Internal Links Manager
        console.log('Step 12: Initializing Internal Links Manager...');
        try {
            import('./internal-links.js').then(module => {
                console.log('Internal Links module loaded, initializing...');
                module.initializeInternalLinks();
            }).catch(error => {
                console.error('Failed to load Internal Links module:', error);
            });
        } catch (error) {
            console.error('Error importing Internal Links module:', error);
        }
        
        isInitialized = true;
        console.log('✅ Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage();
        
        // 即使出错也要确保基本数值显示
        updateInitialDisplayValues();
    }
}

/**
 * 更新初始显示值，不依赖于i18next或其他系统
 */
function updateInitialDisplayValues() {
    try {
        console.log('直接更新初始显示值...');
        
        // 直接更新视口尺寸，不使用任何依赖
        const viewportDisplay = document.getElementById('viewport-display');
        if (viewportDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // 移除可能导致被翻译系统覆盖的属性
            viewportDisplay.removeAttribute('data-i18n');
            
            // 清除旧内容，包括可能存在的detecting span
            const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 如果是span元素包含detecting，则替换整个内容
                viewportDisplay.innerHTML = '';
            }
            
            // 设置新内容
            viewportDisplay.textContent = `${width} × ${height}`;
            console.log(`视口尺寸已更新: ${width} × ${height}`);
        } else {
            console.warn('视口尺寸元素未找到');
        }
        
        // 直接更新屏幕分辨率，不使用任何依赖
        const screenResolutionDisplay = document.getElementById('screen-resolution-display');
        if (screenResolutionDisplay) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            
            // 检查是否存在旧的结构
            const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
            if (detectingSpan) {
                // 如果找到"detecting..."的span，先移除它
                detectingSpan.parentNode.removeChild(detectingSpan);
            }
            
            // 查找或创建label和value的span元素
            let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
            let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
            
            if (!labelSpan) {
                // 如果没有label span，找第一个子元素，或者创建一个新的
                labelSpan = screenResolutionDisplay.querySelector('span:first-child') || document.createElement('span');
                labelSpan.setAttribute('data-i18n', 'screen_resolution');
                
                // 设置默认文本
                labelSpan.textContent = '屏幕分辨率';
                
                // 如果不在DOM中，添加它
                if (!labelSpan.parentNode) {
                    screenResolutionDisplay.appendChild(labelSpan);
                }
            }
            
            // 确保我们有冒号分隔符
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
            
            // 创建或更新value span
            if (!valueSpan) {
                valueSpan = document.createElement('span');
                screenResolutionDisplay.appendChild(valueSpan);
            }
            
            // 更新值
            valueSpan.removeAttribute('data-i18n');
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
            console.log(`屏幕分辨率已更新: ${screenWidth} × ${screenHeight}`);
        } else {
            console.warn('屏幕分辨率元素未找到');
        }
    } catch (error) {
        console.error('更新初始显示值时出错:', error);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Copy button事件委托
    document.addEventListener('click', handleCopyClick);
    
    // 一键复制全部按钮事件
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            copyAllBtn.disabled = true;
            const originalText = copyAllBtn.textContent;
            try {
                const result = await import('./clipboard.js').then(m => m.copyAllInfo());
                if (result) {
                    copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copied_success') : '已复制!';
                    copyAllBtn.classList.add('copied');
                    setTimeout(() => {
                        copyAllBtn.textContent = originalText;
                        copyAllBtn.classList.remove('copied');
                        copyAllBtn.disabled = false;
                    }, 1500);
                } else {
                    copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_failed') : '复制失败';
                    copyAllBtn.classList.add('error');
                    setTimeout(() => {
                        copyAllBtn.textContent = originalText;
                        copyAllBtn.classList.remove('error');
                        copyAllBtn.disabled = false;
                    }, 2000);
                }
            } catch (e) {
                copyAllBtn.textContent = (typeof i18next !== 'undefined' && i18next.t) ? i18next.t('copy_failed') : '复制失败';
                copyAllBtn.classList.add('error');
                setTimeout(() => {
                    copyAllBtn.textContent = originalText;
                    copyAllBtn.classList.remove('error');
                    copyAllBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    // FAQ toggle functionality
    setupFAQToggles();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        console.log('Setting up theme toggle...');
        themeToggle.addEventListener('click', toggleTheme);
    } else {
        console.warn('Theme toggle button not found');
    }
    
    // Viewport size update on window resize
    window.addEventListener('resize', debounce(updateViewportSize, 250));
    window.addEventListener('resize', debounce(updateViewportDisplay, 250));
    
    // Language change listener
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', async (lng) => {
            console.log('i18next language changed event triggered for:', lng);
            try {
                // 更新UI元素
                updateUIElements();
                
                // 重新检测设备信息以应用新的翻译
                await updateDisplay();
                
                // 更新视口显示
                updateViewportDisplay();
                
                console.log('UI updated after language change');
            } catch (error) {
                console.error('Error updating UI after language change:', error);
            }
        });
    }
}

/**
 * Setup navigation highlighting based on current page
 */
function setupNavigationHighlighting() {
    try {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        
        console.log('Setting up navigation highlighting for path:', currentPath);
        
        // First remove all active classes
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Determine which section we're in
        if (currentPath.includes('/blog/')) {
            // We're in the blog section, find and highlight the blog link
            navLinks.forEach(link => {
                const linkText = link.textContent.trim();
                const linkDataI18n = link.getAttribute('data-i18n');
                
                // Check if this is the blog link by text content or data-i18n attribute
                if (linkDataI18n === 'nav_blog' || linkText.includes('博客') || linkText.includes('Blog')) {
                    link.classList.add('active');
                    console.log('Added active class to blog link');
                }
            });
        } else {
            // We're not in the blog section, find and highlight the home link
            navLinks.forEach(link => {
                const linkDataI18n = link.getAttribute('data-i18n');
                const linkText = link.textContent.trim();
                
                // Check if this is the home link by data-i18n attribute or text content
                if (linkDataI18n === 'nav_home' || linkText.includes('首页') || linkText.includes('Home')) {
                    link.classList.add('active');
                    console.log('Added active class to home link');
                }
            });
        }
    } catch (error) {
        console.error('Error setting up navigation highlighting:', error);
    }
}

/**
 * Setup FAQ toggle functionality
 */
function setupFAQToggles() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

/**
 * Update viewport display in hero section
 */
function updateViewportDisplay() {
    const viewportDisplay = document.getElementById('viewport-display');
    const screenResolutionDisplay = document.getElementById('screen-resolution-display');
    
    if (viewportDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // 直接更新视口尺寸显示，移除翻译属性
        viewportDisplay.removeAttribute('data-i18n');
        // 清除旧内容，包括可能存在的detecting span
        const detectingSpan = viewportDisplay.querySelector('span[data-i18n="detecting"]');
        if (detectingSpan) {
            // 如果是span元素包含detecting，则替换整个内容
            viewportDisplay.innerHTML = '';
        }
        viewportDisplay.textContent = `${width} × ${height}`;
    }
    
    if (screenResolutionDisplay) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // 检查是否存在旧的结构
        const detectingSpan = screenResolutionDisplay.querySelector('span[data-i18n="detecting"]');
        if (detectingSpan) {
            // 如果找到"detecting..."的span，先移除它
            detectingSpan.parentNode.removeChild(detectingSpan);
        }
        
        // 获取或创建标签和值的span
        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        
        // 如果没有标签span，创建一个
        if (!labelSpan) {
            labelSpan = document.createElement('span');
            labelSpan.setAttribute('data-i18n', 'screen_resolution');
            labelSpan.textContent = typeof i18next !== 'undefined' && i18next.t ? 
                i18next.t('screen_resolution') : '屏幕分辨率';
            
            // 清空并重建内容
            screenResolutionDisplay.innerHTML = '';
            screenResolutionDisplay.appendChild(labelSpan);
            screenResolutionDisplay.appendChild(document.createTextNode(': '));
        }
        
        // 如果没有值span，创建一个
        if (!valueSpan) {
            valueSpan = document.createElement('span');
            screenResolutionDisplay.appendChild(valueSpan);
        }
        
        // 确保值span没有data-i18n属性并设置值
        valueSpan.removeAttribute('data-i18n');
        valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
    }
}

/**
 * Initialize theme system
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Initializing theme:', savedTheme);
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log('Toggling theme from', currentTheme, 'to', newTheme);
    
    applyTheme(newTheme);
    updateThemeIcon(newTheme);
    localStorage.setItem('theme', newTheme);
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

/**
 * Show error message
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

/**
 * Show toast notification
 */
export function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    setTimeout(initializeApp, 0);
}

// Also try to initialize after a short delay to ensure all scripts are loaded
setTimeout(() => {
    if (!isInitialized) {
        console.log('Fallback initialization...');
        initializeApp();
    }
}, 100);

// Export for manual initialization if needed
export { initializeApp, toggleTheme, applyTheme, updateThemeIcon, initializeTheme }; 