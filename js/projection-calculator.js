// projection-calculator.js - Projector Distance Calculator functionality

/**
 * Projection Calculator Class
 * Handles projector distance and screen size calculations
 */
export class ProjectionCalculator {
    constructor() {
        // Current values
        this.throwRatio = 1.5;
        this.distance = 3; // meters
        this.distanceUnit = 'm';
        this.screenSize = 100; // inches diagonal
        this.aspectRatio = '16:9';
        this.mode = 'distance'; // 'distance' = calculate screen size, 'screen' = calculate distance
        
        // DOM elements
        this.elements = {};
        
        // Aspect ratio multipliers (width/diagonal)
        this.aspectRatios = {
            '16:9': { widthRatio: 0.8716, heightRatio: 0.4903, name: 'Widescreen' },
            '16:10': { widthRatio: 0.8480, heightRatio: 0.5300, name: 'WUXGA' },
            '4:3': { widthRatio: 0.8000, heightRatio: 0.6000, name: 'Standard' },
            '21:9': { widthRatio: 0.9210, heightRatio: 0.3946, name: 'Ultrawide' },
            '2.35:1': { widthRatio: 0.9210, heightRatio: 0.3919, name: 'Cinemascope' }
        };
        
        // Conversion factors
        this.conversions = {
            mToFt: 3.28084,
            ftToM: 0.3048,
            inToCm: 2.54,
            cmToIn: 0.393701
        };
        
        // Debounce timer
        this.debounceTimer = null;
        this.debounceDelay = 200;
    }
    
    /**
     * Initialize the calculator
     */
    init() {
        console.log('📽️ Initializing Projection Calculator...');
        
        try {
            this.bindElements();
            this.setupEventListeners();
            this.calculate();
            console.log('✅ Projection Calculator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Projection Calculator:', error);
        }
    }
    
    /**
     * Bind DOM elements
     */
    bindElements() {
        // Mode buttons
        this.elements.modeDistance = document.getElementById('mode-distance');
        this.elements.modeScreen = document.getElementById('mode-screen');
        
        // Input groups
        this.elements.distanceInputGroup = document.getElementById('distance-input-group');
        this.elements.screenInputGroup = document.getElementById('screen-input-group');
        
        // Inputs
        this.elements.throwRatioInput = document.getElementById('throw-ratio');
        this.elements.throwRatioPreset = document.getElementById('throw-ratio-preset');
        this.elements.distanceInput = document.getElementById('projector-distance');
        this.elements.distanceUnit = document.getElementById('distance-unit');
        this.elements.screenSizeInput = document.getElementById('screen-size');
        this.elements.aspectRatioSelect = document.getElementById('projection-aspect-ratio');
        
        // Results
        this.elements.mainResult = document.getElementById('main-result');
        this.elements.resultLabel = document.getElementById('result-label');
        this.elements.resultUnit = document.getElementById('result-unit');
        this.elements.screenWidth = document.getElementById('screen-width');
        this.elements.screenHeight = document.getElementById('screen-height');
        this.elements.screenArea = document.getElementById('screen-area');
        this.elements.viewingDistance = document.getElementById('viewing-distance');
        
        // Diagram elements
        this.elements.diagramSvg = document.getElementById('diagram-svg');
        this.elements.lightCone = document.getElementById('light-cone');
        this.elements.screenRect = document.getElementById('screen-rect');
        this.elements.distanceLabel = document.getElementById('distance-label');
        this.elements.screenLabel = document.getElementById('screen-label');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mode toggle
        this.elements.modeDistance?.addEventListener('click', () => this.setMode('distance'));
        this.elements.modeScreen?.addEventListener('click', () => this.setMode('screen'));
        
        // Throw ratio preset
        this.elements.throwRatioPreset?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.elements.throwRatioInput.value = e.target.value;
                this.debouncedCalculate();
            }
        });
        
        // Input listeners
        const inputs = [
            this.elements.throwRatioInput,
            this.elements.distanceInput,
            this.elements.screenSizeInput
        ];
        
        inputs.forEach(input => {
            input?.addEventListener('input', () => this.debouncedCalculate());
        });
        
        // Unit change
        this.elements.distanceUnit?.addEventListener('change', () => {
            this.distanceUnit = this.elements.distanceUnit.value;
            this.debouncedCalculate();
        });
        
        // Aspect ratio change
        this.elements.aspectRatioSelect?.addEventListener('change', () => {
            this.aspectRatio = this.elements.aspectRatioSelect.value;
            this.debouncedCalculate();
        });
    }
    
    /**
     * Set calculation mode
     * @param {string} mode - 'distance' or 'screen'
     */
    setMode(mode) {
        this.mode = mode;
        
        // Update button states
        this.elements.modeDistance?.classList.toggle('active', mode === 'distance');
        this.elements.modeScreen?.classList.toggle('active', mode === 'screen');
        
        // Show/hide input groups
        if (this.elements.distanceInputGroup && this.elements.screenInputGroup) {
            if (mode === 'distance') {
                this.elements.distanceInputGroup.style.display = 'block';
                this.elements.screenInputGroup.style.display = 'none';
            } else {
                this.elements.distanceInputGroup.style.display = 'none';
                this.elements.screenInputGroup.style.display = 'block';
            }
        }
        
        this.calculate();
    }
    
    /**
     * Debounced calculation
     */
    debouncedCalculate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.calculate(), this.debounceDelay);
    }
    
    /**
     * Main calculation method
     */
    calculate() {
        try {
            // Get input values
            this.throwRatio = parseFloat(this.elements.throwRatioInput?.value) || 1.5;
            this.distance = parseFloat(this.elements.distanceInput?.value) || 3;
            this.screenSize = parseFloat(this.elements.screenSizeInput?.value) || 100;
            this.aspectRatio = this.elements.aspectRatioSelect?.value || '16:9';
            
            // Validate throw ratio
            if (this.throwRatio <= 0 || this.throwRatio > 5) {
                this.showError('Invalid throw ratio');
                return;
            }
            
            // Get aspect ratio data
            const arData = this.aspectRatios[this.aspectRatio];
            if (!arData) return;
            
            let screenDiagonal, distanceMeters, screenWidthInches, screenHeightInches;
            
            if (this.mode === 'distance') {
                // Mode 1: Calculate screen size from distance
                distanceMeters = this.distanceUnit === 'ft' 
                    ? this.distance * this.conversions.ftToM 
                    : this.distance;
                
                // Screen width = Distance / Throw Ratio (in same units)
                // Convert distance to inches for calculation
                const distanceInches = distanceMeters * 100 / this.conversions.inToCm;
                screenWidthInches = distanceInches / this.throwRatio;
                
                // Calculate diagonal from width using aspect ratio
                screenDiagonal = screenWidthInches / arData.widthRatio;
                screenHeightInches = screenDiagonal * arData.heightRatio;
                
                // Update result display
                this.updateResultForDistance(screenDiagonal);
            } else {
                // Mode 2: Calculate distance from screen size
                screenDiagonal = this.screenSize;
                screenWidthInches = screenDiagonal * arData.widthRatio;
                screenHeightInches = screenDiagonal * arData.heightRatio;
                
                // Distance = Throw Ratio × Screen Width
                const distanceInches = this.throwRatio * screenWidthInches;
                distanceMeters = distanceInches * this.conversions.inToCm / 100;
                
                // Update result display
                this.updateResultForScreen(distanceMeters);
            }
            
            // Update details
            this.updateDetails(screenWidthInches, screenHeightInches, screenDiagonal, distanceMeters);
            
            // Update diagram
            this.updateDiagram(distanceMeters, screenDiagonal);
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Calculation error');
        }
    }
    
    /**
     * Update result display for distance mode (showing screen size)
     */
    updateResultForDistance(screenDiagonal) {
        if (this.elements.mainResult) {
            this.elements.mainResult.textContent = Math.round(screenDiagonal);
        }
        if (this.elements.resultLabel) {
            this.elements.resultLabel.textContent = this.getTranslation('projectionCalculator.screenSizeResult', 'Screen Size');
        }
        if (this.elements.resultUnit) {
            this.elements.resultUnit.textContent = this.getTranslation('projectionCalculator.inchesUnit', 'inches');
        }
    }
    
    /**
     * Update result display for screen mode (showing distance)
     */
    updateResultForScreen(distanceMeters) {
        let displayValue, unitText;
        
        if (this.distanceUnit === 'ft') {
            displayValue = (distanceMeters * this.conversions.mToFt).toFixed(1);
            unitText = this.getTranslation('projectionCalculator.feetUnit', 'feet');
        } else {
            displayValue = distanceMeters.toFixed(2);
            unitText = this.getTranslation('projectionCalculator.metersUnit', 'meters');
        }
        
        if (this.elements.mainResult) {
            this.elements.mainResult.textContent = displayValue;
        }
        if (this.elements.resultLabel) {
            this.elements.resultLabel.textContent = this.getTranslation('projectionCalculator.distanceResult', 'Distance Required');
        }
        if (this.elements.resultUnit) {
            this.elements.resultUnit.textContent = unitText;
        }
    }
    
    /**
     * Update detail cards
     */
    updateDetails(widthInches, heightInches, diagonal, distanceMeters) {
        // Screen width
        if (this.elements.screenWidth) {
            const widthCm = widthInches * this.conversions.inToCm;
            this.elements.screenWidth.textContent = `${Math.round(widthInches)}" / ${Math.round(widthCm)}cm`;
        }
        
        // Screen height
        if (this.elements.screenHeight) {
            const heightCm = heightInches * this.conversions.inToCm;
            this.elements.screenHeight.textContent = `${Math.round(heightInches)}" / ${Math.round(heightCm)}cm`;
        }
        
        // Screen area
        if (this.elements.screenArea) {
            const areaSqFt = (widthInches * heightInches) / 144;
            const areaSqM = areaSqFt * 0.0929;
            this.elements.screenArea.textContent = `${areaSqM.toFixed(1)} m² / ${areaSqFt.toFixed(1)} ft²`;
        }
        
        // Optimal viewing distance (1.5-2.5x diagonal)
        if (this.elements.viewingDistance) {
            const minViewM = (diagonal * 1.5 * this.conversions.inToCm) / 100;
            const maxViewM = (diagonal * 2.5 * this.conversions.inToCm) / 100;
            this.elements.viewingDistance.textContent = `${minViewM.toFixed(1)}-${maxViewM.toFixed(1)}m`;
        }
    }
    
    /**
     * Update SVG diagram
     */
    updateDiagram(distanceMeters, screenDiagonal) {
        // Update distance label
        if (this.elements.distanceLabel) {
            const distDisplay = this.distanceUnit === 'ft'
                ? `${(distanceMeters * this.conversions.mToFt).toFixed(1)}ft`
                : `${distanceMeters.toFixed(1)}m`;
            this.elements.distanceLabel.textContent = distDisplay;
        }
        
        // Update screen label
        if (this.elements.screenLabel) {
            this.elements.screenLabel.textContent = `${Math.round(screenDiagonal)}"`;
        }
        
        // Adjust screen size in diagram (proportional)
        if (this.elements.screenRect) {
            // Scale screen height based on diagonal (60-150" range maps to 60-140 SVG units)
            const minScreen = 60, maxScreen = 150;
            const minHeight = 60, maxHeight = 140;
            const clampedDiagonal = Math.max(minScreen, Math.min(maxScreen, screenDiagonal));
            const screenHeight = minHeight + ((clampedDiagonal - minScreen) / (maxScreen - minScreen)) * (maxHeight - minHeight);
            const screenY = 100 - (screenHeight / 2);
            
            this.elements.screenRect.setAttribute('height', screenHeight);
            this.elements.screenRect.setAttribute('y', screenY);
            
            // Adjust light cone to match screen
            if (this.elements.lightCone) {
                this.elements.lightCone.setAttribute('points', 
                    `40,90 40,110 360,${screenY} 360,${screenY + screenHeight}`
                );
            }
        }
    }
    
    /**
     * Get translation or fallback
     */
    getTranslation(key, fallback) {
        if (window.i18next && window.i18next.t) {
            const translated = window.i18next.t(key);
            return translated !== key ? translated : fallback;
        }
        return fallback;
    }
    
    /**
     * Show error message
     */
    showError(message) {
        console.error('Projection Calculator error:', message);
        if (this.elements.mainResult) {
            this.elements.mainResult.textContent = '--';
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        console.log('Projection Calculator destroyed');
    }
}

/**
 * Update translations for Projection Calculator
 */
export function updateProjectionCalculatorTranslations() {
    console.log('🌍 Updating Projection Calculator translations...');
    
    if (!window.i18next || !window.i18next.isInitialized) {
        console.warn('⚠️ i18next not initialized yet');
        return;
    }
    
    try {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key && key.startsWith('projectionCalculator.')) {
                const translation = window.i18next.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            }
        });
        
        console.log('✅ Projection Calculator translations updated');
    } catch (error) {
        console.error('❌ Error updating translations:', error);
    }
}

/**
 * Initialize Projection Calculator
 */
export function initializeProjectionCalculator() {
    console.log('🚀 Starting Projection Calculator initialization...');
    
    // Listen for translation updates
    window.addEventListener('translationsUpdated', updateProjectionCalculatorTranslations);
    window.addEventListener('languageChanged', updateProjectionCalculatorTranslations);
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const calculator = new ProjectionCalculator();
            calculator.init();
            updateProjectionCalculatorTranslations();
        });
    } else {
        const calculator = new ProjectionCalculator();
        calculator.init();
        updateProjectionCalculatorTranslations();
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    // Check if we're on the projection calculator page
    if (document.getElementById('throw-ratio') || document.getElementById('projector-distance')) {
        initializeProjectionCalculator();
    }
}
