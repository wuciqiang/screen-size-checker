// simulator.js - Device simulator module

/**
 * Set preview size for device simulation
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 */
function setPreviewSize(width, height) {
    console.log(`Setting preview size: ${width} × ${height}`);

    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');
    const frameWrapper = document.getElementById('simulator-frame-wrapper');

    if (!frame) console.warn("simulator-frame element not found");
    if (!sizeDisplay) console.warn("simulator-size-display element not found");
    if (!frameWrapper) console.warn("simulator-frame-wrapper element not found");

    if (!frame || !sizeDisplay || !frameWrapper) {
        console.warn("Required simulator elements not found");
        return;
    }

    // Ensure valid numbers before calculating
    const validWidth = (typeof width === 'number' && !isNaN(width)) ? width : 0;
    const validHeight = (typeof height === 'number' && !isNaN(height)) ? height : 0;

    console.log(`Applying dimensions: ${validWidth} × ${validHeight}`);

    // Set iframe dimensions
    frame.style.width = `${validWidth}px`;
    frame.style.height = `${validHeight}px`;

    // 更新尺寸显示，使用安全的方法避免undefined
    sizeDisplay.removeAttribute('data-i18n'); // 移除可能导致翻译覆盖的属性

    // 获取当前文本并提取前缀部分（可能包含"当前尺寸："或"Current Size:"）
    const currentText = sizeDisplay.textContent || '';
    let prefix = '';

    // 尝试提取前缀部分（任何冒号之前的内容）
    const colonIndex = Math.max(
        currentText.lastIndexOf(':'),
        currentText.lastIndexOf('：')
    );

    if (colonIndex > 0) {
        prefix = currentText.substring(0, colonIndex + 1) + ' ';
    } else {
        // 如果没有找到前缀，使用默认值
        prefix = window.i18next && window.i18next.isInitialized && window.i18next.t ?
            (window.i18next.t('current_size') + ': ') :
            '当前尺寸: ';
    }

    // 确保前缀不包含"undefined"
    if (prefix.includes('undefined')) {
        prefix = '当前尺寸: ';
    }

    // 设置完整的文本
    sizeDisplay.textContent = `${prefix}${validWidth} × ${validHeight}`;

    // Update active state on device buttons
    updateActiveDeviceButton(validWidth, validHeight);

    // Update custom size inputs
    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');

    if (widthInput && heightInput) {
        widthInput.value = validWidth;
        heightInput.value = validHeight;
    } else {
        console.warn("Custom size inputs not found when updating");
    }
}

/**
 * Update active state on device buttons
 */
function updateActiveDeviceButton(width, height) {
    const buttons = document.querySelectorAll('.device-buttons button');

    if (buttons.length === 0) {
        console.warn("No device buttons found");
        return;
    }

    console.log(`Updating active button for: ${width} × ${height}`);
    console.log(`Found ${buttons.length} device buttons`);

    buttons.forEach(button => {
        const buttonWidth = parseInt(button.dataset.width, 10);
        const buttonHeight = parseInt(button.dataset.height, 10);

        if (buttonWidth === width && buttonHeight === height) {
            button.classList.add('active');
            console.log(`Activated button: ${button.textContent}`);
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Apply custom size from input fields
 */
function applyCustomSize() {
    console.log("Applying custom size");

    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');

    if (!widthInput) console.warn("custom-width input not found");
    if (!heightInput) console.warn("custom-height input not found");

    if (!widthInput || !heightInput) {
        console.warn("Custom size inputs not found");
        return;
    }

    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        setPreviewSize(width, height);
    } else {
        console.warn(`Invalid custom size values: width=${width}, height=${height}`);
        // Provide feedback for invalid input
        showToast(window.i18next && window.i18next.t ? window.i18next.t('invalid_custom_size_alert') : 'Please enter valid positive numbers for width and height.');
    }
}

/**
 * Rotate the current dimensions
 */
function rotateDevice() {
    console.log("Rotating device dimensions");

    const frame = document.getElementById('simulator-frame');

    if (!frame) {
        console.warn("Simulator frame not found");
        return;
    }

    const currentWidth = parseInt(frame.style.width, 10);
    const currentHeight = parseInt(frame.style.height, 10);

    if (!isNaN(currentWidth) && !isNaN(currentHeight)) {
        console.log(`Rotating from ${currentWidth}×${currentHeight} to ${currentHeight}×${currentWidth}`);
        setPreviewSize(currentHeight, currentWidth);
    } else {
        console.warn(`Unable to rotate: invalid dimensions (width=${currentWidth}, height=${currentHeight})`);
    }
}

/**
 * Load website in the simulator iframe
 * @param {string} url - URL to load
 */
function loadWebsite(url) {
    console.log(`Loading website: ${url || 'default site'}`);

    const frame = document.getElementById('simulator-frame');

    if (!frame) {
        console.warn("Simulator frame not found");
        return;
    }

    if (!url) {
        // Default to current site if no URL provided
        frame.src = window.location.origin;
        console.log(`Loading default site: ${window.location.origin}`);
        return;
    }

    // Ensure URL has protocol
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
        console.log(`Added https:// protocol: ${formattedUrl}`);
    }

    try {
        // Clear srcdoc attribute first to allow src to work
        frame.removeAttribute('srcdoc');
        frame.src = formattedUrl;
        console.log(`Set iframe src to: ${formattedUrl}`);

        // Add loading indicator
        frame.classList.add('loading');

        // Remove loading indicator when loaded
        frame.onload = () => {
            console.log(`Website loaded: ${formattedUrl}`);
            frame.classList.remove('loading');
        };

        // Handle load errors
        frame.onerror = (err) => {
            console.error(`Error loading website: ${err}`);
            frame.classList.remove('loading');
            showToast(window.i18next && window.i18next.t ? window.i18next.t('website_load_error') : 'Failed to load website. It may be blocked by security policies.');
        };
    } catch (error) {
        console.error("Error loading website:", error);
        showToast(window.i18next && window.i18next.t ? window.i18next.t('website_load_error') : 'Failed to load website. It may be blocked by security policies.');
    }
}



/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
    console.log(`Showing toast: "${message}"`);

    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');

    if (!toastContainer) {
        console.log("Creating toast container");
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Hide and remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}

/**
 * Make iframe resizable with drag handles - Optimized for maximum performance
 */
function makeIframeResizable() {
    const frameWrapper = document.getElementById('simulator-frame-wrapper');
    const frame = document.getElementById('simulator-frame');

    if (!frameWrapper || !frame) {
        console.warn("Frame wrapper or frame not found for resizable functionality");
        return;
    }

    // Ensure iframe has initial dimensions
    if (!frame.style.width || !frame.style.height) {
        frame.style.width = '1366px';
        frame.style.height = '768px';
    }

    // Make frame wrapper position relative and ensure it's properly styled
    frameWrapper.style.cssText = `
        position: relative;
        display: inline-block;
        border: 2px solid #ddd;
        border-radius: 8px;
        overflow: visible;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;

    // Cache DOM elements for performance
    const sizeDisplay = document.getElementById('simulator-size-display');
    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');

    // Global drag state to avoid closure issues
    let dragState = {
        isDragging: false,
        direction: null,
        startX: 0,
        startY: 0,
        startW: 0,
        startH: 0,
        currentHandle: null
    };

    // Optimized mouse move handler - defined once, reused for all handles
    const globalMouseMove = (e) => {
        if (!dragState.isDragging) return;

        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            let newW = dragState.startW;
            let newH = dragState.startH;

            // Calculate new dimensions based on drag direction
            if (dragState.direction === 'se' || dragState.direction === 'e') {
                newW = Math.max(200, Math.min(3840, dragState.startW + dx));
            }
            if (dragState.direction === 'se' || dragState.direction === 's') {
                newH = Math.max(150, Math.min(2160, dragState.startH + dy));
            }

            // Apply dimensions immediately
            frame.style.width = newW + 'px';
            frame.style.height = newH + 'px';

            // Update displays efficiently
            const roundedW = Math.round(newW);
            const roundedH = Math.round(newH);

            // Update size display
            if (sizeDisplay) {
                if (!globalMouseMove.cachedPrefix) {
                    const currentText = sizeDisplay.textContent || '';
                    const colonIndex = Math.max(
                        currentText.lastIndexOf(':'),
                        currentText.lastIndexOf('：')
                    );
                    globalMouseMove.cachedPrefix = colonIndex > 0 ?
                        currentText.substring(0, colonIndex + 1) + ' ' :
                        'Current Size: ';
                }
                sizeDisplay.textContent = `${globalMouseMove.cachedPrefix}${roundedW} × ${roundedH}`;
            }

            // Update inputs
            if (widthInput) widthInput.value = roundedW;
            if (heightInput) heightInput.value = roundedH;
        });
    };

    // Global mouse up handler
    const globalMouseUp = () => {
        if (!dragState.isDragging) return;

        dragState.isDragging = false;
        dragState.currentHandle = null;

        // Reset cursor and selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.classList.remove('resizing');

        // Remove global listeners
        document.removeEventListener('mousemove', globalMouseMove);
        document.removeEventListener('mouseup', globalMouseUp);

        console.log('Drag ended');
    };

    // Create resize handles with improved styling
    const handles = [
        { direction: 'se', cursor: 'se-resize', width: '16px', height: '16px', bottom: '-8px', right: '-8px', borderRadius: '50%' },
        { direction: 'e', cursor: 'e-resize', width: '8px', height: '100%', top: '0', right: '-4px', borderRadius: '0' },
        { direction: 's', cursor: 's-resize', width: '100%', height: '8px', bottom: '-4px', left: '0', borderRadius: '0' }
    ];

    handles.forEach(({ direction, cursor, width, height, bottom, right, top, left, borderRadius }) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${direction}`;

        // Optimized styling without transitions
        handle.style.cssText = `
            position: absolute;
            background: #007bff;
            opacity: 0.5;
            cursor: ${cursor};
            z-index: 1001;
            width: ${width};
            height: ${height};
            border-radius: ${borderRadius};
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            border: 1px solid rgba(255,255,255,0.3);
            ${bottom ? `bottom: ${bottom};` : ''}
            ${right ? `right: ${right};` : ''}
            ${top ? `top: ${top};` : ''}
            ${left ? `left: ${left};` : ''}
        `;

        // Optimized hover effects
        handle.addEventListener('mouseenter', () => {
            if (!dragState.isDragging) {
                handle.style.opacity = '0.8';
                handle.style.background = '#0056b3';
            }
        });

        handle.addEventListener('mouseleave', () => {
            if (!dragState.isDragging) {
                handle.style.opacity = '0.5';
                handle.style.background = '#007bff';
            }
        });

        // Optimized mouse down handler
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Set drag state
            dragState.isDragging = true;
            dragState.direction = direction;
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.startW = frame.offsetWidth;
            dragState.startH = frame.offsetHeight;
            dragState.currentHandle = handle;

            // Visual feedback
            document.body.style.cursor = cursor;
            document.body.style.userSelect = 'none';
            document.body.classList.add('resizing');

            handle.style.opacity = '1';
            handle.style.background = '#004085';

            // Add global listeners
            document.addEventListener('mousemove', globalMouseMove);
            document.addEventListener('mouseup', globalMouseUp);

            console.log(`Drag started: ${direction}`);
        });

        // Prevent context menu
        handle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        frameWrapper.appendChild(handle);
    });

    console.log('✅ Optimized iframe resizable functionality initialized');
}

/**
 * Update size display with new dimensions
 */
function updateSizeDisplay(width, height) {
    const sizeDisplay = document.getElementById('simulator-size-display');
    if (!sizeDisplay) return;

    // Cache the prefix to avoid repeated calculations during drag
    if (!updateSizeDisplay.cachedPrefix) {
        const currentText = sizeDisplay.textContent || '';
        const colonIndex = Math.max(
            currentText.lastIndexOf(':'),
            currentText.lastIndexOf('：')
        );

        if (colonIndex > 0) {
            updateSizeDisplay.cachedPrefix = currentText.substring(0, colonIndex + 1) + ' ';
        } else {
            updateSizeDisplay.cachedPrefix = window.i18next && window.i18next.isInitialized && window.i18next.t ?
                (window.i18next.t('current_size') + ': ') :
                'Current Size: ';
        }
    }

    sizeDisplay.textContent = `${updateSizeDisplay.cachedPrefix}${width} × ${height}`;
}

/**
 * Update custom size inputs with new dimensions - optimized for performance
 */
function updateCustomInputs(width, height) {
    // Cache DOM elements to avoid repeated queries during drag
    if (!updateCustomInputs.cachedInputs) {
        updateCustomInputs.cachedInputs = {
            width: document.getElementById('custom-width'),
            height: document.getElementById('custom-height')
        };
    }

    const { width: widthInput, height: heightInput } = updateCustomInputs.cachedInputs;
    if (widthInput) widthInput.value = width;
    if (heightInput) heightInput.value = height;
}

/**
 * Set up all event listeners for simulator
 */
function setupSimulatorListeners() {
    console.log("Setting up simulator event listeners");

    // Set up preset buttons
    const deviceButtons = document.querySelectorAll('.device-buttons button');
    console.log(`Found ${deviceButtons.length} device buttons`);

    deviceButtons.forEach((button, index) => {
        console.log(`Setting up button ${index + 1}: ${button.textContent}`);
        button.addEventListener('click', () => {
            const width = parseInt(button.dataset.width, 10);
            const height = parseInt(button.dataset.height, 10);

            console.log(`Button clicked: ${button.textContent} (${width}×${height})`);

            if (!isNaN(width) && !isNaN(height)) {
                setPreviewSize(width, height);
            } else {
                console.warn(`Invalid dimensions on button: ${button.textContent}`);
            }
        });
    });

    // Set up custom size apply button
    const applyButton = document.getElementById('apply-custom-size');
    if (applyButton) {
        console.log("Setting up custom size apply button");
        applyButton.addEventListener('click', applyCustomSize);
    } else {
        console.warn("Apply custom size button not found");
    }

    // Set up rotate button
    const rotateButton = document.getElementById('rotate-device');
    if (rotateButton) {
        console.log("Setting up rotate button");
        rotateButton.addEventListener('click', rotateDevice);
    } else {
        console.warn("Rotate button not found");
    }

    // Set up load website button
    const loadButton = document.getElementById('load-website');
    const urlInput = document.getElementById('website-url');

    if (loadButton && urlInput) {
        console.log("Setting up URL input and load button");
        loadButton.addEventListener('click', () => {
            console.log(`Load button clicked with URL: ${urlInput.value}`);
            loadWebsite(urlInput.value);
        });

        // Also allow Enter key to load website
        urlInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                console.log(`Enter pressed with URL: ${urlInput.value}`);
                loadWebsite(urlInput.value);
            }
        });
    } else {
        if (!loadButton) console.warn("Load website button not found");
        if (!urlInput) console.warn("URL input not found");
    }



    // Initialize with default size
    const defaultWidth = 1366;
    const defaultHeight = 768;
    console.log(`Initializing with default size: ${defaultWidth}×${defaultHeight}`);
    setPreviewSize(defaultWidth, defaultHeight);

    // Set multilingual welcome page instead of loading default website
    console.log("Setting multilingual welcome page");
    setWelcomePage();
}

/**
 * Generate multilingual welcome page for iframe
 */
function generateWelcomePage() {
    // Try to get translations from i18next if available
    const t = (key, fallback) => {
        if (window.i18next && window.i18next.t) {
            return window.i18next.t(key);
        }
        return fallback;
    };

    const title = t('iframe_welcome_title', 'Welcome to Responsive Tester!');
    const subtitle = t('iframe_welcome_subtitle', 'Enter a URL above to start testing your website\'s responsiveness.');
    const feature1 = t('iframe_welcome_feature1', 'Test multiple screen sizes');
    const feature2 = t('iframe_welcome_feature2', 'Preview on different devices');
    const feature3 = t('iframe_welcome_feature3', 'Check responsive layouts');

    return `<html style='font-family:sans-serif;text-align:center;padding-top:10%;background-color:#f8f9fa;'>
        <body>
            <h1 style='color:#007bff;margin-bottom:20px;'>${title}</h1>
            <p style='color:#6c757d;font-size:16px;'>${subtitle}</p>
            <p style='color:#28a745;font-size:14px;margin-top:30px;'>
                ✓ ${feature1}<br>
                ✓ ${feature2}<br>
                ✓ ${feature3}
            </p>
        </body>
    </html>`;
}

/**
 * Set multilingual welcome page in iframe
 */
function setWelcomePage() {
    const frame = document.getElementById('simulator-frame');

    if (!frame) {
        console.warn("Simulator frame not found");
        return;
    }

    // Generate multilingual welcome page content
    const welcomeContent = generateWelcomePage();

    // Set the welcome page content
    frame.srcdoc = welcomeContent;
    console.log("Set multilingual welcome page in iframe");
}

/**
 * Initialize iframe size directly without waiting for i18next
 */
function initializeFrameSize() {
    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');

    if (!frame || !sizeDisplay) {
        console.warn("Required simulator elements not found for initial setup");
        return;
    }

    const defaultWidth = 1366;
    const defaultHeight = 768;

    // Set iframe dimensions
    frame.style.width = `${defaultWidth}px`;
    frame.style.height = `${defaultHeight}px`;

    // Update size display directly without depending on i18next
    sizeDisplay.removeAttribute('data-i18n'); // 移除可能导致翻译覆盖的属性

    // 获取文本内容（可能是"当前尺寸:"或"Current Size:"）
    const currentText = sizeDisplay.textContent || '';

    // 检查是否已经包含尺寸数字
    if (currentText.includes('×')) {
        // 已经有尺寸值，不需要更改
        return;
    }

    // 如果是空的或者只有翻译文本，添加尺寸
    if (currentText.endsWith(':') || currentText.endsWith('：')) {
        // 已经有冒号，直接加尺寸
        sizeDisplay.textContent = `${currentText} ${defaultWidth} × ${defaultHeight}`;
    } else {
        // 没有冒号，添加冒号和尺寸
        sizeDisplay.textContent = `${currentText || '当前尺寸'}: ${defaultWidth} × ${defaultHeight}`;
    }

    // 更新自定义尺寸输入框
    const widthInput = document.getElementById('custom-width');
    const heightInput = document.getElementById('custom-height');

    if (widthInput && heightInput) {
        widthInput.value = defaultWidth;
        heightInput.value = defaultHeight;
    }
}

/**
 * Initialize simulator with proper error handling
 */
function initializeSimulator() {
    console.log("Starting simulator initialization...");

    // Check if simulator elements exist
    const simulatorSection = document.querySelector('.simulator-section');

    if (!simulatorSection) {
        console.error("❌ CRITICAL: Simulator section not found in the DOM");
        console.log("DOM Content:", document.body.innerHTML);
        return;
    }

    console.log("✓ Found simulator section");

    // Initialize with default size directly, don't wait for i18next
    initializeFrameSize();

    // Add direct CSS check
    const simulatorCSS = document.querySelector('link[href*="simulator.css"]');
    if (!simulatorCSS) {
        console.warn("Simulator CSS might not be loaded correctly");

        // Add CSS if missing
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/simulator.css';
        document.head.appendChild(link);
        console.log("Added simulator CSS link");
    }

    // Log simulator elements
    const elements = {
        'URL Input': document.getElementById('website-url'),
        'Load Button': document.getElementById('load-website'),
        'Device Buttons': document.querySelectorAll('.device-buttons button').length,
        'Custom Width Input': document.getElementById('custom-width'),
        'Custom Height Input': document.getElementById('custom-height'),
        'Apply Button': document.getElementById('apply-custom-size'),
        'Rotate Button': document.getElementById('rotate-device'),
        'Frame Options': document.querySelectorAll('.frame-options input[type="radio"]').length,
        'Preview Container': document.getElementById('simulator-container'),
        'Size Display': document.getElementById('simulator-size-display'),
        'Preview Frame': document.getElementById('simulator-frame')
    };

    console.log("Simulator elements check:", elements);

    // Check for any missing critical elements
    const missingElements = Object.entries(elements)
        .filter(([_, value]) => !value || value === 0)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error(`❌ Missing critical elements: ${missingElements.join(', ')}`);
    }

    console.log("Setting up all event listeners");

    // Set up all event listeners
    setupSimulatorListeners();

    // Make iframe resizable
    makeIframeResizable();

    console.log("Simulator initialization completed");
}

// Export as module if module is supported, otherwise assign to window
// if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//     module.exports = {
//         setPreviewSize,
//         applyCustomSize,
//         rotateDevice,
//         loadWebsite,
//         changeDeviceFrame,
//         setupSimulatorListeners,
//         initializeSimulator
//     };
// } else {
// Assign to window for non-module usage
window.setPreviewSize = setPreviewSize;
window.applyCustomSize = applyCustomSize;
window.rotateDevice = rotateDevice;
window.loadWebsite = loadWebsite;

window.setupSimulatorListeners = setupSimulatorListeners;
window.initializeSimulator = initializeSimulator;
// } 