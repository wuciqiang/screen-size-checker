// aspect-ratio-calculator.js - Aspect Ratio Calculator functionality

/**
 * Simple debounce function for analytics
 */
function debounce(func, wait) {
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
            this.initializeAnalytics();
            this.bindElements();
            this.setupEventListeners();
            this.setupMobileOptimizations();
            this.setupKeyboardNavigation();
            // Temporarily disable link preview to fix page issues
            // this.setupLinkPreview();
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
        
        // Setup ratio button event listeners
        this.setupRatioButtonListeners();
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
                
                // Track successful calculation
                if (this.analytics && (this.newWidth > 0 || this.newHeight > 0)) {
                    this.trackCalculation('aspect_ratio_calculation', {
                        originalWidth: this.originalWidth,
                        originalHeight: this.originalHeight,
                        aspectRatio: this.aspectRatio.formatted
                    }, {
                        newWidth: this.newWidth,
                        newHeight: this.newHeight,
                        scaleFactor: this.newWidth > 0 ? this.newWidth / this.originalWidth : this.newHeight / this.originalHeight
                    });
                }
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
     * Setup ratio button event listeners
     */
    setupRatioButtonListeners() {
        // Use event delegation to handle ratio button clicks
        document.addEventListener('click', (event) => {
            if (event.target.closest('.use-ratio-btn')) {
                this.handleRatioButtonClick(event.target.closest('.use-ratio-btn'));
            }
        });
        
        // Support keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.classList.contains('use-ratio-btn')) {
                this.handleRatioButtonClick(event.target);
            }
        });
    }
    
    /**
     * Handle ratio button click
     * @param {HTMLElement} button - The clicked button element
     */
    handleRatioButtonClick(button) {
        try {
            // Get ratio data from button attributes
            const width = parseFloat(button.dataset.width);
            const height = parseFloat(button.dataset.height);
            const ratio = button.dataset.ratio;
            
            if (!width || !height || width <= 0 || height <= 0) {
                console.error('Invalid ratio data:', { width, height, ratio });
                return;
            }
            
            console.log(`🎯 Applying ratio: ${ratio} (${width}:${height})`);
            
            // Clear any existing errors
            this.clearAllErrors();
            
            // Track ratio usage
            if (this.analytics) {
                this.trackRatioUsage(ratio);
            }
            
            // Apply visual feedback
            this.showRatioSelectionFeedback(button);
            
            // Fill the calculator inputs
            this.applyRatioToCalculator(width, height);
            
            // Scroll to calculator for better UX
            this.scrollToCalculator();
            
        } catch (error) {
            console.error('Error handling ratio button click:', error);
        }
    }
    
    /**
     * Apply ratio to calculator inputs
     * @param {number} width - Ratio width
     * @param {number} height - Ratio height
     */
    applyRatioToCalculator(width, height) {
        // Fill original dimensions
        this.elements.originalWidthInput.value = width;
        this.elements.originalHeightInput.value = height;
        
        // Add visual feedback to inputs
        this.elements.originalWidthInput.classList.add('auto-filled');
        this.elements.originalHeightInput.classList.add('auto-filled');
        
        // Update internal values
        this.originalWidth = width;
        this.originalHeight = height;
        this.lastChangedField = 'originalWidth';
        
        // Trigger calculation
        this.calculate();
        
        // Remove visual feedback after delay
        setTimeout(() => {
            this.elements.originalWidthInput.classList.remove('auto-filled');
            this.elements.originalHeightInput.classList.remove('auto-filled');
        }, 3000);
    }
    
    /**
     * Show visual feedback for ratio selection
     * @param {HTMLElement} button - The clicked button
     */
    showRatioSelectionFeedback(button) {
        // Remove selected class from all buttons
        document.querySelectorAll('.use-ratio-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        button.classList.add('selected');
        
        // Create and show success feedback
        const feedback = document.createElement('div');
        feedback.className = 'selection-feedback';
        feedback.textContent = '✓ 已应用';
        
        // Position feedback relative to button
        button.style.position = 'relative';
        button.appendChild(feedback);
        
        // Remove feedback and selected state after delay
        setTimeout(() => {
            button.classList.remove('selected');
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);
        
        // Add pulse animation
        button.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 600);
    }
    
    /**
     * Scroll to calculator section
     */
    scrollToCalculator() {
        const calculator = document.querySelector('.aspect-ratio-calculator-tool, .calculator-section');
        if (calculator) {
            calculator.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        // Detect if device is mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                        window.innerWidth <= 768;
        
        if (this.isMobile) {
            console.log('📱 Mobile device detected, applying optimizations...');
            
            // Enhanced touch feedback for buttons
            this.setupTouchFeedback();
            
            // Optimize input focus behavior
            this.setupMobileInputOptimizations();
            
            // Setup visual example touch interactions
            this.setupVisualExampleTouchInteractions();
            
            // Prevent zoom on input focus (iOS)
            this.preventInputZoom();
            
            // Setup orientation change handling
            this.setupOrientationChangeHandling();
        }
    }
    
    /**
     * Setup enhanced touch feedback for mobile
     */
    setupTouchFeedback() {
        // Add touch feedback to ratio buttons
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.use-ratio-btn')) {
                const button = e.target.closest('.use-ratio-btn');
                button.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.use-ratio-btn')) {
                const button = e.target.closest('.use-ratio-btn');
                setTimeout(() => {
                    button.classList.remove('touch-active');
                }, 150);
            }
        }, { passive: true });
        
        // Add touch feedback to visual examples
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.ratio-visual-example')) {
                const example = e.target.closest('.ratio-visual-example');
                example.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.ratio-visual-example')) {
                const example = e.target.closest('.ratio-visual-example');
                setTimeout(() => {
                    example.classList.remove('touch-active');
                }, 150);
            }
        }, { passive: true });
    }
    
    /**
     * Setup mobile input optimizations
     */
    setupMobileInputOptimizations() {
        const inputs = [
            this.elements.originalWidthInput,
            this.elements.originalHeightInput,
            this.elements.newWidthInput,
            this.elements.newHeightInput
        ];
        
        inputs.forEach(input => {
            if (input) {
                // Add mobile-specific attributes
                input.setAttribute('inputmode', 'decimal');
                input.setAttribute('pattern', '[0-9]*\\.?[0-9]*');
                
                // Enhanced focus handling for mobile
                input.addEventListener('focus', () => {
                    // Scroll input into view with some padding
                    setTimeout(() => {
                        input.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 300); // Delay to account for keyboard animation
                });
                
                // Add touch-specific styling
                input.addEventListener('touchstart', () => {
                    input.classList.add('touch-focused');
                }, { passive: true });
                
                input.addEventListener('blur', () => {
                    input.classList.remove('touch-focused');
                });
            }
        });
    }
    
    /**
     * Setup visual example touch interactions
     */
    setupVisualExampleTouchInteractions() {
        const visualExamples = document.querySelectorAll('.ratio-visual-example');
        
        visualExamples.forEach(example => {
            // Add tap to show tooltip on mobile
            example.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default touch behavior
                
                const tooltip = example.querySelector('.ratio-tooltip');
                if (tooltip) {
                    tooltip.classList.add('mobile-show');
                    
                    // Hide tooltip after 2 seconds
                    setTimeout(() => {
                        tooltip.classList.remove('mobile-show');
                    }, 2000);
                }
            }, { passive: false });
        });
    }
    
    /**
     * Prevent zoom on input focus for iOS
     */
    preventInputZoom() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                const originalContent = viewport.getAttribute('content');
                
                // Temporarily disable zoom on input focus
                const inputs = document.querySelectorAll('input[type="number"]');
                inputs.forEach(input => {
                    input.addEventListener('focus', () => {
                        viewport.setAttribute('content', originalContent + ', user-scalable=no');
                    });
                    
                    input.addEventListener('blur', () => {
                        viewport.setAttribute('content', originalContent);
                    });
                });
            }
        }
    }
    
    /**
     * Setup orientation change handling
     */
    setupOrientationChangeHandling() {
        window.addEventListener('orientationchange', () => {
            // Delay to account for orientation change animation
            setTimeout(() => {
                // Recalculate layout if needed
                this.updateDisplay();
                
                // Track orientation change
                if (this.analytics) {
                    this.trackEvent('orientation_change', {
                        orientation: window.orientation || screen.orientation?.angle || 0,
                        screenSize: `${window.innerWidth}x${window.innerHeight}`
                    });
                }
            }, 500);
        });
    }
    
    /**
     * Setup link preview functionality
     */
    setupLinkPreview() {
        // Find all internal links
        const internalLinks = document.querySelectorAll('.internal-link');
        
        internalLinks.forEach(link => {
            // Add mouseenter event for showing preview
            link.addEventListener('mouseenter', (e) => {
                this.showLinkPreview(e.target);
            });
            
            // Add mouseleave event for hiding preview
            link.addEventListener('mouseleave', () => {
                this.hideLinkPreview();
            });
            
            // Add click tracking
            link.addEventListener('click', (e) => {
                const linkType = e.target.dataset.linkType;
                const linkId = e.target.dataset.linkId;
                console.log(`🔗 Internal link clicked: ${linkType} - ${linkId}`);
            });
        });
    }
    
    /**
     * Show link preview
     * @param {HTMLElement} linkElement - The link element being hovered
     */
    showLinkPreview(linkElement) {
        // Remove any existing preview
        this.hideLinkPreview();
        
        const linkId = linkElement.dataset.linkId;
        const linkType = linkElement.dataset.linkType;
        
        // Get preview content based on link ID
        const previewContent = this.getLinkPreviewContent(linkId, linkType);
        
        if (!previewContent) return;
        
        // Create preview element
        const preview = document.createElement('div');
        preview.className = 'link-preview';
        preview.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h4 class="preview-title">${previewContent.title}</h4>
                    <span class="preview-type">${previewContent.type}</span>
                </div>
                <p class="preview-description">${previewContent.description}</p>
                <div class="preview-footer">
                    <span class="preview-url">${previewContent.url}</span>
                    <span class="preview-action">点击访问 →</span>
                </div>
            </div>
        `;
        
        // Add preview to document
        document.body.appendChild(preview);
        
        // Position preview
        this.positionLinkPreview(preview, linkElement);
        
        // Show preview with animation
        setTimeout(() => {
            preview.classList.add('show');
        }, 10);
    }
    
    /**
     * Hide link preview
     */
    hideLinkPreview() {
        const existingPreview = document.querySelector('.link-preview');
        if (existingPreview) {
            existingPreview.classList.remove('show');
            setTimeout(() => {
                if (existingPreview.parentNode) {
                    existingPreview.remove();
                }
            }, 200);
        }
    }
    
    /**
     * Get preview content for a specific link
     * @param {string} linkId - The link identifier
     * @param {string} linkType - The link type
     * @returns {object|null} - Preview content object
     */
    getLinkPreviewContent(linkId, linkType) {
        const previewData = {
            'responsive-design': {
                title: 'Media Queries Essentials',
                type: '技术博客',
                description: '深入了解响应式设计中的媒体查询技术，学习如何创建适应不同设备的网页布局。包含实用示例和最佳实践。',
                url: '/blog/media-queries-essentials/',
                readTime: '5分钟阅读'
            }
        };
        
        return previewData[linkId] || null;
    }
    
    /**
     * Position link preview relative to the link element
     * @param {HTMLElement} preview - The preview element
     * @param {HTMLElement} linkElement - The link element
     */
    positionLinkPreview(preview, linkElement) {
        const rect = linkElement.getBoundingClientRect();
        const previewWidth = 320;
        const previewHeight = 160;
        const margin = 10;
        
        let left = rect.left + (rect.width / 2) - (previewWidth / 2);
        let top = rect.bottom + margin;
        
        // Adjust horizontal position if preview would go off screen
        if (left < margin) {
            left = margin;
        } else if (left + previewWidth > window.innerWidth - margin) {
            left = window.innerWidth - previewWidth - margin;
        }
        
        // Adjust vertical position if preview would go off screen
        if (top + previewHeight > window.innerHeight - margin) {
            top = rect.top - previewHeight - margin;
            preview.classList.add('preview-above');
        }
        
        // Apply position
        preview.style.left = `${left}px`;
        preview.style.top = `${top}px`;
        preview.style.width = `${previewWidth}px`;
    }
    
    /**
     * Initialize analytics system
     */
    initializeAnalytics() {
        this.analytics = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            events: [],
            ratioUsage: new Map(),
            linkClicks: new Map(),
            pageMetrics: {
                timeOnPage: 0,
                calculationsPerformed: 0,
                ratioButtonClicks: 0,
                linkClicks: 0
            }
        };
        
        // Track page load
        this.trackEvent('page_load', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        });
        
        // Setup page unload tracking
        window.addEventListener('beforeunload', () => {
            this.analytics.pageMetrics.timeOnPage = Date.now() - this.analytics.startTime;
            this.sendAnalyticsData();
        });
        
        // Track scroll depth
        this.setupScrollTracking();
        
        console.log('📊 Analytics system initialized with session:', this.analytics.sessionId);
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Track user events
     */
    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: this.analytics.sessionId,
            data: eventData
        };
        
        this.analytics.events.push(event);
        
        // Send to analytics service (if available)
        this.sendEventToAnalytics(event);
        
        console.log('📈 Event tracked:', eventName, eventData);
    }
    
    /**
     * Track ratio button usage
     */
    trackRatioUsage(ratio) {
        // Update local statistics
        const currentCount = this.analytics.ratioUsage.get(ratio) || 0;
        this.analytics.ratioUsage.set(ratio, currentCount + 1);
        this.analytics.pageMetrics.ratioButtonClicks++;
        
        // Track the event
        this.trackEvent('ratio_button_click', {
            ratio: ratio,
            totalUsage: currentCount + 1,
            sessionUsage: this.analytics.pageMetrics.ratioButtonClicks
        });
        
        // Update popular ratios in localStorage
        this.updatePopularRatios(ratio);
    }
    
    /**
     * Track internal link clicks
     */
    trackLinkClick(linkType, linkId, targetUrl) {
        // Update local statistics
        const linkKey = `${linkType}_${linkId}`;
        const currentCount = this.analytics.linkClicks.get(linkKey) || 0;
        this.analytics.linkClicks.set(linkKey, currentCount + 1);
        this.analytics.pageMetrics.linkClicks++;
        
        // Track the event
        this.trackEvent('internal_link_click', {
            linkType: linkType,
            linkId: linkId,
            targetUrl: targetUrl,
            totalClicks: currentCount + 1,
            sessionClicks: this.analytics.pageMetrics.linkClicks
        });
    }
    
    /**
     * Track calculation events
     */
    trackCalculation(calculationType, inputData, resultData) {
        this.analytics.pageMetrics.calculationsPerformed++;
        
        this.trackEvent('calculation_performed', {
            type: calculationType,
            input: inputData,
            result: resultData,
            sessionCalculations: this.analytics.pageMetrics.calculationsPerformed
        });
    }
    
    /**
     * Setup scroll depth tracking
     */
    setupScrollTracking() {
        let maxScrollDepth = 0;
        let scrollCheckpoints = [25, 50, 75, 90, 100];
        let reachedCheckpoints = new Set();
        
        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
            }
            
            // Track scroll checkpoints
            scrollCheckpoints.forEach(checkpoint => {
                if (scrollPercent >= checkpoint && !reachedCheckpoints.has(checkpoint)) {
                    reachedCheckpoints.add(checkpoint);
                    this.trackEvent('scroll_checkpoint', {
                        checkpoint: checkpoint,
                        timestamp: Date.now()
                    });
                }
            });
        };
        
        window.addEventListener('scroll', debounce(trackScrollDepth, 250));
    }
    
    /**
     * Update popular ratios in localStorage
     */
    updatePopularRatios(ratio) {
        try {
            let popularRatios = JSON.parse(localStorage.getItem('popularAspectRatios') || '{}');
            popularRatios[ratio] = (popularRatios[ratio] || 0) + 1;
            localStorage.setItem('popularAspectRatios', JSON.stringify(popularRatios));
        } catch (error) {
            console.warn('Failed to update popular ratios in localStorage:', error);
        }
    }
    
    /**
     * Get popular ratios from localStorage
     */
    getPopularRatios() {
        try {
            const popularRatios = JSON.parse(localStorage.getItem('popularAspectRatios') || '{}');
            return Object.entries(popularRatios)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([ratio, count]) => ({ ratio, count }));
        } catch (error) {
            console.warn('Failed to get popular ratios from localStorage:', error);
            return [];
        }
    }
    
    /**
     * Send event to analytics service
     */
    sendEventToAnalytics(event) {
        // Google Analytics 4 (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', event.name, {
                event_category: 'aspect_ratio_calculator',
                event_label: event.name,
                custom_parameter_1: JSON.stringify(event.data),
                session_id: event.sessionId
            });
        }
        
        // Custom analytics endpoint (if available)
        if (navigator.sendBeacon && window.location.hostname !== 'localhost') {
            const analyticsData = {
                event: event.name,
                data: event.data,
                sessionId: event.sessionId,
                timestamp: event.timestamp,
                page: 'aspect-ratio-calculator'
            };
            
            navigator.sendBeacon('/api/analytics', JSON.stringify(analyticsData));
        }
    }
    
    /**
     * Send complete analytics data
     */
    sendAnalyticsData() {
        const analyticsReport = {
            sessionId: this.analytics.sessionId,
            sessionDuration: Date.now() - this.analytics.startTime,
            pageMetrics: this.analytics.pageMetrics,
            ratioUsage: Object.fromEntries(this.analytics.ratioUsage),
            linkClicks: Object.fromEntries(this.analytics.linkClicks),
            events: this.analytics.events,
            timestamp: Date.now()
        };
        
        // Send to analytics service
        if (navigator.sendBeacon && window.location.hostname !== 'localhost') {
            navigator.sendBeacon('/api/analytics/session', JSON.stringify(analyticsReport));
        }
        
        console.log('📊 Analytics session data sent:', analyticsReport);
    }
    
    /**
     * Get analytics summary for debugging
     */
    getAnalyticsSummary() {
        return {
            sessionId: this.analytics.sessionId,
            sessionDuration: Date.now() - this.analytics.startTime,
            pageMetrics: this.analytics.pageMetrics,
            popularRatios: this.getPopularRatios(),
            totalEvents: this.analytics.events.length,
            ratioUsage: Object.fromEntries(this.analytics.ratioUsage),
            linkClicks: Object.fromEntries(this.analytics.linkClicks)
        };
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Send final analytics data
        if (this.analytics) {
            this.sendAnalyticsData();
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