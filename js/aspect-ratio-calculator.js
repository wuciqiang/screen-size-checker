// aspect-ratio-calculator.js - Aspect Ratio Calculator functionality

/**
 * Aspect Ratio Calculator Class
 * Handles aspect ratio calculation logic and user interface interactions
 */
export class AspectRatioCalculator {
    constructor() {
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.newWidth = 0;
        this.newHeight = 0;
        this.aspectRatio = null;
        this.isValid = false;
        this.lastChangedField = null; // Track which field was last changed
        
        // DOM elements
        this.elements = {
            originalWidthInput: null,
            originalHeightInput: null,
            newWidthInput: null,
            newHeightInput: null,
            currentRatio: null,
            aspectPreview: null,
            scaleFactor: null,
            aspectRatioResult: null,
            calculationSummary: null,
            originalSizeDisplay: null,
            newSizeDisplay: null,
            errorElements: {}
        };
        
        // Validation constraints
        this.constraints = {
            min: 0.1,
            max: 10000
        };
        
        // Debounce timer
        this.debounceTimer = null;
        this.debounceDelay = 300;
    }
    
    /**
     * Initialize the calculator
     */
    init() {
        console.log('🧮 Initializing Aspect Ratio Calculator...');
        
        try {
            this.bindElements();
            this.setupEventListeners();
            this.updateDisplay();
            console.log('✅ Aspect Ratio Calculator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Aspect Ratio Calculator:', error);
        }
    }
    
    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements.originalWidthInput = document.getElementById('original-width');
        this.elements.originalHeightInput = document.getElementById('original-height');
        this.elements.newWidthInput = document.getElementById('new-width');
        this.elements.newHeightInput = document.getElementById('new-height');
        this.elements.currentRatio = document.getElementById('current-ratio');
        this.elements.aspectPreview = document.getElementById('aspect-preview');
        this.elements.scaleFactor = document.getElementById('scale-factor');
        this.elements.aspectRatioResult = document.getElementById('aspect-ratio-result');
        this.elements.calculationSummary = document.getElementById('calculation-summary');
        this.elements.originalSizeDisplay = document.getElementById('original-size-display');
        this.elements.newSizeDisplay = document.getElementById('new-size-display');
        
        // Error message elements
        this.elements.errorElements = {
            originalWidth: document.getElementById('original-width-error'),
            originalHeight: document.getElementById('original-height-error'),
            newWidth: document.getElementById('new-width-error'),
            newHeight: document.getElementById('new-height-error')
        };
        
        // Validate that all required elements exist
        const requiredElements = [
            'originalWidthInput', 'originalHeightInput', 'newWidthInput', 'newHeightInput',
            'currentRatio', 'aspectPreview', 'calculationSummary'
        ];
        
        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                throw new Error(`Required element not found: ${elementName}`);
            }
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Original dimensions input listeners
        this.elements.originalWidthInput.addEventListener('input', (e) => {
            this.lastChangedField = 'originalWidth';
            this.debouncedCalculate();
        });
        
        this.elements.originalHeightInput.addEventListener('input', (e) => {
            this.lastChangedField = 'originalHeight';
            this.debouncedCalculate();
        });
        
        // New dimensions input listeners
        this.elements.newWidthInput.addEventListener('input', (e) => {
            this.lastChangedField = 'newWidth';
            this.debouncedCalculate();
        });
        
        this.elements.newHeightInput.addEventListener('input', (e) => {
            this.lastChangedField = 'newHeight';
            this.debouncedCalculate();
        });
        
        // Blur event listeners for immediate validation
        this.elements.originalWidthInput.addEventListener('blur', () => {
            this.validateInput('originalWidth');
        });
        
        this.elements.originalHeightInput.addEventListener('blur', () => {
            this.validateInput('originalHeight');
        });
        
        this.elements.newWidthInput.addEventListener('blur', () => {
            this.validateInput('newWidth');
        });
        
        this.elements.newHeightInput.addEventListener('blur', () => {
            this.validateInput('newHeight');
        });
        
        // Prevent invalid characters
        [this.elements.originalWidthInput, this.elements.originalHeightInput, 
         this.elements.newWidthInput, this.elements.newHeightInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                // Allow numbers, decimal point, backspace, delete, arrow keys
                const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                }
            });
        });
    }
    
    /**
     * Debounced calculation to improve performance
     */
    debouncedCalculate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.calculate();
        }, this.debounceDelay);
    }
    
    /**
     * Main calculation method
     */
    calculate() {
        try {
            // Get input values
            this.originalWidth = parseFloat(this.elements.originalWidthInput.value) || 0;
            this.originalHeight = parseFloat(this.elements.originalHeightInput.value) || 0;
            this.newWidth = parseFloat(this.elements.newWidthInput.value) || 0;
            this.newHeight = parseFloat(this.elements.newHeightInput.value) || 0;
            
            // Validate all inputs
            const originalWidthValid = this.validateInput('originalWidth');
            const originalHeightValid = this.validateInput('originalHeight');
            const newWidthValid = this.validateInput('newWidth');
            const newHeightValid = this.validateInput('newHeight');
            
            // Check if we have valid original dimensions
            const hasValidOriginal = originalWidthValid && originalHeightValid && 
                                   this.originalWidth > 0 && this.originalHeight > 0;
            
            if (hasValidOriginal) {
                // Calculate aspect ratio
                this.aspectRatio = this.calculateAspectRatio(this.originalWidth, this.originalHeight);
                
                // Perform calculations based on which field was last changed
                if (this.lastChangedField === 'newWidth' && this.newWidth > 0) {
                    // Calculate new height based on new width
                    const calculatedHeight = (this.originalHeight / this.originalWidth) * this.newWidth;
                    this.newHeight = calculatedHeight;
                    this.elements.newHeightInput.value = calculatedHeight.toFixed(2);
                } else if (this.lastChangedField === 'newHeight' && this.newHeight > 0) {
                    // Calculate new width based on new height
                    const calculatedWidth = (this.originalWidth / this.originalHeight) * this.newHeight;
                    this.newWidth = calculatedWidth;
                    this.elements.newWidthInput.value = calculatedWidth.toFixed(2);
                }
                
                this.isValid = true;
            } else {
                this.isValid = false;
                this.aspectRatio = null;
            }
            
            // Update display
            this.updateDisplay();
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('calculation', this.getErrorMessage('calculationError'));
        }
    }
    
    /**
     * Calculate aspect ratio and return formatted string
     * @param {number} width - Width value
     * @param {number} height - Height value
     * @returns {object} - Aspect ratio object with ratio and formatted string
     */
    calculateAspectRatio(width, height) {
        if (width <= 0 || height <= 0) {
            return null;
        }
        
        // Find greatest common divisor
        const gcd = this.findGCD(width, height);
        const ratioWidth = Math.round(width / gcd * 100) / 100;
        const ratioHeight = Math.round(height / gcd * 100) / 100;
        
        // Format the ratio string
        let ratioString;
        if (ratioWidth === Math.round(ratioWidth) && ratioHeight === Math.round(ratioHeight)) {
            // Use integers if possible
            ratioString = `${Math.round(ratioWidth)}:${Math.round(ratioHeight)}`;
        } else {
            // Use decimals with up to 2 decimal places
            ratioString = `${ratioWidth.toFixed(2)}:${ratioHeight.toFixed(2)}`;
        }
        
        return {
            width: ratioWidth,
            height: ratioHeight,
            ratio: ratioWidth / ratioHeight,
            formatted: ratioString
        };
    }
    
    /**
     * Find Greatest Common Divisor using Euclidean algorithm
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} - GCD
     */
    findGCD(a, b) {
        // Convert to integers for GCD calculation
        const intA = Math.round(a * 100);
        const intB = Math.round(b * 100);
        
        let x = Math.abs(intA);
        let y = Math.abs(intB);
        
        while (y !== 0) {
            const temp = y;
            y = x % y;
            x = temp;
        }
        
        return x / 100;
    }
    
    /**
     * Validate individual input
     * @param {string} inputType - Type of input
     * @returns {boolean} - Whether the input is valid
     */
    validateInput(inputType) {
        let value, inputElement, errorElement;
        
        switch (inputType) {
            case 'originalWidth':
                value = this.originalWidth || parseFloat(this.elements.originalWidthInput.value);
                inputElement = this.elements.originalWidthInput;
                errorElement = this.elements.errorElements.originalWidth;
                break;
            case 'originalHeight':
                value = this.originalHeight || parseFloat(this.elements.originalHeightInput.value);
                inputElement = this.elements.originalHeightInput;
                errorElement = this.elements.errorElements.originalHeight;
                break;
            case 'newWidth':
                value = this.newWidth || parseFloat(this.elements.newWidthInput.value);
                inputElement = this.elements.newWidthInput;
                errorElement = this.elements.errorElements.newWidth;
                break;
            case 'newHeight':
                value = this.newHeight || parseFloat(this.elements.newHeightInput.value);
                inputElement = this.elements.newHeightInput;
                errorElement = this.elements.errorElements.newHeight;
                break;
            default:
                return false;
        }
        
        // Clear previous error state
        this.clearError(inputElement, errorElement);
        
        // Check if value is empty (allow empty for new dimensions)
        if (!value || value === 0) {
            if (inputElement.value.trim() !== '') {
                this.showInputError(inputElement, errorElement, this.getErrorMessage('invalidNumber'));
                return false;
            }
            // Empty is valid for new dimensions, invalid for original dimensions
            return inputType.startsWith('new');
        }
        
        // Check if value is a valid number
        if (isNaN(value)) {
            this.showInputError(inputElement, errorElement, this.getErrorMessage('invalidNumber'));
            return false;
        }
        
        // Check if value is positive
        if (value <= 0) {
            this.showInputError(inputElement, errorElement, this.getErrorMessage('negativeValue'));
            return false;
        }
        
        // Check if value is within range
        if (value < this.constraints.min || value > this.constraints.max) {
            this.showInputError(inputElement, errorElement, 
                this.getErrorMessage('outOfRange', this.constraints.min, this.constraints.max));
            return false;
        }
        
        return true;
    }
    
    /**
     * Update all display elements
     */
    updateDisplay() {
        this.updateCurrentRatio();
        this.updateVisualizer();
        this.updateCalculationSummary();
        this.updateSizeDisplays();
    }
    
    /**
     * Update current ratio display
     */
    updateCurrentRatio() {
        if (this.aspectRatio && this.isValid) {
            this.elements.currentRatio.textContent = this.aspectRatio.formatted;
        } else {
            this.elements.currentRatio.textContent = '--';
        }
    }
    
    /**
     * Update visual aspect ratio representation
     */
    updateVisualizer() {
        if (!this.aspectRatio || !this.isValid) {
            // Reset to default state
            this.elements.aspectPreview.style.width = '100px';
            this.elements.aspectPreview.style.height = '100px';
            this.elements.aspectPreview.style.aspectRatio = 'unset';
            return;
        }
        
        const ratio = this.aspectRatio.ratio;
        const maxWidth = 250;
        const maxHeight = 150;
        
        let width, height;
        
        if (ratio >= 1) {
            // Landscape or square
            width = Math.min(maxWidth, maxHeight * ratio);
            height = width / ratio;
        } else {
            // Portrait
            height = Math.min(maxHeight, maxWidth / ratio);
            width = height * ratio;
        }
        
        // Ensure minimum size for visibility
        width = Math.max(width, 30);
        height = Math.max(height, 30);
        
        this.elements.aspectPreview.style.width = `${width}px`;
        this.elements.aspectPreview.style.height = `${height}px`;
        
        // Use CSS aspect-ratio if supported
        if (CSS.supports('aspect-ratio', '1')) {
            this.elements.aspectPreview.style.aspectRatio = `${this.aspectRatio.width} / ${this.aspectRatio.height}`;
        }
    }
    
    /**
     * Update calculation summary
     */
    updateCalculationSummary() {
        if (!this.isValid || !this.aspectRatio || (this.newWidth <= 0 && this.newHeight <= 0)) {
            this.elements.calculationSummary.style.display = 'none';
            return;
        }
        
        // Calculate scale factor
        let scaleFactor = 1;
        if (this.newWidth > 0) {
            scaleFactor = this.newWidth / this.originalWidth;
        } else if (this.newHeight > 0) {
            scaleFactor = this.newHeight / this.originalHeight;
        }
        
        // Update scale factor display
        if (this.elements.scaleFactor) {
            this.elements.scaleFactor.textContent = `${scaleFactor.toFixed(3)}x`;
        }
        
        // Update aspect ratio result
        if (this.elements.aspectRatioResult) {
            this.elements.aspectRatioResult.textContent = this.aspectRatio.formatted;
        }
        
        this.elements.calculationSummary.style.display = 'block';
    }
    
    /**
     * Update size displays in visualizer info
     */
    updateSizeDisplays() {
        // Update original size display
        if (this.elements.originalSizeDisplay) {
            if (this.originalWidth > 0 && this.originalHeight > 0) {
                this.elements.originalSizeDisplay.textContent = 
                    `${this.originalWidth.toFixed(1)} × ${this.originalHeight.toFixed(1)}`;
            } else {
                this.elements.originalSizeDisplay.textContent = '--';
            }
        }
        
        // Update new size display
        if (this.elements.newSizeDisplay) {
            if (this.newWidth > 0 && this.newHeight > 0) {
                this.elements.newSizeDisplay.textContent = 
                    `${this.newWidth.toFixed(1)} × ${this.newHeight.toFixed(1)}`;
            } else {
                this.elements.newSizeDisplay.textContent = '--';
            }
        }
    }
    
    /**
     * Show input error with smooth animation
     * @param {HTMLElement} inputElement - Input element
     * @param {HTMLElement} errorElement - Error message element
     * @param {string} message - Error message
     */
    showInputError(inputElement, errorElement, message) {
        inputElement.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.offsetHeight; // Force reflow
        }
    }
    
    /**
     * Clear input error with smooth animation
     * @param {HTMLElement} inputElement - Input element
     * @param {HTMLElement} errorElement - Error message element
     */
    clearError(inputElement, errorElement) {
        inputElement.classList.remove('error');
        if (errorElement && errorElement.textContent) {
            errorElement.textContent = '';
        }
    }
    
    /**
     * Clear all errors
     */
    clearAllErrors() {
        const errorElements = Object.values(this.elements.errorElements);
        const inputElements = [
            this.elements.originalWidthInput,
            this.elements.originalHeightInput,
            this.elements.newWidthInput,
            this.elements.newHeightInput
        ];
        
        errorElements.forEach((errorElement, index) => {
            if (errorElement && inputElements[index]) {
                this.clearError(inputElements[index], errorElement);
            }
        });
    }
    
    /**
     * Get localized error message
     * @param {string} errorType - Type of error
     * @param {number} min - Minimum value (for range errors)
     * @param {number} max - Maximum value (for range errors)
     * @returns {string} - Localized error message
     */
    getErrorMessage(errorType, min, max) {
        const fallbackMessages = {
            invalidNumber: '请输入有效的数字',
            negativeValue: '值必须大于 0',
            outOfRange: `值必须在 ${min} 到 ${max} 之间`,
            calculationError: '计算过程中出现错误'
        };
        
        if (window.i18next && window.i18next.t) {
            try {
                switch (errorType) {
                    case 'invalidNumber':
                        return window.i18next.t('aspectRatioCalculator.errors.invalidNumber');
                    case 'negativeValue':
                        return window.i18next.t('aspectRatioCalculator.errors.negativeValue');
                    case 'outOfRange':
                        return window.i18next.t('aspectRatioCalculator.errors.outOfRange', { min, max });
                    case 'calculationError':
                        return window.i18next.t('aspectRatioCalculator.errors.calculationError');
                    default:
                        return fallbackMessages[errorType] || '输入错误';
                }
            } catch (e) {
                return fallbackMessages[errorType] || '输入错误';
            }
        }
        
        return fallbackMessages[errorType] || '输入错误';
    }
    
    /**
     * Show general error message
     * @param {string} type - Error type
     * @param {string} message - Error message
     */
    showError(type, message) {
        console.error(`Aspect Ratio Calculator ${type} error:`, message);
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        console.log('Aspect Ratio Calculator destroyed');
    }
}

/**
 * Update Aspect Ratio Calculator translations
 */
export function updateAspectRatioCalculatorTranslations() {
    console.log('🌍 Updating Aspect Ratio Calculator translations...');
    
    if (!window.i18next || !window.i18next.isInitialized) {
        console.warn('⚠️ i18next not initialized yet, skipping aspect ratio calculator translation update');
        return;
    }
    
    try {
        // Update all elements with data-i18n attributes
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key && key.startsWith('aspectRatioCalculator.')) {
                try {
                    const translation = window.i18next.t(key);
                    if (translation && translation !== key) {
                        element.textContent = translation;
                    }
                } catch (e) {
                    console.warn(`Failed to translate key: ${key}`, e);
                }
            }
        });
        
        // Update placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key && key.startsWith('aspectRatioCalculator.')) {
                try {
                    const translation = window.i18next.t(key);
                    if (translation && translation !== key) {
                        element.placeholder = translation;
                    }
                } catch (e) {
                    console.warn(`Failed to translate placeholder key: ${key}`, e);
                }
            }
        });
        
        console.log('✅ Aspect Ratio Calculator translations updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating Aspect Ratio Calculator translations:', error);
    }
}

/**
 * Initialize Aspect Ratio Calculator
 */
export function initializeAspectRatioCalculator() {
    console.log('🚀 Starting Aspect Ratio Calculator initialization...');
    
    // Listen for translation update events
    window.addEventListener('translationsUpdated', () => {
        console.log('🌍 Aspect Ratio Calculator received translation update event');
        updateAspectRatioCalculatorTranslations();
    });
    
    // Listen for language change events
    window.addEventListener('languageChanged', () => {
        console.log('🌍 Aspect Ratio Calculator received language change event');
        updateAspectRatioCalculatorTranslations();
    });
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const calculator = new AspectRatioCalculator();
            calculator.init();
            updateAspectRatioCalculatorTranslations();
        });
    } else {
        // DOM is already ready
        const calculator = new AspectRatioCalculator();
        calculator.init();
        updateAspectRatioCalculatorTranslations();
    }
}

// Auto-initialize if this script is loaded directly (for testing)
if (typeof window !== 'undefined' && window.location.pathname.includes('/aspect-ratio-calculator')) {
    if (!document.currentScript || !document.currentScript.type || document.currentScript.type !== 'module') {
        initializeAspectRatioCalculator();
    }
}