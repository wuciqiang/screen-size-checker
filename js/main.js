// main.js - Main application entry point

// Import modules
import { initializeI18next, updateUIElements, setupLanguageSelector } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { setPreviewSize, applyCustomSize, setupSimulatorListeners } from './simulator.js';
import { handleCopyClick, copyAllInfo } from './clipboard.js';
import { initCookieNotice, showCookieSettings } from './cookie-notice.js';

// 全局变量，用于存储 i18next 实例
let i18nInstance = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Starting application initialization...');
        
        // Initialize i18next first and wait for it to complete
        i18nInstance = await initializeI18next();
        if (!i18nInstance) {
            throw new Error('i18next initialization failed');
        }
        console.log('i18next initialized successfully');
        
        // Set up language selector
        setupLanguageSelector();
        console.log('Language selector set up');
        
        // Update UI with current language
        updateUIElements();
        console.log('UI elements updated');
        
        // Update device information after i18next is initialized
        await updateDisplay();
        console.log('Device information updated');
        
        // Set up event listeners
        setupEventListeners();
        setupSimulatorListeners();
        console.log('Event listeners set up');

        // Initialize cookie notice
        initCookieNotice();
        console.log('Cookie notice initialized');
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage();
    }
});

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    if (!i18nInstance) {
        console.error('i18next not initialized');
        return;
    }

    // Language change event
    i18nInstance.on('languageChanged', async (lng) => {
        console.log('Language changed to:', lng);
        try {
            updateUIElements();
            await updateDisplay();
        } catch (error) {
            console.error('Error updating UI after language change:', error);
        }
    });

    // Window resize event
    window.addEventListener('resize', () => {
        updateViewportSize();
    });

    // Set up copy button delegation
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', handleCopyClick);
    } else {
        console.warn("Container element not found for copy delegation.");
    }

    // Set up copy all button
    const copyAllBtn = document.getElementById('copy-all-btn');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', async () => {
            const success = await copyAllInfo();
            if (success) {
                copyAllBtn.textContent = i18nInstance.t('copied_all_btn');
                copyAllBtn.classList.add('copied');
                setTimeout(() => {
                    copyAllBtn.textContent = i18nInstance.t('copy_all_btn');
                    copyAllBtn.classList.remove('copied');
                }, 1500);
            } else {
                copyAllBtn.textContent = i18nInstance.t('copy_all_failed_btn');
                setTimeout(() => {
                    copyAllBtn.textContent = i18nInstance.t('copy_all_btn');
                }, 2000);
            }
        });
    }
    
    // Set up cookie settings link
    const cookieSettingsLink = document.getElementById('cookie-settings-link');
    if (cookieSettingsLink) {
        cookieSettingsLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Cookie settings link clicked');
            showCookieSettings();
        });
    } else {
        console.warn("Cookie settings link not found.");
    }
}

/**
 * Show error message to user
 */
function showErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = i18nInstance ? 
        i18nInstance.t('initialization_error') : 
        'Failed to initialize application. Please try refreshing the page.';
    document.body.appendChild(errorMessage);
} 