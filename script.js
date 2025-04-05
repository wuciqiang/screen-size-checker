// --- Initialization ---
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    // Load i18next resources in parallel with other initialization
    const i18nextPromise = initializeI18next();
    
    // Setup event listeners that don't depend on i18next
    setupEventListeners();
    
    // Wait for i18next to be ready
    await i18nextPromise;
    
    // Update display after i18next is ready
    updateDisplay();
}

// --- i18next Initialization ---
async function initializeI18next() {
    // Preload the default language (English) to avoid initial flash
    const defaultLng = 'en';
    
    // Initialize with default language first
    await i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            lng: defaultLng,
            fallbackLng: defaultLng,
            supportedLngs: ['en', 'zh', 'fr', 'de', 'ko', 'ja'],
            backend: {
                loadPath: 'locales/{{lng}}/{{ns}}.json',
                // Add cache control headers
                allowMultiLoading: true,
                reloadInterval: false
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage'],
                lookupLocalStorage: 'i18nextLng'
            },
            // Performance optimizations
            initImmediate: true,
            appendNamespaceToCIMode: false,
            keySeparator: '.',
            nsSeparator: ':',
            // Disable debug in production
            debug: false
        });
    
    // Update UI with initial translations
    updateUIElements();
    setupLanguageSelector();
    
    // Update html lang attribute
    document.documentElement.lang = i18next.language.split('-')[0];
    
    // Preload other languages in the background
    preloadOtherLanguages();
    
    return i18next;
}

// Preload other languages in the background
function preloadOtherLanguages() {
    const languages = ['zh', 'fr', 'de', 'ko', 'ja'];
    languages.forEach(lng => {
        if (lng !== i18next.language) {
            i18next.loadNamespaces(lng, () => {
                console.log(`Preloaded language: ${lng}`);
            });
        }
    });
}

// --- UI Update Functions ---

function updateUIElements() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        let attribute = 'textContent';
        let actualKey = key;

        if (key.startsWith('[')) {
            const parts = key.match(/\[(.*?)\](.*)/);
            if (parts && parts.length === 3) {
                attribute = parts[1];
                actualKey = parts[2];
            } else {
                 console.warn(`Invalid data-i18n attribute format: ${key}`);
                 return; // Skip invalid format
            }
        }

        const translation = i18next.t(actualKey);

        if (el.tagName === 'TITLE') {
            document.title = translation;
        } else if (el.tagName === 'META' && attribute === 'content') {
            el.setAttribute('content', translation);
        } else if (attribute === 'placeholder') {
             el.setAttribute('placeholder', translation);
         }else if (attribute !== 'textContent' && el.hasAttribute(attribute)) {
            el.setAttribute(attribute, translation);
        } else {
            // Ensure we don't try to set textContent on elements that shouldn't have it directly
             if (typeof el.textContent !== 'undefined') {
                el.textContent = translation;
            }
        }
    });
     // Specifically re-translate copy button texts if they were in "Copied!" state
     document.querySelectorAll('.copy-btn.copied').forEach(btn => {
        btn.textContent = i18next.t('copy_btn');
        btn.classList.remove('copied'); // Reset class if language changes
    });
}


function updateDisplay() {
    if (!i18next.isInitialized) return;
    const t = i18next.t;
    const parser = new UAParser(); // Initialize UA Parser
    const result = parser.getResult();

    // Screen Resolution
    setTextContent('screen-resolution', `${window.screen.width} x ${window.screen.height}`, t('not_available'));

    // Viewport Size
    updateViewportSize(); // Call dedicated function for viewport

    // DPR
    setTextContent('dpr', window.devicePixelRatio, t('not_available'));

    // Color Depth
    setTextContent('color-depth', window.screen.colorDepth ? `${window.screen.colorDepth}-bit` : null, t('not_available'));

    // OS Info
    const osInfo = result.os.name && result.os.version ? `${result.os.name} ${result.os.version}` : result.os.name;
    setTextContent('os-info', osInfo, t('not_available'));

    // Browser Info
    const browserInfo = result.browser.name && result.browser.version ? `${result.browser.name} ${result.browser.version}` : result.browser.name;
    setTextContent('browser-info', browserInfo, t('not_available'));

    // Cookies Enabled
    setTextContent('cookies-enabled', navigator.cookieEnabled ? t('cookies_enabled_yes') : t('cookies_enabled_no'), t('not_available'));

    // Touch Support
    const touchSupport = ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
    setTextContent('touch-support', touchSupport ? t('touch_supported') : t('touch_not_supported'), t('not_available'));

    // User Agent
    const userAgentTextarea = document.getElementById('user-agent');
    if (userAgentTextarea) {
        userAgentTextarea.value = navigator.userAgent || t('not_available');
        // Update placeholder if needed
        const placeholderKeyAttr = userAgentTextarea.getAttribute('data-i18n');
        if (placeholderKeyAttr && placeholderKeyAttr.startsWith('[placeholder]')) {
            userAgentTextarea.setAttribute('placeholder', t(placeholderKeyAttr.substring('[placeholder]'.length)));
        }
    }
}

function updateViewportSize() {
     if (!i18next.isInitialized) return;
     const t = i18next.t;
     const viewportW = window.innerWidth;
     const viewportH = window.innerHeight;
     const viewportValueEl = document.getElementById('viewport-value'); // Use the span with ID
     const viewportNoteSpan = document.getElementById('viewport-size')?.querySelector('span.note');

     if (viewportValueEl) {
         viewportValueEl.textContent = viewportW && viewportH ? `${viewportW} x ${viewportH}` : t('not_available');
     }
     if (viewportNoteSpan) {
         viewportNoteSpan.textContent = t('viewport_dynamic_note');
     }
}


// Helper to set text content safely
function setTextContent(elementId, value, fallback) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = (value !== null && typeof value !== 'undefined' && value !== '') ? value : fallback;
    } else {
        console.warn(`Element with ID "${elementId}" not found.`);
    }
}


// --- Simulator Functions ---
function setPreviewSize(width, height) {
    if (!i18next.isInitialized) return;
    const t = i18next.t;
    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');
    if (!frame || !sizeDisplay) return;

    const container = document.querySelector('.container');
    if (!container) return;

    const maxWidth = container.offsetWidth - 44;
    const maxHeight = window.innerHeight * 0.6; // Allow slightly more height

    // Ensure valid numbers before calculating min
    const validWidth = (typeof width === 'number' && !isNaN(width)) ? width : 0;
    const validHeight = (typeof height === 'number' && !isNaN(height)) ? height : 0;

    const effectiveWidth = Math.max(50, Math.min(validWidth, maxWidth)); // Ensure minimum size
    const effectiveHeight = Math.max(50, Math.min(validHeight, maxHeight));

    frame.style.width = `${effectiveWidth}px`;
    frame.style.height = `${effectiveHeight}px`;

    sizeDisplay.textContent = `${t('simulator_current_size')} ${validWidth} x ${validHeight}`;
}

function applyCustomSize() {
    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        setPreviewSize(width, height);
    } else {
        // Optional: Provide feedback for invalid input
        alert(i18next.t('invalid_custom_size_alert') || 'Please enter valid positive numbers for width and height.');
        console.warn("Invalid custom dimensions entered.");
    }
}

// --- Event Listeners Setup ---
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
}

function setupLanguageSelector() {
     const langSelector = document.getElementById('language-select');
    if (langSelector) {
        langSelector.value = i18next.language.split('-')[0];
        langSelector.addEventListener('change', (event) => {
            const chosenLng = event.target.value;
            i18next.changeLanguage(chosenLng, (err) => {
                if (err) return console.error('Error changing language:', err);
            });
        });
    } else {
         console.warn("Language selector not found.");
    }
}


// --- Clipboard Functionality ---
async function handleCopyClick(event) {
    if (!event.target.classList.contains('copy-btn')) {
        return; // Ignore clicks not on a copy button
    }

    const button = event.target;
    const targetId = button.dataset.clipboardTarget;
    if (!targetId) {
        console.warn("Copy button missing data-clipboard-target attribute.");
        return;
    }

    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
        console.warn(`Target element with ID "${targetId}" not found for copying.`);
        return;
    }

    let textToCopy = '';
    // Check if target is textarea or other element
    if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
        textToCopy = targetElement.value;
    } else {
        textToCopy = targetElement.textContent;
    }

     if (!textToCopy || textToCopy === i18next.t('detecting') || textToCopy === i18next.t('not_available')) {
         console.info("Attempted to copy placeholder or unavailable text.");
         // Optional: Provide visual feedback that nothing was copied
          const originalText = button.textContent;
          button.textContent = i18next.t('copy_nothing_feedback') || "Nothing to copy";
          button.disabled = true;
          setTimeout(() => {
              button.textContent = originalText; // Restore original text
               button.disabled = false;
          }, 1500);
         return;
     }


    try {
        await navigator.clipboard.writeText(textToCopy);
        // Visual feedback
        const originalText = i18next.t('copy_btn'); // Get translated "Copy" text
        button.textContent = i18next.t('copied_btn'); // Get translated "Copied!" text
        button.classList.add('copied');
        button.disabled = true; // Briefly disable button

        // Reset button after a delay
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
            button.disabled = false;
        }, 1500); // 1.5 seconds

    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Optional: Provide user feedback about the error
        const originalText = button.textContent;
        button.textContent = i18next.t('copy_failed_feedback') || "Copy failed";
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }
}