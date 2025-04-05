// simulator.js - Device simulator module

/**
 * Set preview size for device simulation
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 */
export function setPreviewSize(width, height) {
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

/**
 * Apply custom size from input fields
 */
export function applyCustomSize() {
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

/**
 * Set up event listeners for simulator buttons
 */
export function setupSimulatorListeners() {
    // Set up preset buttons
    const presetButtons = document.querySelectorAll('.simulator-controls button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.currentWindow === 'true') {
                setPreviewSize(window.innerWidth, window.innerHeight);
            } else {
                const width = parseInt(button.dataset.width, 10);
                const height = parseInt(button.dataset.height, 10);
                if (!isNaN(width) && !isNaN(height)) {
                    setPreviewSize(width, height);
                }
            }
        });
    });

    // Set up custom size apply button
    const applyButton = document.getElementById('apply-custom-size');
    if (applyButton) {
        applyButton.addEventListener('click', applyCustomSize);
    }
} 