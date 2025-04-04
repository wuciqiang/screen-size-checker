// Function to update the displayed information
function updateDisplay() {
    // 1. Screen Resolution
    const screenRes = `${window.screen.width} x ${window.screen.height}`;
    document.getElementById('screen-resolution').textContent = screenRes;

    // 2. Viewport Size (updates dynamically)
    const viewportSize = `${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById('viewport-size').textContent = viewportSize;

    // 3. Device Pixel Ratio
    const dpr = window.devicePixelRatio || 'N/A'; // Use 'N/A' if not available
    document.getElementById('dpr').textContent = dpr;

    // 4. Color Depth
    const colorDepth = window.screen.colorDepth || 'N/A';
    document.getElementById('color-depth').textContent = `${colorDepth}-bit`;

    // 5. User Agent
    const userAgent = navigator.userAgent || 'N/A';
    document.getElementById('user-agent').value = userAgent; // Use .value for textarea
}

// Function to update the simulator preview size
function setPreviewSize(width, height) {
    const frame = document.getElementById('simulator-frame');
    const sizeDisplay = document.getElementById('simulator-size-display');

    // Constrain the max size to prevent it from becoming too large on screen
    const maxWidth = document.querySelector('.container').offsetWidth - 44; // Account for padding/border
    const maxHeight = window.innerHeight * 0.5; // Limit height to 50% of window height

    const effectiveWidth = Math.min(width, maxWidth);
    const effectiveHeight = Math.min(height, maxHeight);

    frame.style.width = `${effectiveWidth}px`;
    frame.style.height = `${effectiveHeight}px`;
    sizeDisplay.textContent = `模拟尺寸: ${width} x ${height}`;
}


// --- Event Listeners ---

// Update display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    // Set initial simulator size (optional)
    setPreviewSize(375, 667); // Default to iPhone size perhaps
});

// Update Viewport Size dynamically when the browser window is resized
window.addEventListener('resize', () => {
    // Only update viewport size on resize for efficiency,
    // other values usually don't change.
    const viewportSize = `${window.innerWidth} x ${window.innerHeight}`;
    document.getElementById('viewport-size').textContent = viewportSize;

    // Optional: Also update the 'Current Window' button behavior if simulator is used
    // If you have a button specifically for current size, update its target here or in setPreviewSize.
});