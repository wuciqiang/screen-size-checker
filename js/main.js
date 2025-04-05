// main.js - Main application entry point

// Import modules
import { initializeI18next, updateUIElements, setupLanguageSelector } from './i18n.js';
import { updateDisplay, updateViewportSize } from './device-detector.js';
import { setPreviewSize, applyCustomSize } from './simulator.js';
import { handleCopyClick } from './clipboard.js';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
async function initializeApp() {
    // Load i18next resources in parallel with other initialization
    const i18nextPromise = initializeI18next();
    
    // Setup event listeners that don't depend on i18next
    setupEventListeners();
    
    // Wait for i18next to be ready
    await i18nextPromise;
    
    // Setup language selector after i18next is initialized
    setupLanguageSelector();
    
    // Update display after i18next is ready
    updateDisplay();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Language Change
    i18next.on('languageChanged', () => {
        updateUIElements();
        updateDisplay(); // Re-run display update after language change
        document.documentElement.lang = i18next.language.split('-')[0]; // Update html lang
    });

    // Window Resize
    window.addEventListener('resize', updateViewportSize);

    // Apply Custom Simulator Size Button
    const applyBtn = document.getElementById('apply-custom-size');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyCustomSize);
    } else {
        console.warn("Apply custom size button not found.");
    }

    // Copy Button Delegation
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('click', handleCopyClick);
    } else {
        console.warn("Container element not found for copy delegation.");
    }
    
    // Make simulator functions available globally
    window.setPreviewSize = setPreviewSize;
} 