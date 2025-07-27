// ppi-calculator.js - PPI Calculator functionality

/**
 * PPI Calculator Class
 * Handles PPI calculation logic and user interface interactions
 */
export class PPICalculator {
    constructor() {
        this.horizontalPixels = 0;
        this.verticalPixels = 0;
        this.diagonalInches = 0;
        this.result = 0;
        this.isValid = false;
        
        // DOM elements
        this.elements = {
            horizontalInput: null,
            verticalInput: null,
            diagonalInput: null,
            resultValue: null,
            pixelDiagonal: null,
            screenDensity: null,
            resultDetails: null,
            errorElements: {}
        };
        
        // Validation constraints
        this.constraints = {
            pixels: { min: 1, max: 10000 },
            diagonal: { min: 0.1, max: 100 }
        };
        
        // Debounce timer
        this.debounceTimer = null;
        this.debounceDelay = 300;
    }
    
    /**
     * Initialize the calculator
     */
    init() {
        console.log('🧮 Initializing PPI Calculator...');
        
        try {
            this.bindElements();
            this.setupEventListeners();
            this.updateResult();
            console.log('✅ PPI Calculator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize PPI Calculator:', error);
        }
    }
    
    /**
     * Bind DOM elements
     */
    bindElements() {
        this.elements.horizontalInput = document.getElementById('horizontal-pixels');
        this.elements.verticalInput = document.getElementById('vertical-pixels');
        this.elements.diagonalInput = document.getElementById('diagonal-inches');
        this.elements.resultValue = document.getElementById('ppi-result');
        this.elements.pixelDiagonal = document.getElementById('pixel-diagonal');
        this.elements.screenDensity = document.getElementById('screen-density');
        this.elements.resultDetails = document.getElementById('result-details');
        
        // Error message elements
        this.elements.errorElements = {
            horizontal: document.getElementById('horizontal-pixels-error'),
            vertical: document.getElementById('vertical-pixels-error'),
            diagonal: document.getElementById('diagonal-inches-error')
        };
        
        // Validate that all required elements exist
        const requiredElements = [
            'horizontalInput', 'verticalInput', 'diagonalInput', 
            'resultValue', 'pixelDiagonal', 'screenDensity', 'resultDetails'
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
        // Input event listeners with debouncing
        this.elements.horizontalInput.addEventListener('input', (e) => {
            this.debouncedCalculate();
        });
        
        this.elements.verticalInput.addEventListener('input', (e) => {
            this.debouncedCalculate();
        });
        
        this.elements.diagonalInput.addEventListener('input', (e) => {
            this.debouncedCalculate();
        });
        
        // Blur event listeners for immediate validation
        this.elements.horizontalInput.addEventListener('blur', () => {
            this.validateInput('horizontal');
        });
        
        this.elements.verticalInput.addEventListener('blur', () => {
            this.validateInput('vertical');
        });
        
        this.elements.diagonalInput.addEventListener('blur', () => {
            this.validateInput('diagonal');
        });
        
        // Prevent invalid characters
        [this.elements.horizontalInput, this.elements.verticalInput, this.elements.diagonalInput].forEach(input => {
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
            this.horizontalPixels = parseFloat(this.elements.horizontalInput.value) || 0;
            this.verticalPixels = parseFloat(this.elements.verticalInput.value) || 0;
            this.diagonalInches = parseFloat(this.elements.diagonalInput.value) || 0;
            
            // Validate all inputs
            const horizontalValid = this.validateInput('horizontal');
            const verticalValid = this.validateInput('vertical');
            const diagonalValid = this.validateInput('diagonal');
            
            this.isValid = horizontalValid && verticalValid && diagonalValid;
            
            if (this.isValid) {
                // Calculate PPI using the formula: PPI = √(horizontal² + vertical²) / diagonal
                const pixelDiagonal = Math.sqrt(
                    this.horizontalPixels * this.horizontalPixels + 
                    this.verticalPixels * this.verticalPixels
                );
                
                this.result = pixelDiagonal / this.diagonalInches;
                
                // Update display
                this.updateResult();
                this.updateDetails(pixelDiagonal);
                
            } else {
                // Clear results if inputs are invalid
                this.clearResults();
            }
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('calculation', this.getErrorMessage('calculationError'));
        }
    }
    
    /**
     * Validate individual input
     * @param {string} inputType - Type of input ('horizontal', 'vertical', 'diagonal')
     * @returns {boolean} - Whether the input is valid
     */
    validateInput(inputType) {
        let value, constraints, inputElement, errorElement;
        
        switch (inputType) {
            case 'horizontal':
                value = this.horizontalPixels || parseFloat(this.elements.horizontalInput.value);
                constraints = this.constraints.pixels;
                inputElement = this.elements.horizontalInput;
                errorElement = this.elements.errorElements.horizontal;
                break;
            case 'vertical':
                value = this.verticalPixels || parseFloat(this.elements.verticalInput.value);
                constraints = this.constraints.pixels;
                inputElement = this.elements.verticalInput;
                errorElement = this.elements.errorElements.vertical;
                break;
            case 'diagonal':
                value = this.diagonalInches || parseFloat(this.elements.diagonalInput.value);
                constraints = this.constraints.diagonal;
                inputElement = this.elements.diagonalInput;
                errorElement = this.elements.errorElements.diagonal;
                break;
            default:
                return false;
        }
        
        // Clear previous error state
        this.clearError(inputElement, errorElement);
        
        // Check if value is empty
        if (!value || value === 0) {
            if (inputElement.value.trim() !== '') {
                this.showInputError(inputElement, errorElement, this.getErrorMessage('invalidNumber'));
                return false;
            }
            return false; // Empty but not showing error
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
        if (value < constraints.min || value > constraints.max) {
            this.showInputError(inputElement, errorElement, 
                this.getErrorMessage('outOfRange', constraints.min, constraints.max));
            return false;
        }
        
        return true;
    }
    
    /**
     * Update the result display
     */
    updateResult() {
        if (this.isValid && this.result > 0) {
            // Round to 2 decimal places
            const roundedResult = Math.round(this.result * 100) / 100;
            this.elements.resultValue.textContent = roundedResult.toFixed(2);
            this.elements.resultDetails.style.display = 'block';
        } else {
            this.elements.resultValue.textContent = '--';
            this.elements.resultDetails.style.display = 'none';
        }
    }
    
    /**
     * Update additional details
     * @param {number} pixelDiagonal - Calculated pixel diagonal
     */
    updateDetails(pixelDiagonal) {
        if (this.elements.pixelDiagonal) {
            this.elements.pixelDiagonal.textContent = Math.round(pixelDiagonal).toLocaleString();
        }
        
        if (this.elements.screenDensity) {
            let densityCategory = '';
            if (this.result < 120) {
                densityCategory = window.i18next && window.i18next.t ? 
                    window.i18next.t('ppiCalculator.lowDensity') : '低密度';
            } else if (this.result < 200) {
                densityCategory = window.i18next && window.i18next.t ? 
                    window.i18next.t('ppiCalculator.mediumDensity') : '中等密度';
            } else if (this.result < 300) {
                densityCategory = window.i18next && window.i18next.t ? 
                    window.i18next.t('ppiCalculator.highDensity') : '高密度';
            } else {
                densityCategory = window.i18next && window.i18next.t ? 
                    window.i18next.t('ppiCalculator.veryHighDensity') : '超高密度';
            }
            this.elements.screenDensity.textContent = densityCategory;
        }
    }
    
    /**
     * Clear all results
     */
    clearResults() {
        this.elements.resultValue.textContent = '--';
        this.elements.resultDetails.style.display = 'none';
        if (this.elements.pixelDiagonal) {
            this.elements.pixelDiagonal.textContent = '--';
        }
        if (this.elements.screenDensity) {
            this.elements.screenDensity.textContent = '--';
        }
    }
    
    /**
     * Show input error
     * @param {HTMLElement} inputElement - Input element
     * @param {HTMLElement} errorElement - Error message element
     * @param {string} message - Error message
     */
    showInputError(inputElement, errorElement, message) {
        inputElement.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    /**
     * Clear input error
     * @param {HTMLElement} inputElement - Input element
     * @param {HTMLElement} errorElement - Error message element
     */
    clearError(inputElement, errorElement) {
        inputElement.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    /**
     * Get localized error message
     * @param {string} errorType - Type of error
     * @param {number} min - Minimum value (for range errors)
     * @param {number} max - Maximum value (for range errors)
     * @returns {string} - Localized error message
     */
    getErrorMessage(errorType, min, max) {
        // Use i18next if available, otherwise fallback to default messages
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
                        return window.i18next.t('ppiCalculator.errorInvalidNumber');
                    case 'negativeValue':
                        return window.i18next.t('ppiCalculator.errorNegativeValue');
                    case 'outOfRange':
                        return window.i18next.t('ppiCalculator.errorOutOfRange', { min, max });
                    case 'calculationError':
                        return window.i18next.t('ppiCalculator.errorCalculation');
                    default:
                        return fallbackMessages[errorType] || '输入错误';
                }
            } catch (e) {
                // Fallback if translation fails
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
        console.error(`PPI Calculator ${type} error:`, message);
        // Could implement a general error display here if needed
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        // Clear any timers
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Remove event listeners if needed
        // (In this case, they'll be cleaned up when the page unloads)
        
        console.log('PPI Calculator destroyed');
    }
}

/**
 * Update PPI Calculator translations
 */
export function updatePPICalculatorTranslations() {
    console.log('🌍 Updating PPI Calculator translations...');
    
    // 确保i18next已经初始化
    if (!window.i18next || !window.i18next.isInitialized) {
        console.warn('⚠️ i18next not initialized yet, skipping PPI calculator translation update');
        return;
    }
    
    try {
        // 更新所有带有data-i18n属性的元素
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key && key.startsWith('ppiCalculator.')) {
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
        
        // 更新placeholder属性
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key && key.startsWith('ppiCalculator.')) {
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
        
        console.log('✅ PPI Calculator translations updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating PPI Calculator translations:', error);
    }
}

/**
 * Initialize PPI Calculator
 * This function is called from the main application
 */
export function initializePPICalculator() {
    console.log('🚀 Starting PPI Calculator initialization...');
    
    // 监听翻译更新事件
    window.addEventListener('translationsUpdated', () => {
        console.log('🌍 PPI Calculator received translation update event');
        updatePPICalculatorTranslations();
    });
    
    // 监听语言变更事件
    window.addEventListener('languageChanged', () => {
        console.log('🌍 PPI Calculator received language change event');
        updatePPICalculatorTranslations();
    });
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const calculator = new PPICalculator();
            calculator.init();
            // 初始化后更新翻译
            updatePPICalculatorTranslations();
        });
    } else {
        // DOM is already ready
        const calculator = new PPICalculator();
        calculator.init();
        // 初始化后更新翻译
        updatePPICalculatorTranslations();
    }
}

// Auto-initialize if this script is loaded directly (for testing)
if (typeof window !== 'undefined' && window.location.pathname.includes('/ppi-calculator')) {
    // Only auto-initialize if not being imported as a module
    if (!document.currentScript || !document.currentScript.type || document.currentScript.type !== 'module') {
        initializePPICalculator();
    }
}