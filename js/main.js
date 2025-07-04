// main.js - Main application initialization and coordination

import { initializeI18next, updateUIElements, setupLanguageSelector, setTextContent } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { handleCopyClick } from './clipboard.js';
import { calculateAspectRatio, debounce } from './utils.js';

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Initialize internationalization first
        await initializeI18next();
        
        // Setup language selector
        setupLanguageSelector();
        
        // Update UI elements with current language
        updateUIElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start device detection
        await updateDisplay();
        
        // Setup viewport size monitoring
        updateViewportSize();
        
        // Initialize theme
        initializeTheme();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
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
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Viewport size update on window resize
    window.addEventListener('resize', debounce(updateViewportSize, 250));
    
    // Update viewport display on resize
    window.addEventListener('resize', debounce(updateViewportDisplay, 250));
    
    // Language change listener
    if (typeof i18next !== 'undefined') {
        i18next.on('languageChanged', async (lng) => {
            console.log('Language changed to:', lng);
            try {
                updateUIElements();
                await updateDisplay();
                updateViewportDisplay(); // 重新更新视口显示
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
        
        // Update hero display using setTextContent to avoid conflicts
        setTextContent('viewport-display', `${width} × ${height}`);
        
        // Update screen resolution in hero with translation
        const screenResolutionLabel = screenResolutionDisplay.querySelector('span:first-child');
        const screenResolutionValue = screenResolutionDisplay.querySelector('span:last-child');
        
        if (screenResolutionLabel && typeof i18next !== 'undefined' && i18next.t) {
            screenResolutionLabel.textContent = i18next.t('screen_resolution');
        }
        
        if (screenResolutionValue) {
            // Remove data-i18n attribute from value span
            screenResolutionValue.removeAttribute('data-i18n');
            screenResolutionValue.textContent = `${screenWidth} × ${screenHeight}`;
        }
    }
}

/**
 * Initialize theme system
 */
function initializeTheme() {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    applyTheme(newTheme);
    updateThemeIcon(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme toggled to:', newTheme);
}

/**
 * Apply theme to document
 * @param {string} theme - Theme name ('light' or 'dark')
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Update theme toggle icon
 * @param {string} theme - Current theme
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
            <h2 data-i18n="error_title">检测失败</h2>
            <p data-i18n="error_message">无法检测设备信息，请刷新页面重试。</p>
            <button onclick="window.location.reload()" data-i18n="error_retry">重试</button>
        `;
        
        // Insert at the beginning of main content
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        
        // Update translations for error message
        updateUIElements();
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Display duration in milliseconds
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



// Export theme functions for external use
export { toggleTheme, applyTheme, updateThemeIcon, initializeTheme };

// Auto-initialize when module is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
} 