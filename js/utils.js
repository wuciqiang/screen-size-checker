// utils.js - Utility functions

/**
 * Calculate aspect ratio from width and height
 * @param {number} width - Width value
 * @param {number} height - Height value
 * @returns {string} Aspect ratio string
 */
export function calculateAspectRatio(width, height) {
    const gcd = (a, b) => {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };
    
    const divisor = gcd(width, height);
    if (!divisor || !isFinite(divisor)) {
        return '--';
    }
    const aspectWidth = width / divisor;
    const aspectHeight = height / divisor;
    
    // Common aspect ratios
    const commonRatios = {
        '16:9': [16, 9],
        '16:10': [16, 10],
        '4:3': [4, 3],
        '3:2': [3, 2],
        '21:9': [21, 9],
        '1:1': [1, 1]
    };
    
    // Check if it matches a common ratio
    for (const [ratio, [w, h]] of Object.entries(commonRatios)) {
        if (aspectWidth === w && aspectHeight === h) {
            return ratio;
        }
    }

    // Reduced forms that are marketed under a common name (8:5 panels are 16:10, ultrawides are 21:9)
    const ratioAliases = {
        '8:5': '16:10',
        '7:3': '21:9',
        '64:27': '21:9',
        '43:18': '21:9',
        '12:5': '21:9'
    };
    const alias = ratioAliases[`${aspectWidth}:${aspectHeight}`];
    if (alias) {
        return alias;
    }
    
    return `${aspectWidth}:${aspectHeight}`;
}

// Friendly aspect-ratio label for display. Keep calculateAspectRatio untouched; this wraps it.
// js/core-optimized.js carries a classic-script copy of this logic (keep both in sync;
// test/aspect-ratio-display-test.js checks parity).
const DISPLAY_COMMON_RATIOS = [
    ['16:9', 16, 9], ['16:10', 16, 10], ['4:3', 4, 3], ['3:2', 3, 2], ['5:4', 5, 4],
    ['21:9', 21, 9], ['32:9', 32, 9], ['1:1', 1, 1],
    ['9:16', 9, 16], ['10:16', 10, 16], ['3:4', 3, 4], ['2:3', 2, 3], ['9:19.5', 9, 19.5]
];

export function formatAspectRatioDisplay(width, height) {
    const ratio = calculateAspectRatio(width, height);
    if (ratio === '--') {
        return ratio;
    }
    if (DISPLAY_COMMON_RATIOS.some(([name]) => name === ratio)) {
        return ratio;
    }

    const [aspectWidth, aspectHeight] = ratio.split(':').map(Number);
    const value = aspectWidth / aspectHeight;
    let closest = null;
    let closestError = Infinity;
    for (const [name, w, h] of DISPLAY_COMMON_RATIOS) {
        const target = w / h;
        const error = Math.abs(value - target) / target;
        if (error <= 0.03 && error < closestError) {
            closest = name;
            closestError = error;
        }
    }
    if (closest) {
        return `≈ ${closest} (${ratio})`;
    }
    if (aspectWidth > 50 || aspectHeight > 50) {
        return `${value.toFixed(2)}:1`;
    }
    return ratio;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 