// app.js - Main application entry point

console.log('🚀 Starting app.js module load...');

// Import all required modules
import { initializeI18next, updateUIElements, setupLanguageSelector, setTextContent } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { handleCopyClick } from './clipboard.js';
import { debounce } from './utils.js';
import { LanguageModal } from './language-modal.js';

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
        
        // Step 5: Initialize theme system
        console.log('Step 5: Initializing theme...');
        initializeTheme();
        
        // Step 6: Start device detection
        console.log('Step 6: Starting device detection...');
        await updateDisplay();
        
        // Step 7: Setup viewport monitoring
        console.log('Step 7: Setting up viewport monitoring...');
        updateViewportSize();
        updateViewportDisplay();
        
        isInitialized = true;
        console.log('✅ Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showErrorMessage();
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Copy button event delegation
    document.addEventListener('click', handleCopyClick);
    
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
    
    if (viewportDisplay && screenResolutionDisplay) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // Update hero display
        setTextContent('viewport-display', `${width} × ${height}`);
        
        // Update screen resolution
        const screenResolutionLabel = screenResolutionDisplay.querySelector('span:first-child');
        const screenResolutionValue = screenResolutionDisplay.querySelector('span:last-child');
        
        if (screenResolutionLabel && typeof i18next !== 'undefined' && i18next.t) {
            screenResolutionLabel.textContent = i18next.t('screen_resolution');
        }
        
        if (screenResolutionValue) {
            screenResolutionValue.removeAttribute('data-i18n');
            screenResolutionValue.textContent = `${screenWidth} × ${screenHeight}`;
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