// main.js - Main application entry point

// Import modules
import { initializeI18next, updateUIElements, setupLanguageSelector } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { setPreviewSize, applyCustomSize } from './simulator.js';
import { handleCopyClick } from './clipboard.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Starting application initialization...');
        
        // Initialize i18next first and wait for it to complete
        const i18n = await initializeI18next();
        if (!i18n) {
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
        console.log('Event listeners set up');
        
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
    if (!i18next.isInitialized) {
        console.error('i18next not initialized');
        return;
    }

    // Language change event
    i18next.on('languageChanged', async (lng) => {
        console.log('Language changed to:', lng);
        updateUIElements();
        await updateDisplay(); // Update device info when language changes
    });

    // Window resize event
    window.addEventListener('resize', () => {
        updateViewportSize();
    });

    // Copy button click event
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const userAgentTextarea = document.getElementById('user-agent');
            if (userAgentTextarea) {
                userAgentTextarea.select();
                document.execCommand('copy');
                copyButton.textContent = i18next.t('copy_success');
                setTimeout(() => {
                    copyButton.textContent = i18next.t('copy_button');
                }, 2000);
            }
        });
    }
}

/**
 * Show error message to user
 */
function showErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Failed to initialize application. Please refresh the page.';
    document.body.appendChild(errorMessage);
} 