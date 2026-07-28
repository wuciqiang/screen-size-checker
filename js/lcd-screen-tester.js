/**
 * Page-local LCD screen test workbench.
 */
(function () {
    'use strict';

    const GUIDED_STEP_MS = 5000;
    const CONTROL_HIDE_MS = 2600;
    const MAX_CANVAS_DPR = 3;

    class LCDScreenTester {
        constructor(root) {
            this.root = root;
            this.workbench = root.querySelector('.lcd-workbench');
            this.previewCanvas = root.querySelector('#lcd-preview-canvas');
            this.overlay = document.getElementById('lcd-test-overlay');
            this.testCanvas = document.getElementById('lcd-test-canvas');

            if (!this.workbench || !this.previewCanvas || !this.overlay || !this.testCanvas) {
                return;
            }

            this.modeRegistry = this.createModeRegistry();
            this.modeById = new Map(this.modeRegistry.map(mode => [mode.id, mode]));
            this.categoryModes = this.createCategoryModes();
            this.guidedSequence = [
                'solid-red',
                'solid-green',
                'solid-blue',
                'solid-white',
                'solid-black',
                'solid-cyan',
                'solid-magenta',
                'solid-yellow',
                'guided-gray-5',
                'guided-gray-50',
                'grayscale-gradient',
                'motion-box'
            ];

            this.currentModeId = 'solid-red';
            this.activeCategory = 'quick';
            this.lastModeByCategory = {
                pixels: 'solid-red',
                uniformity: 'dark-level',
                motion: 'motion-box',
                sharpness: 'checkerboard'
            };
            this.grayLevel = 0;
            this.graySteps = 16;
            this.customColor = '#7C3AED';
            this.motionBackground = 'black';
            this.motionSpeed = 'medium';
            this.motionPosition = 0;
            this.motionLastTimestamp = null;

            this.overlayOpen = false;
            this.guidedActive = false;
            this.guidedCompleted = false;
            this.paused = false;
            this.sequence = [];
            this.sequenceIndex = 0;
            this.remainingStepMs = GUIDED_STEP_MS;
            this.stepDeadline = 0;
            this.wasNativeFullscreen = false;
            this.controlsHidden = false;

            this.stepTimer = null;
            this.controlHideTimer = null;
            this.resizeFrame = null;
            this.motionFrame = null;
            this.refreshFrame = null;
            this.translationRefreshTimer = null;
            this.lastStartTrigger = null;
            this.touchStart = null;
            this.viewedResultTypes = new Set();

            this.cacheElements();
            this.bindEvents();
            this.updateDisplayInformation();
            this.selectMode(this.currentModeId, { track: false });
            this.setStatus('ready');
            this.estimateRefreshRate();
            this.updateRuntimeTranslations();
            this.translationRefreshTimer = window.setTimeout(() => this.updateRuntimeTranslations(), 1200);
        }

        createModeRegistry() {
            return [
                { id: 'solid-red', type: 'solid', color: '#FF1F32', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.red', fallback: 'Red' },
                { id: 'solid-green', type: 'solid', color: '#18C964', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.green', fallback: 'Green' },
                { id: 'solid-blue', type: 'solid', color: '#1677FF', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.blue', fallback: 'Blue' },
                { id: 'solid-white', type: 'solid', color: '#FFFFFF', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.white', fallback: 'White' },
                { id: 'solid-black', type: 'solid', color: '#000000', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.black', fallback: 'Black' },
                { id: 'solid-cyan', type: 'solid', color: '#00D8E8', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.cyan', fallback: 'Cyan' },
                { id: 'solid-magenta', type: 'solid', color: '#F018D0', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.magenta', fallback: 'Magenta' },
                { id: 'solid-yellow', type: 'solid', color: '#FFD60A', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.yellow', fallback: 'Yellow' },
                { id: 'solid-custom', type: 'custom-color', category: 'pixels', resultType: 'pixel', labelKey: 'lcdTester.customColor', fallback: 'Custom color' },

                { id: 'dark-level', type: 'dynamic-gray', category: 'uniformity', resultType: 'uniformity', labelKey: 'lcdTester.darkLevel', fallback: 'Dark level' },
                { id: 'guided-gray-5', type: 'solid', color: '#0D0D0D', category: 'uniformity', resultType: 'uniformity', labelKey: 'lcdTester.gray5', fallback: '5% grey' },
                { id: 'guided-gray-50', type: 'solid', color: '#808080', category: 'uniformity', resultType: 'uniformity', labelKey: 'lcdTester.gray50', fallback: '50% grey' },
                { id: 'grayscale-bars', type: 'grayscale-bars', category: 'uniformity', resultType: 'uniformity', labelKey: 'lcdTester.grayBars', fallback: 'Gray bars' },
                { id: 'grayscale-gradient', type: 'grayscale-gradient', category: 'uniformity', resultType: 'uniformity', labelKey: 'lcdTester.grayGradient', fallback: 'Gray gradient' },
                { id: 'gradient-horizontal', type: 'gradient-horizontal', category: 'uniformity', resultType: 'color', labelKey: 'lcdTester.horizontalGradient', fallback: 'Horizontal gradient' },
                { id: 'gradient-vertical', type: 'gradient-vertical', category: 'uniformity', resultType: 'color', labelKey: 'lcdTester.verticalGradient', fallback: 'Vertical gradient' },
                { id: 'gradient-rgb', type: 'gradient-rgb', category: 'uniformity', resultType: 'color', labelKey: 'lcdTester.rgbGradient', fallback: 'RGB gradient' },

                { id: 'motion-box', type: 'motion-box', category: 'motion', resultType: 'motion', labelKey: 'lcdTester.movingBox', fallback: 'Moving square' },
                { id: 'motion-text', type: 'motion-text', category: 'motion', resultType: 'motion', labelKey: 'lcdTester.scrollingText', fallback: 'Scrolling text' },
                { id: 'motion-lines', type: 'motion-lines', category: 'motion', resultType: 'motion', labelKey: 'lcdTester.movingLines', fallback: 'Moving lines' },

                { id: 'checkerboard', type: 'checkerboard', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.checkerboard', fallback: 'Checkerboard' },
                { id: 'grid', type: 'grid', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.gridPattern', fallback: 'Grid' },
                { id: 'lines-horizontal', type: 'lines-horizontal', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.horizontalLines', fallback: 'Horizontal lines' },
                { id: 'lines-vertical', type: 'lines-vertical', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.verticalLines', fallback: 'Vertical lines' },
                { id: 'color-bars', type: 'color-bars', category: 'sharpness', resultType: 'color', labelKey: 'lcdTester.colorBars', fallback: 'Color bars' },
                { id: 'smpte', type: 'smpte', category: 'sharpness', resultType: 'color', labelKey: 'lcdTester.smptePattern', fallback: 'SMPTE pattern' },
                { id: 'text-white', type: 'text-white', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.textOnWhite', fallback: 'Text on white' },
                { id: 'text-black', type: 'text-black', category: 'sharpness', resultType: 'sharpness', labelKey: 'lcdTester.textOnBlack', fallback: 'Text on black' }
            ];
        }

        createCategoryModes() {
            return {
                pixels: [
                    'solid-red', 'solid-green', 'solid-blue', 'solid-white', 'solid-black',
                    'solid-cyan', 'solid-magenta', 'solid-yellow', 'solid-custom'
                ],
                uniformity: [
                    'dark-level', 'grayscale-bars', 'grayscale-gradient',
                    'gradient-horizontal', 'gradient-vertical', 'gradient-rgb'
                ],
                motion: ['motion-box', 'motion-text', 'motion-lines'],
                sharpness: [
                    'checkerboard', 'grid', 'lines-horizontal', 'lines-vertical',
                    'color-bars', 'smpte', 'text-white', 'text-black'
                ]
            };
        }

        cacheElements() {
            this.statusText = this.root.querySelector('#lcd-status-text');
            this.message = this.root.querySelector('#lcd-workbench-message');
            this.previewName = this.root.querySelector('#lcd-preview-name');
            this.previewDescription = this.root.querySelector('#lcd-preview-description');
            this.previewCategory = this.root.querySelector('#lcd-preview-category');
            this.customColorInput = this.root.querySelector('#lcd-custom-color');
            this.customColorOutput = this.root.querySelector('#lcd-custom-color-value');

            this.viewportValue = this.root.querySelector('#lcd-viewport-value');
            this.screenValue = this.root.querySelector('#lcd-screen-value');
            this.dprValue = this.root.querySelector('#lcd-dpr-value');
            this.depthValue = this.root.querySelector('#lcd-depth-value');
            this.refreshValue = this.root.querySelector('#lcd-refresh-value');

            this.overlayModeName = this.overlay.querySelector('#lcd-overlay-mode-name');
            this.overlayProgress = this.overlay.querySelector('#lcd-overlay-progress');
            this.overlayCountdown = this.overlay.querySelector('#lcd-overlay-countdown');
            this.overlayPalette = this.overlay.querySelector('#lcd-overlay-palette');
            this.overlayPause = this.overlay.querySelector('#lcd-overlay-pause');
            this.overlayPauseIcon = this.overlay.querySelector('#lcd-overlay-pause-icon');
            this.overlayToggleControls = this.overlay.querySelector('#lcd-overlay-toggle-controls');
        }

        bindEvents() {
            this.root.addEventListener('click', event => this.handleWorkbenchClick(event));
            this.overlay.addEventListener('click', event => this.handleOverlayClick(event));
            this.overlay.addEventListener('pointermove', () => this.showControls());
            this.overlay.addEventListener('pointerdown', event => this.handlePointerDown(event));
            this.overlay.addEventListener('pointerup', event => this.handlePointerUp(event));
            document.addEventListener('keydown', event => this.handleKeydown(event));
            document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
            window.addEventListener('resize', () => this.scheduleResize());
            window.addEventListener('orientationchange', () => this.scheduleResize());
            window.addEventListener('languageChanged', () => this.updateRuntimeTranslations());
            window.addEventListener('themeChanged', () => this.renderCurrentMode());

            if (this.customColorInput) {
                this.customColorInput.addEventListener('input', event => {
                    this.customColor = String(event.target.value || '#7C3AED').toUpperCase();
                    this.customColorOutput.textContent = this.customColor;
                    this.selectMode('solid-custom', { track: this.overlayOpen });
                });
            }
        }

        handleWorkbenchClick(event) {
            const action = event.target.closest('[data-action]');
            if (action && this.root.contains(action)) {
                this.lastStartTrigger = action;
                if (action.dataset.action === 'start-guided') {
                    this.startGuidedTest();
                } else if (action.dataset.action === 'start-manual') {
                    this.startManualTest();
                }
                return;
            }

            const tab = event.target.closest('[data-category]');
            if (tab && this.root.contains(tab)) {
                this.selectCategory(tab.dataset.category);
                return;
            }

            const modeButton = event.target.closest('[data-mode]');
            if (modeButton && this.root.contains(modeButton)) {
                this.selectMode(modeButton.dataset.mode, { track: false });
                return;
            }

            const grayLevelButton = event.target.closest('[data-gray-level]');
            if (grayLevelButton && this.root.contains(grayLevelButton)) {
                this.grayLevel = Number(grayLevelButton.dataset.grayLevel) || 0;
                this.markControlSelection('[data-gray-level]', grayLevelButton);
                this.selectMode('dark-level', { track: false });
                return;
            }

            const grayStepsButton = event.target.closest('[data-gray-steps]');
            if (grayStepsButton && this.root.contains(grayStepsButton)) {
                this.graySteps = Number(grayStepsButton.dataset.graySteps) || 16;
                this.markControlSelection('[data-gray-steps]', grayStepsButton);
                this.selectMode('grayscale-bars', { track: false });
                return;
            }

            const motionBackgroundButton = event.target.closest('[data-motion-bg]');
            if (motionBackgroundButton && this.root.contains(motionBackgroundButton)) {
                this.motionBackground = motionBackgroundButton.dataset.motionBg;
                this.markControlSelection('[data-motion-bg]', motionBackgroundButton);
                this.ensureMotionMode();
                return;
            }

            const motionSpeedButton = event.target.closest('[data-motion-speed]');
            if (motionSpeedButton && this.root.contains(motionSpeedButton)) {
                this.motionSpeed = motionSpeedButton.dataset.motionSpeed;
                this.markControlSelection('[data-motion-speed]', motionSpeedButton);
                this.ensureMotionMode();
            }
        }

        handleOverlayClick(event) {
            const actionButton = event.target.closest('[data-overlay-action]');
            if (actionButton) {
                event.stopPropagation();
                const action = actionButton.dataset.overlayAction;
                if (action === 'previous') this.moveSequence(-1);
                if (action === 'next') this.moveSequence(1);
                if (action === 'toggle-pause') this.togglePause();
                if (action === 'toggle-controls') {
                    this.toggleControls();
                    return;
                }
                if (action === 'exit') {
                    this.exitTest('early_exit');
                    return;
                }
                this.showControls(this.paused);
                return;
            }

            const paletteButton = event.target.closest('[data-overlay-mode]');
            if (paletteButton) {
                event.stopPropagation();
                this.selectOverlayMode(paletteButton.dataset.overlayMode);
                this.showControls(this.paused);
                return;
            }

            if (event.target === this.overlay || event.target === this.testCanvas) {
                this.toggleControls();
            }
        }

        handlePointerDown(event) {
            if (!this.overlayOpen || event.target.closest('.lcd-overlay-chrome')) return;
            this.touchStart = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY
            };
        }

        handlePointerUp(event) {
            if (!this.touchStart || this.touchStart.id !== event.pointerId) return;
            const deltaX = event.clientX - this.touchStart.x;
            const deltaY = event.clientY - this.touchStart.y;
            this.touchStart = null;

            if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
                event.preventDefault();
                this.moveSequence(deltaX < 0 ? 1 : -1);
                this.showControls(this.paused);
            }
        }

        handleKeydown(event) {
            if (!this.overlayOpen) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                this.exitTest('early_exit');
                return;
            }

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                this.moveSequence(1);
                this.showControls(this.paused);
                return;
            }

            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                this.moveSequence(-1);
                this.showControls(this.paused);
                return;
            }

            if (event.key === ' ') {
                event.preventDefault();
                if (this.guidedActive) {
                    this.togglePause();
                } else {
                    this.moveSequence(1);
                }
                this.showControls(this.paused);
            }
        }

        selectCategory(category) {
            if (!['quick', 'pixels', 'uniformity', 'motion', 'sharpness'].includes(category)) return;

            this.activeCategory = category;
            this.root.querySelectorAll('[role="tab"][data-category]').forEach(tab => {
                const selected = tab.dataset.category === category;
                tab.classList.toggle('is-active', selected);
                tab.setAttribute('aria-selected', String(selected));
                tab.tabIndex = selected ? 0 : -1;
            });
            this.root.querySelectorAll('[data-panel]').forEach(panel => {
                panel.hidden = panel.dataset.panel !== category;
            });

            if (category !== 'quick') {
                this.selectMode(this.lastModeByCategory[category], { track: false });
            }
        }

        selectMode(modeId, options = {}) {
            const mode = this.modeById.get(modeId);
            if (!mode) return;

            this.currentModeId = modeId;
            if (!modeId.startsWith('guided-')) {
                this.lastModeByCategory[mode.category] = modeId;
            }

            this.root.querySelectorAll('[data-mode]').forEach(button => {
                button.classList.toggle('is-selected', button.dataset.mode === modeId);
            });
            this.overlay.querySelectorAll('[data-overlay-mode]').forEach(button => {
                button.classList.toggle('is-selected', button.dataset.overlayMode === modeId);
            });

            this.updateModeLabels();
            this.renderCurrentMode();
            this.updateOverlayState();

            if (options.track && this.overlayOpen) {
                this.trackModeView(mode);
            }
        }

        markControlSelection(selector, selectedButton) {
            selectedButton.closest('.lcd-tab-panel').querySelectorAll(selector).forEach(button => {
                button.classList.toggle('is-selected', button === selectedButton);
            });
        }

        ensureMotionMode() {
            const currentMode = this.modeById.get(this.currentModeId);
            if (!currentMode || currentMode.category !== 'motion') {
                this.selectMode(this.lastModeByCategory.motion || 'motion-box', { track: false });
            } else {
                this.renderCurrentMode();
            }
        }

        startManualTest() {
            const mode = this.modeById.get(this.currentModeId) || this.modeById.get('solid-red');
            const category = mode.category;
            this.sequence = [...this.categoryModes[category]];
            this.sequenceIndex = Math.max(0, this.sequence.indexOf(mode.id));
            this.guidedActive = false;
            this.guidedCompleted = false;
            this.paused = false;
            this.enterOverlay('manual_start');
        }

        startGuidedTest() {
            this.sequence = [...this.guidedSequence];
            this.sequenceIndex = 0;
            this.guidedActive = true;
            this.guidedCompleted = false;
            this.paused = false;
            this.remainingStepMs = GUIDED_STEP_MS;
            this.enterOverlay('guided_start');
            this.startStepTimer(GUIDED_STEP_MS);
        }

        enterOverlay(startAction) {
            if (this.overlayOpen) return;

            this.overlayOpen = true;
            this.wasNativeFullscreen = false;
            this.controlsHidden = false;
            this.overlay.classList.remove('is-hidden', 'controls-hidden');
            this.overlay.classList.toggle('guided-mode', this.guidedActive);
            this.overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lcd-test-active');
            this.setStatus('running');
            this.message.textContent = this.t('lcdTester.testRunningMessage', 'Screen test is running in fullscreen.');

            const modeId = this.sequence[this.sequenceIndex] || this.currentModeId;
            this.selectMode(modeId, { track: true });
            this.track('screen_test_started', startAction, 'screen_test');
            this.showControls();
            this.requestFullscreen();
        }

        exitTest(outcome, options = {}) {
            if (!this.overlayOpen) return;

            const completed = outcome === 'completed_exit' || this.guidedCompleted;
            const wasGuided = this.guidedActive;
            this.overlayOpen = false;
            this.clearStepTimer();
            this.clearControlHideTimer();
            this.cancelMotion();

            this.overlay.classList.add('is-hidden');
            this.overlay.classList.remove('guided-mode', 'controls-hidden');
            this.overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lcd-test-active');
            this.track('screen_test_exited', completed ? 'completed_exit' : 'early_exit', 'screen_test');

            this.guidedActive = false;
            this.paused = false;
            this.controlsHidden = false;
            this.touchStart = null;

            if (completed) {
                this.setStatus('complete');
                this.message.textContent = this.t('lcdTester.testCompletedMessage', 'Guided test complete. Repeat any pattern you want to inspect again.');
            } else {
                this.setStatus('ready');
                this.message.textContent = this.t('lcdTester.keyboardHint', 'In fullscreen, use arrow keys to move. Space pauses Guided Test or advances Manual Test. Esc exits.');
            }

            if (!options.skipFullscreenExit) {
                this.exitNativeFullscreen();
            }

            if (wasGuided) {
                this.currentModeId = 'solid-red';
            }
            this.selectMode(this.currentModeId, { track: false });

            if (this.lastStartTrigger && typeof this.lastStartTrigger.focus === 'function') {
                this.lastStartTrigger.focus({ preventScroll: true });
            }
        }

        completeGuidedTest() {
            if (!this.overlayOpen || !this.guidedActive || this.guidedCompleted) return;

            this.guidedCompleted = true;
            this.track('screen_test_completed', 'guided_complete', 'screen_test');
            this.exitTest('completed_exit');
        }

        moveSequence(direction) {
            if (!this.overlayOpen || this.sequence.length === 0) return;

            if (this.guidedActive) {
                if (direction > 0 && this.sequenceIndex === this.sequence.length - 1) {
                    this.completeGuidedTest();
                    return;
                }

                this.sequenceIndex = Math.min(
                    this.sequence.length - 1,
                    Math.max(0, this.sequenceIndex + direction)
                );
                this.selectMode(this.sequence[this.sequenceIndex], { track: true });
                this.startStepTimer(GUIDED_STEP_MS);
                return;
            }

            this.sequenceIndex = (this.sequenceIndex + direction + this.sequence.length) % this.sequence.length;
            this.selectMode(this.sequence[this.sequenceIndex], { track: true });
        }

        selectOverlayMode(modeId) {
            const index = this.sequence.indexOf(modeId);
            if (index >= 0) {
                this.sequenceIndex = index;
            } else if (!this.guidedActive) {
                this.sequence = [...this.categoryModes.pixels];
                this.sequenceIndex = Math.max(0, this.sequence.indexOf(modeId));
            }
            this.selectMode(modeId, { track: true });
            if (this.guidedActive) this.startStepTimer(GUIDED_STEP_MS);
        }

        startStepTimer(duration) {
            if (!this.guidedActive || !this.overlayOpen) return;

            this.clearStepTimer();
            this.paused = false;
            this.remainingStepMs = duration;
            this.stepDeadline = performance.now() + duration;
            this.setStatus('running');
            this.updatePauseButton();
            this.updateCountdown();

            this.stepTimer = window.setInterval(() => {
                this.remainingStepMs = Math.max(0, this.stepDeadline - performance.now());
                this.updateCountdown();
                if (this.remainingStepMs <= 0) {
                    this.clearStepTimer();
                    this.moveSequence(1);
                }
            }, 100);
        }

        togglePause() {
            if (!this.guidedActive || !this.overlayOpen) return;

            if (this.paused) {
                this.paused = false;
                this.startStepTimer(Math.max(100, this.remainingStepMs));
            } else {
                this.remainingStepMs = Math.max(0, this.stepDeadline - performance.now());
                this.paused = true;
                this.clearStepTimer();
                this.setStatus('paused');
                this.updatePauseButton();
                this.updateCountdown();
            }
        }

        clearStepTimer() {
            if (this.stepTimer !== null) {
                window.clearInterval(this.stepTimer);
                this.stepTimer = null;
            }
        }

        updateCountdown() {
            if (!this.overlayCountdown) return;
            const seconds = Math.max(0, Math.ceil(this.remainingStepMs / 1000));
            this.overlayCountdown.textContent = `${seconds}s`;
        }

        updatePauseButton() {
            if (!this.overlayPause || !this.overlayPauseIcon) return;
            const key = this.paused ? 'lcdTester.resume' : 'lcdTester.pause';
            const fallback = this.paused ? 'Resume test' : 'Pause test';
            const label = this.t(key, fallback);
            this.overlayPauseIcon.textContent = this.paused ? '▶' : 'Ⅱ';
            this.overlayPause.setAttribute('aria-label', label);
            this.overlayPause.title = label;
        }

        requestFullscreen() {
            const request = this.overlay.requestFullscreen || this.overlay.webkitRequestFullscreen;
            if (typeof request !== 'function') return;

            try {
                const result = request.call(this.overlay);
                if (result && typeof result.then === 'function') {
                    result.then(() => {
                        this.wasNativeFullscreen = true;
                    }).catch(() => {});
                } else {
                    this.wasNativeFullscreen = true;
                }
            } catch (error) {
                // The fixed overlay remains a functional fallback when fullscreen is denied.
            }
        }

        exitNativeFullscreen() {
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
            if (!fullscreenElement) return;

            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (typeof exit !== 'function') return;

            try {
                const result = exit.call(document);
                if (result && typeof result.catch === 'function') result.catch(() => {});
            } catch (error) {
                // The overlay state has already been restored.
            }
        }

        handleFullscreenChange() {
            const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
            if (fullscreenElement === this.overlay) {
                this.wasNativeFullscreen = true;
                this.scheduleResize();
                return;
            }

            if (this.overlayOpen && this.wasNativeFullscreen) {
                this.exitTest('early_exit', { skipFullscreenExit: true });
            }
        }

        showControls(keepVisible = false) {
            if (!this.overlayOpen) return;
            this.controlsHidden = false;
            this.overlay.classList.remove('controls-hidden');
            this.updateControlToggleButton();
            this.clearControlHideTimer();

            if (!keepVisible && !this.paused) {
                this.controlHideTimer = window.setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.closest && activeElement.closest('.lcd-overlay-chrome')) {
                        this.showControls();
                        return;
                    }
                    this.controlsHidden = true;
                    this.overlay.classList.add('controls-hidden');
                    this.updateControlToggleButton();
                }, CONTROL_HIDE_MS);
            }
        }

        toggleControls() {
            if (!this.overlayOpen) return;

            if (this.controlsHidden) {
                this.showControls(true);
            } else {
                this.clearControlHideTimer();
                this.controlsHidden = true;
                this.overlay.classList.add('controls-hidden');
                this.updateControlToggleButton();
            }
        }

        updateControlToggleButton() {
            if (!this.overlayToggleControls) return;
            const key = this.controlsHidden ? 'lcdTester.showControls' : 'lcdTester.hideControls';
            const fallback = this.controlsHidden ? 'Show controls' : 'Hide controls';
            const label = this.t(key, fallback);
            this.overlayToggleControls.setAttribute('aria-label', label);
            this.overlayToggleControls.title = label;
        }

        clearControlHideTimer() {
            if (this.controlHideTimer !== null) {
                window.clearTimeout(this.controlHideTimer);
                this.controlHideTimer = null;
            }
        }

        handleVisibilityChange() {
            if (document.hidden) {
                this.cancelMotion();
            } else {
                this.renderCurrentMode();
            }
        }

        scheduleResize() {
            this.updateDisplayInformation();
            if (this.resizeFrame !== null) return;

            this.resizeFrame = window.requestAnimationFrame(() => {
                this.resizeFrame = null;
                this.renderCurrentMode();
            });
        }

        updateDisplayInformation() {
            if (this.viewportValue) this.viewportValue.textContent = `${window.innerWidth} × ${window.innerHeight}`;
            if (this.screenValue) this.screenValue.textContent = `${window.screen.width} × ${window.screen.height}`;
            if (this.dprValue) this.dprValue.textContent = this.formatDpr(window.devicePixelRatio || 1);
            if (this.depthValue) this.depthValue.textContent = `${window.screen.colorDepth || '--'}-bit`;
        }

        formatDpr(value) {
            return Number(Number(value).toFixed(2)).toString();
        }

        estimateRefreshRate() {
            if (typeof window.requestAnimationFrame !== 'function') return;
            const timestamps = [];
            let frames = 0;

            const sample = timestamp => {
                frames += 1;
                timestamps.push(timestamp);
                if (timestamps.length > 48) timestamps.shift();

                if (timestamps.length >= 36 || frames >= 90) {
                    const intervals = [];
                    for (let index = 1; index < timestamps.length; index += 1) {
                        const interval = timestamps[index] - timestamps[index - 1];
                        if (interval > 4 && interval < 100) intervals.push(interval);
                    }
                    intervals.sort((a, b) => a - b);
                    const median = intervals[Math.floor(intervals.length / 2)];
                    if (median && this.refreshValue) {
                        this.refreshValue.textContent = `${Math.round(1000 / median)} Hz`;
                    }
                    this.refreshFrame = null;
                    return;
                }

                this.refreshFrame = window.requestAnimationFrame(sample);
            };

            this.refreshFrame = window.requestAnimationFrame(sample);
        }

        updateModeLabels() {
            const mode = this.modeById.get(this.currentModeId);
            if (!mode) return;
            const name = this.getModeLabel(mode);
            const categoryKey = `lcdTester.tab${mode.category.charAt(0).toUpperCase()}${mode.category.slice(1)}`;
            const categoryFallback = mode.category;
            const category = this.t(categoryKey, categoryFallback);
            const description = this.getModeDescription(mode);

            if (this.previewName) this.previewName.textContent = name;
            if (this.previewDescription) this.previewDescription.textContent = description;
            if (this.previewCategory) this.previewCategory.textContent = category.toLocaleUpperCase();
            if (this.overlayModeName) this.overlayModeName.textContent = name;
        }

        updateOverlayState() {
            if (!this.overlayProgress) return;
            const total = Math.max(1, this.sequence.length);
            const current = Math.min(total, this.sequenceIndex + 1);
            this.overlayProgress.textContent = `${current} / ${total}`;

            const mode = this.modeById.get(this.currentModeId);
            const showPalette = Boolean(mode && mode.category === 'pixels');
            this.overlayPalette.classList.toggle('is-hidden', !showPalette);
            this.updatePauseButton();
        }

        updateRuntimeTranslations() {
            this.root.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
                const key = element.getAttribute('data-i18n-aria-label');
                const current = element.getAttribute('aria-label') || '';
                element.setAttribute('aria-label', this.t(key, current));
            });
            this.overlay.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
                const key = element.getAttribute('data-i18n-aria-label');
                const current = element.getAttribute('aria-label') || '';
                element.setAttribute('aria-label', this.t(key, current));
            });

            const previousLabel = this.t('lcdTester.previousPattern', 'Previous pattern');
            const nextLabel = this.t('lcdTester.nextPattern', 'Next pattern');
            const exitLabel = this.t('lcdTester.exitFullscreen', 'Exit fullscreen');
            this.setButtonLabel('#lcd-overlay-previous', previousLabel);
            this.setButtonLabel('#lcd-overlay-next', nextLabel);
            this.setButtonLabel('#lcd-overlay-exit', exitLabel);

            this.overlay.querySelectorAll('[data-overlay-mode]').forEach(button => {
                const mode = this.modeById.get(button.dataset.overlayMode);
                if (mode) button.setAttribute('aria-label', this.getModeLabel(mode));
            });

            this.updateModeLabels();
            this.updatePauseButton();
            this.updateControlToggleButton();
            this.setStatus(this.workbench.dataset.state || 'ready');
        }

        setButtonLabel(selector, label) {
            const button = this.overlay.querySelector(selector);
            if (!button) return;
            button.setAttribute('aria-label', label);
            button.title = label;
        }

        setStatus(state) {
            const statusMap = {
                ready: ['lcdTester.statusReady', 'Ready to test'],
                running: ['lcdTester.statusRunning', 'Test running'],
                paused: ['lcdTester.statusPaused', 'Test paused'],
                complete: ['lcdTester.statusComplete', 'Test complete']
            };
            const [key, fallback] = statusMap[state] || statusMap.ready;
            this.workbench.dataset.state = state;
            if (this.statusText) this.statusText.textContent = this.t(key, fallback);
        }

        getModeLabel(mode) {
            if (mode.id === 'dark-level') {
                return `${this.grayLevel}% ${this.t('lcdTester.gray', 'grey')}`;
            }
            return this.t(mode.labelKey, mode.fallback);
        }

        getModeDescription(mode) {
            const descriptions = {
                pixel: ['lcdTester.pixelModeHint', 'Use solid colors to reveal pixels that remain dark, bright, or fixed to one color.'],
                uniformity: ['lcdTester.uniformityModeHint', 'Inspect the full panel for uneven brightness, tint, edge glow, or visible steps.'],
                color: ['lcdTester.colorModeHint', 'Look for smooth transitions, clear color separation, and obvious tint differences.'],
                motion: ['lcdTester.motionModeHint', 'Follow the moving edge and look for shadows, bright halos, or persistent smearing.'],
                sharpness: ['lcdTester.sharpnessModeHint', 'Inspect fine edges and repeated lines for blur, scaling, or alignment artifacts.']
            };
            const [key, fallback] = descriptions[mode.resultType] || descriptions.sharpness;
            return this.t(key, fallback);
        }

        t(key, fallback, options = {}) {
            if (window.i18next && typeof window.i18next.t === 'function') {
                const translated = window.i18next.t(key, options);
                if (translated && translated !== key) return translated;
            }

            const source = this.root.querySelector(`[data-i18n="${key}"]`) || this.overlay.querySelector(`[data-i18n="${key}"]`);
            const text = source && source.textContent ? source.textContent.trim() : '';
            return text || fallback;
        }

        track(eventName, toolAction, resultType) {
            if (!window.ScreenSizeAnalytics || typeof window.ScreenSizeAnalytics.track !== 'function') return false;
            return window.ScreenSizeAnalytics.track(eventName, {
                page_id: 'lcd-screen-tester',
                tool_name: 'lcd_screen_tester',
                tool_action: toolAction,
                result_type: resultType
            }, { dedupeMs: 0 });
        }

        trackModeView(mode) {
            if (this.viewedResultTypes.has(mode.resultType)) return;
            this.viewedResultTypes.add(mode.resultType);
            this.track('tool_result_view', 'view_pattern', mode.resultType);
        }

        renderCurrentMode() {
            const mode = this.modeById.get(this.currentModeId);
            if (!mode) return;

            this.cancelMotion();
            const targets = this.getCanvasTargets();
            if (targets.length === 0) return;

            if (mode.type.startsWith('motion-')) {
                this.startMotion(mode, targets);
            } else {
                targets.forEach(target => this.drawStaticMode(target, mode));
            }
        }

        getCanvasTargets() {
            const targets = [];
            const preview = this.prepareCanvas(this.previewCanvas);
            if (preview) targets.push(preview);
            if (this.overlayOpen) {
                const test = this.prepareCanvas(this.testCanvas);
                if (test) targets.push(test);
            }
            return targets;
        }

        prepareCanvas(canvas) {
            if (!canvas || typeof canvas.getContext !== 'function') return null;
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || window.innerWidth));
            const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || window.innerHeight));
            const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_CANVAS_DPR);
            const bitmapWidth = Math.max(1, Math.round(width * dpr));
            const bitmapHeight = Math.max(1, Math.round(height * dpr));

            if (canvas.width !== bitmapWidth) canvas.width = bitmapWidth;
            if (canvas.height !== bitmapHeight) canvas.height = bitmapHeight;
            canvas.dataset.cssWidth = String(width);
            canvas.dataset.cssHeight = String(height);
            canvas.dataset.renderDpr = String(dpr);

            const context = canvas.getContext('2d', { alpha: false });
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.imageSmoothingEnabled = false;
            return { canvas, context, width, height, dpr };
        }

        drawStaticMode(target, mode) {
            const { context, width, height, dpr } = target;
            context.save();
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.clearRect(0, 0, width, height);

            switch (mode.type) {
                case 'solid':
                    this.fill(target, mode.color);
                    break;
                case 'custom-color':
                    this.fill(target, this.customColor);
                    break;
                case 'dynamic-gray':
                    this.fill(target, this.grayPercentToHex(this.grayLevel));
                    break;
                case 'gradient-horizontal':
                    this.drawGradient(target, false);
                    break;
                case 'gradient-vertical':
                    this.drawGradient(target, true);
                    break;
                case 'gradient-rgb':
                    this.drawRgbGradient(target);
                    break;
                case 'grayscale-bars':
                    this.drawGrayscaleBars(target);
                    break;
                case 'grayscale-gradient':
                    this.drawGrayscaleGradient(target);
                    break;
                case 'checkerboard':
                    this.drawCheckerboard(target);
                    break;
                case 'grid':
                    this.drawGrid(target);
                    break;
                case 'lines-horizontal':
                    this.drawPhysicalLines(target, true);
                    break;
                case 'lines-vertical':
                    this.drawPhysicalLines(target, false);
                    break;
                case 'color-bars':
                    this.drawColorBars(target);
                    break;
                case 'smpte':
                    this.drawSmpte(target);
                    break;
                case 'text-white':
                    this.drawTextPattern(target, '#FFFFFF', '#111827');
                    break;
                case 'text-black':
                    this.drawTextPattern(target, '#050505', '#FFFFFF');
                    break;
                default:
                    this.fill(target, '#000000');
            }
            context.restore();
        }

        fill(target, color) {
            target.context.fillStyle = color;
            target.context.fillRect(0, 0, target.width, target.height);
        }

        grayPercentToHex(percent) {
            const channel = Math.round(255 * Math.min(100, Math.max(0, percent)) / 100);
            const hex = channel.toString(16).padStart(2, '0').toUpperCase();
            return `#${hex}${hex}${hex}`;
        }

        drawGradient(target, vertical) {
            const gradient = target.context.createLinearGradient(
                0,
                0,
                vertical ? 0 : target.width,
                vertical ? target.height : 0
            );
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(0.5, '#808080');
            gradient.addColorStop(1, '#FFFFFF');
            target.context.fillStyle = gradient;
            target.context.fillRect(0, 0, target.width, target.height);
        }

        drawRgbGradient(target) {
            const colors = [
                ['#000000', '#FF0000'],
                ['#000000', '#00FF00'],
                ['#000000', '#0000FF']
            ];
            const bandHeight = target.height / colors.length;
            colors.forEach((colorsForBand, index) => {
                const gradient = target.context.createLinearGradient(0, 0, target.width, 0);
                gradient.addColorStop(0, colorsForBand[0]);
                gradient.addColorStop(1, colorsForBand[1]);
                target.context.fillStyle = gradient;
                target.context.fillRect(0, index * bandHeight, target.width, bandHeight + 1);
            });
        }

        drawGrayscaleBars(target) {
            const steps = Math.max(4, this.graySteps);
            const barWidth = target.width / steps;
            for (let index = 0; index < steps; index += 1) {
                const value = Math.round(255 * index / Math.max(1, steps - 1));
                target.context.fillStyle = `rgb(${value}, ${value}, ${value})`;
                target.context.fillRect(index * barWidth, 0, barWidth + 1, target.height);
            }
        }

        drawGrayscaleGradient(target) {
            const gradient = target.context.createLinearGradient(0, 0, target.width, 0);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(1, '#FFFFFF');
            target.context.fillStyle = gradient;
            target.context.fillRect(0, 0, target.width, target.height);

            const stripHeight = Math.max(24, target.height * 0.09);
            for (let index = 0; index < 16; index += 1) {
                const value = Math.round(255 * index / 15);
                target.context.fillStyle = `rgb(${value}, ${value}, ${value})`;
                target.context.fillRect(index * target.width / 16, target.height - stripHeight, target.width / 16 + 1, stripHeight);
            }
        }

        drawCheckerboard(target) {
            const size = Math.max(8, Math.round(Math.min(target.width, target.height) / 30));
            for (let y = 0; y < target.height; y += size) {
                for (let x = 0; x < target.width; x += size) {
                    target.context.fillStyle = ((x / size + y / size) % 2 === 0) ? '#000000' : '#FFFFFF';
                    target.context.fillRect(x, y, size, size);
                }
            }
        }

        drawGrid(target) {
            this.fill(target, '#050505');
            const spacing = Math.max(12, Math.round(Math.min(target.width, target.height) / 24));
            const lineWidth = 1 / target.dpr;
            const offset = 0.5 / target.dpr;
            target.context.strokeStyle = '#FFFFFF';
            target.context.lineWidth = lineWidth;
            target.context.beginPath();
            for (let x = offset; x <= target.width; x += spacing) {
                target.context.moveTo(x, 0);
                target.context.lineTo(x, target.height);
            }
            for (let y = offset; y <= target.height; y += spacing) {
                target.context.moveTo(0, y);
                target.context.lineTo(target.width, y);
            }
            target.context.stroke();
        }

        drawPhysicalLines(target, horizontal) {
            this.fill(target, '#FFFFFF');
            target.context.fillStyle = '#000000';
            const physicalPixel = 1 / target.dpr;
            const limit = horizontal ? target.height : target.width;
            for (let position = 0; position < limit; position += physicalPixel * 2) {
                if (horizontal) {
                    target.context.fillRect(0, position, target.width, physicalPixel);
                } else {
                    target.context.fillRect(position, 0, physicalPixel, target.height);
                }
            }
        }

        drawColorBars(target) {
            const colors = ['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF00FF', '#FF0000', '#0000FF', '#000000'];
            const width = target.width / colors.length;
            colors.forEach((color, index) => {
                target.context.fillStyle = color;
                target.context.fillRect(index * width, 0, width + 1, target.height);
            });
        }

        drawSmpte(target) {
            const topColors = ['#BFBFBF', '#BFBF00', '#00BFBF', '#00BF00', '#BF00BF', '#BF0000', '#0000BF'];
            const middleColors = ['#0000BF', '#111111', '#BF00BF', '#111111', '#00BFBF', '#111111', '#BFBFBF'];
            const topHeight = target.height * 0.67;
            const middleHeight = target.height * 0.08;
            const barWidth = target.width / topColors.length;

            topColors.forEach((color, index) => {
                target.context.fillStyle = color;
                target.context.fillRect(index * barWidth, 0, barWidth + 1, topHeight);
            });
            middleColors.forEach((color, index) => {
                target.context.fillStyle = color;
                target.context.fillRect(index * barWidth, topHeight, barWidth + 1, middleHeight);
            });

            const bottomY = topHeight + middleHeight;
            const bottomHeight = target.height - bottomY;
            const bottomColors = ['#00194D', '#FFFFFF', '#320064', '#070707', '#121212', '#1D1D1D', '#000000'];
            bottomColors.forEach((color, index) => {
                target.context.fillStyle = color;
                target.context.fillRect(index * barWidth, bottomY, barWidth + 1, bottomHeight);
            });
        }

        drawTextPattern(target, background, foreground) {
            this.fill(target, background);
            const context = target.context;
            const sizes = [10, 12, 14, 16, 20, 24, 32, 42];
            const maxWidth = Math.max(120, target.width - 40);
            const sample = 'Aa Bb Cc 0123456789 | The quick brown fox';
            let y = 28;

            context.fillStyle = foreground;
            context.textBaseline = 'top';
            context.textAlign = 'left';
            sizes.forEach(size => {
                if (y + size > target.height - 20) return;
                context.font = `${size}px Arial, sans-serif`;
                context.save();
                context.beginPath();
                context.rect(20, 0, maxWidth, target.height);
                context.clip();
                context.fillText(`${size}px  ${sample}`, 20, y);
                context.restore();
                y += size + 12;
            });

            context.font = '14px ui-monospace, SFMono-Regular, Consolas, monospace';
            const lineY = Math.min(target.height - 34, y + 10);
            context.fillText('||||||||||||||||  =================  ................', 20, lineY);
        }

        startMotion(mode, targets) {
            this.motionPosition = 0;
            this.motionLastTimestamp = null;
            const animate = timestamp => {
                if (document.hidden) {
                    this.motionFrame = null;
                    return;
                }

                const delta = this.motionLastTimestamp === null
                    ? 0
                    : Math.min(0.05, Math.max(0, (timestamp - this.motionLastTimestamp) / 1000));
                this.motionLastTimestamp = timestamp;
                this.motionPosition += this.getMotionSpeed() * delta;

                targets.forEach(target => this.drawMotionFrame(target, mode, this.motionPosition));
                this.motionFrame = window.requestAnimationFrame(animate);
            };
            this.motionFrame = window.requestAnimationFrame(animate);
        }

        drawMotionFrame(target, mode, position) {
            const backgroundMap = { black: '#050505', gray: '#707070', white: '#FFFFFF' };
            const background = backgroundMap[this.motionBackground] || backgroundMap.black;
            const foreground = this.motionBackground === 'white' ? '#111111' : '#FFFFFF';
            this.fill(target, background);
            const context = target.context;

            if (mode.type === 'motion-box') {
                const size = Math.max(42, Math.min(94, Math.min(target.width, target.height) * 0.18));
                const x = (position % (target.width + size)) - size;
                context.strokeStyle = this.motionBackground === 'white' ? '#D0D0D0' : '#303030';
                context.lineWidth = 1;
                for (let guide = 0; guide < target.width; guide += 80) {
                    context.beginPath();
                    context.moveTo(guide, 0);
                    context.lineTo(guide, target.height);
                    context.stroke();
                }
                context.fillStyle = foreground;
                context.fillRect(x, (target.height - size) / 2, size, size);
                return;
            }

            if (mode.type === 'motion-text') {
                const text = this.t('lcdTester.motionSampleText', 'Motion clarity • Follow the leading and trailing edges • ');
                const fontSize = Math.max(24, Math.min(52, target.height * 0.14));
                context.fillStyle = foreground;
                context.font = `700 ${fontSize}px Arial, sans-serif`;
                context.textBaseline = 'middle';
                const textWidth = context.measureText(text).width;
                const x = target.width - (position % (target.width + textWidth));
                context.fillText(text, x, target.height / 2);
                context.fillText(text, x + textWidth + 80, target.height / 2);
                return;
            }

            const stripeWidth = Math.max(12, Math.min(28, target.width / 36));
            const offset = position % (stripeWidth * 2);
            context.fillStyle = foreground;
            for (let x = -stripeWidth * 2 + offset; x < target.width + stripeWidth; x += stripeWidth * 2) {
                context.fillRect(x, 0, stripeWidth, target.height);
            }
        }

        getMotionSpeed() {
            return { slow: 80, medium: 170, fast: 320 }[this.motionSpeed] || 170;
        }

        cancelMotion() {
            if (this.motionFrame !== null) {
                window.cancelAnimationFrame(this.motionFrame);
                this.motionFrame = null;
            }
            this.motionLastTimestamp = null;
        }
    }

    function initializeLCDScreenTester() {
        const root = document.querySelector('[data-lcd-tester]');
        if (!root) return;
        window.__lcdScreenTester = new LCDScreenTester(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLCDScreenTester, { once: true });
    } else {
        initializeLCDScreenTester();
    }
})();
