// --- i18next Initialization ---
async function initializeI18next() {
    // Wait for i18next initialization to complete
    await i18next
        .use(i18nextHttpBackend) // Use http backend to load locales/xx/translation.json
        .use(i18nextBrowserLanguageDetector) // Use language detector
        .init({
            // debug: true, // Uncomment for development logs
            lng: 'en',          // <-- Force English on initial load
            fallbackLng: 'en',  // Fallback to English if detected or requested lang is unavailable
            supportedLngs: ['en', 'zh', 'fr', 'de', 'ko', 'ja'], // Explicitly list supported languages
            backend: {
                loadPath: 'locales/{{lng}}/{{ns}}.json' // Path format for translation files
            },
            detection: {
                // Detection order: Check localStorage first, then browser navigator.language
                order: ['localStorage', 'navigator'],
                // Cache user's language choice in localStorage
                caches: ['localStorage'],
                // Key name used in localStorage
                lookupLocalStorage: 'i18nextLng'
            }
        });

    // --- Initialize UI Translation ---
    updateUIElements(); // Translate all marked elements using the current language (initially 'en')

    // --- Setup Language Selector Dropdown ---
    const langSelector = document.getElementById('language-select');
    if (langSelector) {
        // Set the dropdown's current value to the language detected or defaulted by i18next
        // Use split('-')[0] to get the base language code (e.g., 'en' from 'en-US')
        langSelector.value = i18next.language.split('-')[0];

        // Add event listener for when the user changes the dropdown selection
        langSelector.addEventListener('change', (event) => {
            const chosenLng = event.target.value;
            // Call i18next to change the language
            i18next.changeLanguage(chosenLng, (err, t) => {
                if (err) return console.error('Error changing language:', err);
                // i18next will trigger the 'languageChanged' event,
                // which is handled by the listener below to update the UI
            });
        });
    }

    // --- Listen for Language Change Event ---
    i18next.on('languageChanged', () => {
        updateUIElements(); // Retranslate all UI elements when language changes
        // Rerun updateDisplay to ensure texts like "Detecting..." are correctly translated
        updateDisplay();
         // Update html lang attribute
         document.documentElement.lang = i18next.language.split('-')[0];
    });

     // Update html lang attribute on initial load
     document.documentElement.lang = i18next.language.split('-')[0];

    // --- Display Screen Info on Initial Load ---
    updateDisplay(); // Call your original function to fetch and display screen data
}

// --- Function to Update UI Element Text ---
function updateUIElements() {
    // Find all elements with the data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        let attribute = 'textContent'; // Default action is to update text content

        // Check for attribute update syntax, e.g., [placeholder]key
        if (key.startsWith('[')) {
            const parts = key.match(/\[(.*?)\](.*)/); // Regex to match [attributeName]keyName
            if (parts && parts.length === 3) {
                attribute = parts[1]; // Get the attribute name
                const actualKey = parts[2]; // Get the actual translation key

                // Special handling for title and meta description
                if (el.tagName === 'TITLE') {
                    document.title = i18next.t(actualKey);
                } else if (el.tagName === 'META' && attribute === 'content') {
                    el.setAttribute('content', i18next.t(actualKey));
                } else if (el.hasAttribute(attribute)) { // Update other HTML attributes
                    el.setAttribute(attribute, i18next.t(actualKey));
                } else if (attribute === 'placeholder' && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
                     // Explicitly handle placeholder for input/textarea
                     el.setAttribute('placeholder', i18next.t(actualKey));
                 }
                // Return here as we've handled the attribute update
                return;
            }
        }

        // Update the element's text content (default case)
        // Special case for title as it's not in document.body
        if (el.tagName === 'TITLE') {
             document.title = i18next.t(key);
         } else {
             el.textContent = i18next.t(key); // Get translation for the current language using i18next.t()
         }
    });
}


// --- Your Original Functions (Modified for Translation) ---

// Function to update displayed information
function updateDisplay() {
    // Check if i18next is initialized and ready
    if (!i18next.isInitialized) {
        // console.warn("i18next not ready yet in updateDisplay"); // Optional warning
        return; // Don't run if i18next isn't ready
    }
    const t = i18next.t; // Get the translation function for convenience

    // 1. Screen Resolution
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    const screenResEl = document.getElementById('screen-resolution');
    if (screenResEl) {
        screenResEl.textContent = screenW && screenH ? `${screenW} x ${screenH}` : t('not_available'); // Use translation
    }

    // 2. Viewport Size
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewportValueSpan = document.getElementById('viewport-size')?.querySelector('span:not(.note)');
    const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');
    if (viewportValueSpan) {
        viewportValueSpan.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available'); // Use translation
    }
     if (viewportNoteSpan) {
        viewportNoteSpan.textContent = t('viewport_dynamic_note'); // Update note text translation
    }

    // 3. Device Pixel Ratio
    const dpr = window.devicePixelRatio;
    const dprEl = document.getElementById('dpr');
     if (dprEl) {
        dprEl.textContent = dpr ? dpr : t('not_available'); // Use translation
    }

    // 4. Color Depth
    const colorDepth = window.screen.colorDepth;
    const colorDepthEl = document.getElementById('color-depth');
    if (colorDepthEl) {
        colorDepthEl.textContent = colorDepth ? `${colorDepth}-bit` : t('not_available'); // Use translation
    }

    // 5. User Agent
    const userAgent = navigator.userAgent;
    const userAgentTextarea = document.getElementById('user-agent');
    if (userAgentTextarea) {
         userAgentTextarea.value = userAgent ? userAgent : t('not_available'); // Use translation for value if needed, though UA is usually not translated
         // Update placeholder translation if data-i18n is set for it
         const placeholderKeyAttr = userAgentTextarea.getAttribute('data-i18n');
         if (placeholderKeyAttr && placeholderKeyAttr.startsWith('[placeholder]')) {
             const placeholderKey = placeholderKeyAttr.substring('[placeholder]'.length);
             userAgentTextarea.setAttribute('placeholder', t(placeholderKey));
         }
    }
}

// Function to update simulator preview size (Modified for label translation)
function setPreviewSize(width, height) {
     // Check if i18next is initialized and ready
     if (!i18next.isInitialized) {
        // console.warn("i18next not ready yet in setPreviewSize"); // Optional warning
        return;
    }
    const t = i18next.t; // Get translation function
    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');

    if (!frame || !sizeDisplay) return; // Exit if elements not found

    const container = document.querySelector('.container');
    if (!container) return; // Exit if container not found

    const maxWidth = container.offsetWidth - 44; // Account for padding/border
    const maxHeight = window.innerHeight * 0.5; // Limit height

    const effectiveWidth = Math.min(width, maxWidth);
    const effectiveHeight = Math.min(height, maxHeight);

    frame.style.width = `${effectiveWidth}px`;
    frame.style.height = `${effectiveHeight}px`;

    // Update size display text, ensuring the label part is translated
    sizeDisplay.textContent = `${t('simulator_current_size')} ${width} x ${height}`;
}

// --- Event Listeners ---

// When the DOM is fully loaded, initialize i18next and perform initial UI update
document.addEventListener('DOMContentLoaded', initializeI18next);

// When the browser window resizes, dynamically update the viewport size display
window.addEventListener('resize', () => {
    // Check if i18next is initialized and ready
    if (!i18next.isInitialized) {
        return;
    }
    const t = i18next.t; // Get translation function
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const viewportValueSpan = document.getElementById('viewport-size')?.querySelector('span:not(.note)');
    const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');
    if (viewportValueSpan) {
        viewportValueSpan.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available');
    }
     if (viewportNoteSpan) {
        viewportNoteSpan.textContent = t('viewport_dynamic_note'); // Ensure note text also updates
    }
});