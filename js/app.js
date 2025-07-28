// app.js - Main application entry point (Performance Optimized)

console.log('🚀 Starting app.js module load...');

// Only import critical utilities immediately
import { debounce } from './utils.js';

console.log('✅ Critical modules imported successfully');

// Lazy load modules when needed
let i18nModule = null;
let deviceDetectorModule = null;
let clipboardModule = null;
let languageModalModule = null;

// Global initialization flag
let isInitialized = false;

/**
 * Initialize the complete application with performance optimization
 */
async function initializeApp() {
    if (isInitialized) {
        console.log('App already initialized');
        return;
    }

    try {
        console.log('Starting optimized application initialization...');
        
        // PHASE 1: Critical immediate initialization
        updateInitialDisplayValues();
        initializeTheme();
        setupNavigationHighlighting();
        
        // PHASE 2: Setup basic event listeners (non-blocking)
        setupBasicEventListeners();
        
        // PHASE 3: Lazy load and initialize non-critical modules
        setTimeout(async () => {
            await initializeNonCriticalModules();
        }, 50); // Small delay to allow critical content to render
        
        isInitialized = true;
        console.log('✅ Critical application initialization completed!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage();
        updateInitialDisplayValues();
    }
}

/**
 * Initialize non-critical modules asynchronously
 */
async function initializeNonCriticalModules() {
    try {
        console.log('Loading non-critical modules...');
        
        // Load i18n module
        if (!i18nModule) {
            i18nModule = await import('./i18n.js');
            await i18nModule.initializeI18next();
            i18nModule.setupLanguageSelector();
            i18nModule.updateUIElements();
        }
        
        // Load device detector module
        if (!deviceDetectorModule) {
            deviceDetectorModule = await import('./device-detector.js');
            await deviceDetectorModule.updateDisplay();
            deviceDetectorModule.updateViewportSize();
        }
        
        // Setup advanced event listeners
        setupAdvancedEventListeners();
        
        // Load page-specific modules
        loadPageSpecificModules();
        
        console.log('✅ Non-critical modules loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading non-critical modules:', error);
    }
}

/**
 * Load page-specific modules only when needed
 */
function loadPageSpecificModules() {
    const currentPath = window.location.pathname;
    
    // PPI Calculator
    if (currentPath.includes('ppi-calculator')) {
        import('./ppi-calculator.js').then(module => {
            module.initializePPICalculator();
        }).catch(console.error);
    }
    
    // Aspect Ratio Calculator
    if (currentPath.includes('aspect-ratio-calculator')) {
        import('./aspect-ratio-calculator.js').then(module => {
            module.initializeAspectRatioCalculator();
        }).catch(console.error);
    }
    
    // Responsive Tester
    if (currentPath.includes('responsive-tester')) {
        if (typeof window.initializeSimulator === 'function') {
            window.initializeSimulator();
        }
    }
    
    // Internal Links (load for all pages but with low priority)
    setTimeout(() => {
        import('./internal-links.js').then(module => {
            module.initializeInternalLinks();
        }).catch(console.error);
    }, 1000);
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
 * Setup basic event listeners (critical, non-blocking)
 */
function setupBasicEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Language selector basic setup (before i18n loads)
    setupBasicLanguageSelector();
    
    // Viewport size update on window resize (critical for screen checker)
    window.addEventListener('resize', debounce(updateViewportDisplay, 100));
    
    // FAQ toggle functionality
    setupFAQToggles();
}

/**
 * Navigate to the corresponding language URL
 */
function navigateToLanguage(newLang) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    console.log('Navigating to language:', newLang, 'from path:', currentPath);
    
    // Save language preference
    localStorage.setItem('i18nextLng', newLang);
    
    let newPath;
    
    // Handle different URL patterns
    if (currentPath.includes('/multilang-build/')) {
        // We're in the build directory structure like /multilang-build/en/index.html
        const buildMatch = currentPath.match(/^(.*)\/multilang-build\/([a-z]{2})(\/.*)?$/);
        if (buildMatch) {
            const basePath = buildMatch[1] || '';
            const currentLang = buildMatch[2];
            const pathAfterLang = buildMatch[3] || '/index.html';
            
            if (currentLang === newLang) {
                console.log('Already in the correct language');
                return;
            }
            
            newPath = `${basePath}/multilang-build/${newLang}${pathAfterLang}`;
        } else {
            // Fallback for build directory
            newPath = `/multilang-build/${newLang}/index.html`;
        }
    } else {
        // Standard URL pattern like /en/... or /zh/...
        const langMatch = currentPath.match(/^\/([a-z]{2})(\/.*)?$/);
        
        if (langMatch) {
            // We're in a language path like /en/... or /zh/...
            const currentLang = langMatch[1];
            const pathAfterLang = langMatch[2] || '/';
            
            if (currentLang === newLang) {
                console.log('Already in the correct language');
                return;
            }
            
            // Replace the language part
            newPath = `/${newLang}${pathAfterLang}`;
        } else if (currentPath === '/' || currentPath === '') {
            // We're at the root, go to the language root
            newPath = `/${newLang}/`;
        } else {
            // We're in a path without language prefix, add the language
            newPath = `/${newLang}${currentPath}`;
        }
    }
    
    // Construct the full URL
    const newUrl = newPath + currentSearch + currentHash;
    
    console.log('Navigating to:', newUrl);
    
    // Navigate to the new URL
    window.location.href = newUrl;
}

/**
 * Setup basic language selector functionality before i18n loads
 */
function setupBasicLanguageSelector() {
    // Setup modal-based language selector
    const languageModalTrigger = document.getElementById('language-modal-trigger');
    const languageModal = document.getElementById('language-modal');
    const languageModalClose = document.getElementById('language-modal-close');
    const languageModalBackdrop = document.getElementById('language-modal-backdrop');
    
    if (languageModalTrigger && languageModal) {
        console.log('Setting up basic language modal (before i18n)');
        
        // Open modal when button is clicked
        languageModalTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            languageModal.classList.add('show');
            languageModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            console.log('Language modal opened');
        });
        
        // Close modal function
        const closeModal = () => {
            languageModal.classList.remove('show');
            languageModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            console.log('Language modal closed');
        };
        
        // Close modal when close button is clicked
        if (languageModalClose) {
            languageModalClose.addEventListener('click', closeModal);
        }
        
        // Close modal when backdrop is clicked
        if (languageModalBackdrop) {
            languageModalBackdrop.addEventListener('click', closeModal);
        }
        
        // Close modal when Escape key is pressed
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && languageModal.classList.contains('show')) {
                closeModal();
            }
        });
        
        // Setup language card clicks (direct navigation for multilang build)
        const languageCards = languageModal.querySelectorAll('.language-card:not(.disabled)');
        languageCards.forEach(card => {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                const newLang = card.getAttribute('data-lang');
                console.log('Language card clicked:', newLang);
                
                // Show loading state
                const originalContent = card.innerHTML;
                card.innerHTML = '<div class="lang-name">Loading...</div>';
                
                try {
                    // Close modal first
                    const modal = document.getElementById('language-modal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }
                    
                    // Navigate to the new language URL immediately
                    navigateToLanguage(newLang);
                } catch (error) {
                    console.error('Error changing language:', error);
                    card.innerHTML = originalContent;
                    
                    // Show error message
                    alert('Language switch failed. Please try again.');
                }
            });
        });
    }
    
    // Setup legacy select element
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        console.log('Setting up basic language select (before i18n)');
        
        languageSelect.addEventListener('change', async (event) => {
            const newLang = event.target.value;
            console.log('Language select changed to:', newLang);
            
            // If i18n is not loaded yet, wait for it
            if (typeof i18next === 'undefined' || !i18nModule) {
                languageSelect.disabled = true;
                
                // Wait for i18n to load
                let retries = 0;
                const maxRetries = 50;
                while (retries < maxRetries && (!i18nModule || typeof i18next === 'undefined')) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    retries++;
                }
                
                if (i18nModule && typeof i18next !== 'undefined') {
                    try {
                        await i18next.changeLanguage(newLang);
                        localStorage.setItem('i18nextLng', newLang);
                        document.documentElement.lang = newLang;
                        
                        if (i18nModule.updateUIElements) {
                            i18nModule.updateUIElements();
                        }
                    } catch (error) {
                        console.error('Error changing language:', error);
                    }
                }
                
                languageSelect.disabled = false;
            } else {
                // i18n is already loaded
                try {
                    languageSelect.disabled = true;
                    await i18next.changeLanguage(newLang);
                    localStorage.setItem('i18nextLng', newLang);
                    document.documentElement.lang = newLang;
                    
                    if (i18nModule.updateUIElements) {
                        i18nModule.updateUIElements();
                    }
                    
                    languageSelect.disabled = false;
                } catch (error) {
                    console.error('Error changing language:', error);
                    languageSelect.disabled = false;
                }
            }
        });
    }
}

/**
 * Setup advanced event listeners (non-critical, can be delayed)
 */
function setupAdvancedEventListeners() {
    // Copy button事件委托 - lazy load clipboard module
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('copy-btn') || event.target.closest('.copy-btn')) {
            if (!clipboardModule) {
                clipboardModule = await import('./clipboard.js');
            }
            clipboardModule.handleCopyClick(event);
        }
    });
    
    // 一键复制全部按钮事件
    const copyAllBtn = document.getElementById('copy-all-info');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            copyAllBtn.disabled = true;
            const originalText = copyAllBtn.textContent;
            try {
                if (!clipboardModule) {
                    clipboardModule = await import('./clipboard.js');
                }
                const result = await clipboardModule.copyAllInfo();
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
    
    // Language change listener
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', async (lng) => {
            console.log('i18next language changed event triggered for:', lng);
            try {
                if (i18nModule) {
                    i18nModule.updateUIElements();
                }
                
                if (deviceDetectorModule) {
                    await deviceDetectorModule.updateDisplay();
                }
                
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
        viewportDisplay.textContent = `${width} × ${height}`;
    }
    
    if (screenResolutionDisplay) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // 获取现有的标签和值的span
        let labelSpan = screenResolutionDisplay.querySelector('span[data-i18n="screen_resolution"]');
        let valueSpan = screenResolutionDisplay.querySelector('span:not([data-i18n])');
        
        // 如果找到了值span，只更新其内容
        if (valueSpan) {
            valueSpan.textContent = `${screenWidth} × ${screenHeight}`;
        }
        
        // 如果找到了标签span并且i18next可用，更新翻译
        if (labelSpan && typeof i18next !== 'undefined' && i18next.t) {
            labelSpan.textContent = i18next.t('screen_resolution');
        }
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