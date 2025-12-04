/**
 * LCD Screen Tester
 * Comprehensive screen testing tool for dead pixels, color accuracy, and display quality
 */

class LCDScreenTester {
    constructor() {
        this.overlay = null;
        this.canvas = null;
        this.ctx = null;
        this.testInfo = null;
        this.testName = null;
        this.currentTest = null;
        this.animationId = null;
        this.autoTestIndex = 0;
        this.autoTestRunning = false;
        
        // Solid color tests sequence
        this.solidColors = [
            { color: '#FF0000', name: 'Red' },
            { color: '#00FF00', name: 'Green' },
            { color: '#0000FF', name: 'Blue' },
            { color: '#FFFFFF', name: 'White' },
            { color: '#000000', name: 'Black' },
            { color: '#00FFFF', name: 'Cyan' },
            { color: '#FF00FF', name: 'Magenta' },
            { color: '#FFFF00', name: 'Yellow' }
        ];
        
        // All tests for auto mode
        this.allTests = [
            { test: 'solid', color: '#FF0000', name: 'Red' },
            { test: 'solid', color: '#00FF00', name: 'Green' },
            { test: 'solid', color: '#0000FF', name: 'Blue' },
            { test: 'solid', color: '#FFFFFF', name: 'White' },
            { test: 'solid', color: '#000000', name: 'Black' },
            { test: 'gradient-h', name: 'Horizontal Gradient' },
            { test: 'gradient-v', name: 'Vertical Gradient' },
            { test: 'grayscale-bars', name: 'Gray Bars' },
            { test: 'grayscale-gradient', name: 'Gray Gradient' },
            { test: 'checkerboard', name: 'Checkerboard' },
            { test: 'grid', name: 'Grid Pattern' },
            { test: 'color-bars', name: 'Color Bars' }
        ];
        
        this.init();
    }
    
    init() {
        this.overlay = document.getElementById('test-overlay');
        this.canvas = document.getElementById('test-canvas');
        this.testInfo = document.getElementById('test-info');
        this.testName = document.getElementById('test-name');
        
        if (!this.overlay || !this.canvas) {
            console.error('LCD Screen Tester: Required elements not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
    }
    
    bindEvents() {
        // Test buttons
        document.querySelectorAll('.test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const test = btn.dataset.test;
                const color = btn.dataset.color;
                
                if (test === 'auto') {
                    this.startAutoTest();
                } else {
                    this.startTest(test, color);
                }
            });
        });
        
        // Exit on overlay click
        this.overlay.addEventListener('click', () => this.exitTest());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Resize handler
        window.addEventListener('resize', () => {
            if (!this.overlay.classList.contains('hidden')) {
                this.resizeCanvas();
                this.redrawCurrentTest();
            }
        });
    }
    
    handleKeydown(e) {
        if (this.overlay.classList.contains('hidden')) return;
        
        switch (e.key) {
            case 'Escape':
                this.exitTest();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                this.nextTest();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousTest();
                break;
        }
    }
    
    startTest(test, color = null) {
        this.currentTest = { test, color };
        this.autoTestRunning = false;
        this.showOverlay();
        this.runTest(test, color);
    }
    
    startAutoTest() {
        this.autoTestIndex = 0;
        this.autoTestRunning = true;
        this.showOverlay();
        this.runAutoTest();
    }
    
    runAutoTest() {
        if (!this.autoTestRunning || this.autoTestIndex >= this.allTests.length) {
            this.exitTest();
            return;
        }
        
        const testConfig = this.allTests[this.autoTestIndex];
        this.currentTest = testConfig;
        this.runTest(testConfig.test, testConfig.color);
    }
    
    nextTest() {
        if (this.autoTestRunning) {
            this.autoTestIndex++;
            if (this.autoTestIndex >= this.allTests.length) {
                this.autoTestIndex = 0;
            }
            this.runAutoTest();
        } else if (this.currentTest?.test === 'solid') {
            const currentIndex = this.solidColors.findIndex(c => c.color === this.currentTest.color);
            const nextIndex = (currentIndex + 1) % this.solidColors.length;
            this.currentTest.color = this.solidColors[nextIndex].color;
            this.runTest('solid', this.currentTest.color);
        }
    }
    
    previousTest() {
        if (this.autoTestRunning) {
            this.autoTestIndex--;
            if (this.autoTestIndex < 0) {
                this.autoTestIndex = this.allTests.length - 1;
            }
            this.runAutoTest();
        } else if (this.currentTest?.test === 'solid') {
            const currentIndex = this.solidColors.findIndex(c => c.color === this.currentTest.color);
            const prevIndex = (currentIndex - 1 + this.solidColors.length) % this.solidColors.length;
            this.currentTest.color = this.solidColors[prevIndex].color;
            this.runTest('solid', this.currentTest.color);
        }
    }
    
    showOverlay() {
        this.overlay.classList.remove('hidden');
        this.resizeCanvas();
        this.requestFullscreen();
    }
    
    exitTest() {
        this.overlay.classList.add('hidden');
        this.autoTestRunning = false;
        this.currentTest = null;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.exitFullscreen();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    redrawCurrentTest() {
        if (this.currentTest) {
            this.runTest(this.currentTest.test, this.currentTest.color);
        }
    }
    
    requestFullscreen() {
        const elem = this.overlay;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    runTest(test, color) {
        // Cancel any running animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        switch (test) {
            case 'solid':
                this.drawSolidColor(color);
                this.updateTestName(this.getColorName(color));
                break;
            case 'gradient-h':
                this.drawHorizontalGradient();
                this.updateTestName('Horizontal Gradient');
                break;
            case 'gradient-v':
                this.drawVerticalGradient();
                this.updateTestName('Vertical Gradient');
                break;
            case 'gradient-rgb':
                this.drawRGBGradient();
                this.updateTestName('RGB Gradient');
                break;
            case 'grayscale-bars':
                this.drawGrayscaleBars();
                this.updateTestName('Gray Scale Bars');
                break;
            case 'grayscale-gradient':
                this.drawGrayscaleGradient();
                this.updateTestName('Gray Scale Gradient');
                break;
            case 'checkerboard':
                this.drawCheckerboard();
                this.updateTestName('Checkerboard Pattern');
                break;
            case 'grid':
                this.drawGrid();
                this.updateTestName('Grid Pattern');
                break;
            case 'lines-h':
                this.drawHorizontalLines();
                this.updateTestName('Horizontal Lines');
                break;
            case 'lines-v':
                this.drawVerticalLines();
                this.updateTestName('Vertical Lines');
                break;
            case 'color-bars':
                this.drawColorBars();
                this.updateTestName('Color Bars');
                break;
            case 'smpte':
                this.drawSMPTE();
                this.updateTestName('SMPTE Pattern');
                break;
            case 'motion-box':
                this.startMotionBox();
                this.updateTestName('Motion Test - Moving Box');
                break;
            case 'motion-text':
                this.startMotionText();
                this.updateTestName('Motion Test - Scrolling Text');
                break;
            case 'text-white':
                this.drawTextTest('#FFFFFF', '#000000');
                this.updateTestName('Text on White');
                break;
            case 'text-black':
                this.drawTextTest('#000000', '#FFFFFF');
                this.updateTestName('Text on Black');
                break;
        }
    }
    
    updateTestName(name) {
        if (this.testName) {
            this.testName.textContent = name;
        }
    }
    
    getColorName(color) {
        const colorMap = {
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFFFF': 'White',
            '#000000': 'Black',
            '#00FFFF': 'Cyan',
            '#FF00FF': 'Magenta',
            '#FFFF00': 'Yellow'
        };
        return colorMap[color] || color;
    }
    
    // Test Drawing Methods
    drawSolidColor(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawHorizontalGradient() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gradient = this.ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#FFFFFF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);
    }
    
    drawVerticalGradient() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#FFFFFF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);
    }
    
    drawRGBGradient() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const barHeight = h / 3;
        
        // Red gradient
        let gradient = this.ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#FF0000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, barHeight);
        
        // Green gradient
        gradient = this.ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#00FF00');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, barHeight, w, barHeight);
        
        // Blue gradient
        gradient = this.ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#0000FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, barHeight * 2, w, barHeight);
    }
    
    drawGrayscaleBars() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const bars = 16;
        const barWidth = w / bars;
        
        for (let i = 0; i < bars; i++) {
            const gray = Math.round((i / (bars - 1)) * 255);
            this.ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
            this.ctx.fillRect(i * barWidth, 0, barWidth + 1, h);
        }
    }
    
    drawGrayscaleGradient() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        for (let x = 0; x < w; x++) {
            const gray = Math.round((x / w) * 255);
            this.ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
            this.ctx.fillRect(x, 0, 1, h);
        }
    }
    
    drawCheckerboard() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const size = 20;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, w, h);
        
        this.ctx.fillStyle = '#000000';
        for (let y = 0; y < h; y += size) {
            for (let x = 0; x < w; x += size) {
                if (((x / size) + (y / size)) % 2 === 0) {
                    this.ctx.fillRect(x, y, size, size);
                }
            }
        }
    }
    
    drawGrid() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gridSize = 50;
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, w, h);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= w; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= h; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }
    }
    
    drawHorizontalLines() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        for (let y = 0; y < h; y += 2) {
            this.ctx.fillStyle = y % 4 === 0 ? '#FFFFFF' : '#000000';
            this.ctx.fillRect(0, y, w, 1);
        }
    }
    
    drawVerticalLines() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        for (let x = 0; x < w; x += 2) {
            this.ctx.fillStyle = x % 4 === 0 ? '#FFFFFF' : '#000000';
            this.ctx.fillRect(x, 0, 1, h);
        }
    }
    
    drawColorBars() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const colors = ['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF00FF', '#FF0000', '#0000FF', '#000000'];
        const barWidth = w / colors.length;
        
        colors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(i * barWidth, 0, barWidth + 1, h);
        });
    }
    
    drawSMPTE() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Top section (67%)
        const topHeight = h * 0.67;
        const topColors = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
        const barWidth = w / topColors.length;
        
        topColors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(i * barWidth, 0, barWidth + 1, topHeight);
        });
        
        // Middle section (8%)
        const midHeight = h * 0.08;
        const midColors = ['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'];
        
        midColors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(i * barWidth, topHeight, barWidth + 1, midHeight);
        });
        
        // Bottom section (25%)
        const bottomY = topHeight + midHeight;
        const bottomHeight = h - bottomY;
        
        // Navy blue section
        this.ctx.fillStyle = '#00214C';
        this.ctx.fillRect(0, bottomY, w * 0.125, bottomHeight);
        
        // White section
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(w * 0.125, bottomY, w * 0.125, bottomHeight);
        
        // Purple section
        this.ctx.fillStyle = '#32006A';
        this.ctx.fillRect(w * 0.25, bottomY, w * 0.125, bottomHeight);
        
        // Black section with gradient
        const gradientWidth = w * 0.5;
        for (let x = 0; x < gradientWidth; x++) {
            const gray = Math.round((x / gradientWidth) * 40);
            this.ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
            this.ctx.fillRect(w * 0.375 + x, bottomY, 1, bottomHeight);
        }
        
        // Black section
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(w * 0.875, bottomY, w * 0.125, bottomHeight);
    }
    
    startMotionBox() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        let x = 0;
        const boxSize = 80;
        const speed = 5;
        
        const animate = () => {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, w, h);
            
            // Draw moving white box
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x, (h - boxSize) / 2, boxSize, boxSize);
            
            // Draw reference lines
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 100) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, h);
                this.ctx.stroke();
            }
            
            x += speed;
            if (x > w) x = -boxSize;
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    startMotionText() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        let x = w;
        const text = 'LCD Screen Test - Check for ghosting and motion blur - ';
        const speed = 3;
        
        const animate = () => {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, w, h);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '48px Arial, sans-serif';
            
            const textWidth = this.ctx.measureText(text).width;
            
            // Draw scrolling text
            this.ctx.fillText(text + text, x, h / 2);
            
            x -= speed;
            if (x < -textWidth) x = 0;
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    drawTextTest(bgColor, textColor) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, w, h);
        
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        
        const sizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
        const sampleText = 'The quick brown fox jumps over the lazy dog. 0123456789';
        
        let y = 50;
        sizes.forEach(size => {
            this.ctx.font = `${size}px Arial, sans-serif`;
            this.ctx.fillText(`${size}px: ${sampleText}`, w / 2, y);
            y += size + 15;
        });
        
        // Additional test patterns
        y += 30;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', w / 2, y);
        y += 25;
        this.ctx.fillText('================================================================', w / 2, y);
        y += 25;
        this.ctx.fillText('................................................................', w / 2, y);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LCDScreenTester();
});
