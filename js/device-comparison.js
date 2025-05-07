// Device comparison functionality

/**
 * Device data mapping
 */
const deviceData = {
    // 最新iPhone机型 (iPhone 15系列)
    'iphone-15-pro-max': { 
        viewport: '430 x 932', 
        resolution: '1290 x 2796', 
        dpr: 3.0,
        physicalSize: '160.7 x 77.6 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-15-pro': { 
        viewport: '393 x 852', 
        resolution: '1179 x 2556', 
        dpr: 3.0,
        physicalSize: '146.6 x 70.6 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-15-plus': { 
        viewport: '430 x 932', 
        resolution: '1284 x 2778', 
        dpr: 3.0,
        physicalSize: '160.9 x 77.8 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-15': { 
        viewport: '393 x 852', 
        resolution: '1179 x 2556', 
        dpr: 3.0,
        physicalSize: '146.6 x 70.6 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },

    // iPhone 14系列
    'iphone-14-pro-max': { 
        viewport: '430 x 932', 
        resolution: '1290 x 2796', 
        dpr: 3.0,
        physicalSize: '160.7 x 77.6 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-14-pro': { 
        viewport: '393 x 852', 
        resolution: '1179 x 2556', 
        dpr: 3.0,
        physicalSize: '147.5 x 71.5 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-14-plus': { 
        viewport: '428 x 926', 
        resolution: '1284 x 2778', 
        dpr: 3.0,
        physicalSize: '160.8 x 78.1 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-14': { 
        viewport: '390 x 844', 
        resolution: '1170 x 2532', 
        dpr: 3.0,
        physicalSize: '146.7 x 71.5 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },

    // iPhone 13系列
    'iphone-13-pro-max': { 
        viewport: '428 x 926', 
        resolution: '1284 x 2778', 
        dpr: 3.0,
        physicalSize: '160.8 x 78.1 x 7.65 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-13-pro': { 
        viewport: '390 x 844', 
        resolution: '1170 x 2532', 
        dpr: 3.0,
        physicalSize: '146.7 x 71.5 x 7.65 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-13': { 
        viewport: '390 x 844', 
        resolution: '1170 x 2532', 
        dpr: 3.0,
        physicalSize: '146.7 x 71.5 x 7.65 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-13-mini': { 
        viewport: '375 x 812', 
        resolution: '1125 x 2436', 
        dpr: 3.0,
        physicalSize: '131.5 x 64.2 x 7.65 mm',
        screenType: 'OLED',
        pixelDensity: '476 ppi'
    },

    // iPhone 12系列
    'iphone-12-pro-max': { 
        viewport: '428 x 926', 
        resolution: '1284 x 2778', 
        dpr: 3.0,
        physicalSize: '160.8 x 78.1 x 7.4 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-12-pro': { 
        viewport: '390 x 844', 
        resolution: '1170 x 2532', 
        dpr: 3.0,
        physicalSize: '146.7 x 71.5 x 7.4 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-12': { 
        viewport: '390 x 844', 
        resolution: '1170 x 2532', 
        dpr: 3.0,
        physicalSize: '146.7 x 71.5 x 7.4 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-12-mini': { 
        viewport: '375 x 812', 
        resolution: '1125 x 2436', 
        dpr: 3.0,
        physicalSize: '131.5 x 64.2 x 7.4 mm',
        screenType: 'OLED',
        pixelDensity: '476 ppi'
    },

    // iPhone 11系列
    'iphone-11-pro-max': { 
        viewport: '414 x 896', 
        resolution: '1242 x 2688', 
        dpr: 3.0,
        physicalSize: '158 x 77.8 x 8.1 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-11-pro': { 
        viewport: '375 x 812', 
        resolution: '1125 x 2436', 
        dpr: 3.0,
        physicalSize: '144 x 71.4 x 8.1 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-11': { 
        viewport: '414 x 896', 
        resolution: '828 x 1792', 
        dpr: 2.0,
        physicalSize: '150.9 x 75.7 x 8.3 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },

    // iPhone X/XS/XR系列
    'iphone-xs-max': { 
        viewport: '414 x 896', 
        resolution: '1242 x 2688', 
        dpr: 3.0,
        physicalSize: '157.5 x 77.4 x 7.7 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-xs': { 
        viewport: '375 x 812', 
        resolution: '1125 x 2436', 
        dpr: 3.0,
        physicalSize: '143.6 x 70.9 x 7.7 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },
    'iphone-xr': { 
        viewport: '414 x 896', 
        resolution: '828 x 1792', 
        dpr: 2.0,
        physicalSize: '150.9 x 75.7 x 8.3 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    'iphone-x': { 
        viewport: '375 x 812', 
        resolution: '1125 x 2436', 
        dpr: 3.0,
        physicalSize: '143.6 x 70.9 x 7.7 mm',
        screenType: 'OLED',
        pixelDensity: '458 ppi'
    },

    // iPhone 8系列及更早
    'iphone-8-plus': { 
        viewport: '414 x 736', 
        resolution: '1080 x 1920', 
        dpr: 3.0,
        physicalSize: '158.4 x 78.1 x 7.5 mm',
        screenType: 'LCD',
        pixelDensity: '401 ppi'
    },
    'iphone-8': { 
        viewport: '375 x 667', 
        resolution: '750 x 1334', 
        dpr: 2.0,
        physicalSize: '138.4 x 67.3 x 7.3 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    'iphone-7-plus': { 
        viewport: '414 x 736', 
        resolution: '1080 x 1920', 
        dpr: 3.0,
        physicalSize: '158.2 x 77.9 x 7.3 mm',
        screenType: 'LCD',
        pixelDensity: '401 ppi'
    },
    'iphone-7': { 
        viewport: '375 x 667', 
        resolution: '750 x 1334', 
        dpr: 2.0,
        physicalSize: '138.3 x 67.1 x 7.1 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    'iphone-6s-plus': { 
        viewport: '414 x 736', 
        resolution: '1080 x 1920', 
        dpr: 3.0,
        physicalSize: '158.2 x 77.9 x 7.3 mm',
        screenType: 'LCD',
        pixelDensity: '401 ppi'
    },
    'iphone-6s': { 
        viewport: '375 x 667', 
        resolution: '750 x 1334', 
        dpr: 2.0,
        physicalSize: '138.3 x 67.1 x 7.1 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    'iphone-6-plus': { 
        viewport: '414 x 736', 
        resolution: '1080 x 1920', 
        dpr: 3.0,
        physicalSize: '158.1 x 77.8 x 7.1 mm',
        screenType: 'LCD',
        pixelDensity: '401 ppi'
    },
    'iphone-6': { 
        viewport: '375 x 667', 
        resolution: '750 x 1334', 
        dpr: 2.0,
        physicalSize: '138.1 x 67 x 6.9 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    
    // iPad models
    'ipad-pro-12.9': { 
        viewport: '1024 x 1366', 
        resolution: '2048 x 2732', 
        dpr: 2.0,
        physicalSize: '280.6 x 214.9 x 6.4 mm',
        screenType: 'LCD',
        pixelDensity: '264 ppi'
    },
    'ipad-pro-11': { 
        viewport: '834 x 1194', 
        resolution: '1668 x 2388', 
        dpr: 2.0,
        physicalSize: '247.6 x 178.5 x 5.9 mm',
        screenType: 'LCD',
        pixelDensity: '264 ppi'
    },
    'ipad-air': { 
        viewport: '820 x 1180', 
        resolution: '1640 x 2360', 
        dpr: 2.0,
        physicalSize: '247.6 x 178.5 x 6.1 mm',
        screenType: 'LCD',
        pixelDensity: '264 ppi'
    },
    'ipad-mini': { 
        viewport: '768 x 1024', 
        resolution: '1536 x 2048', 
        dpr: 2.0,
        physicalSize: '195.4 x 134.8 x 6.3 mm',
        screenType: 'LCD',
        pixelDensity: '326 ppi'
    },
    
    // Android models
    'samsung-s23-ultra': { 
        viewport: '412 x 878', 
        resolution: '1440 x 3088', 
        dpr: 3.5,
        physicalSize: '163.4 x 78.1 x 8.9 mm',
        screenType: 'OLED',
        pixelDensity: '500 ppi'
    },
    'samsung-s23-plus': { 
        viewport: '393 x 851', 
        resolution: '1080 x 2340', 
        dpr: 2.75,
        physicalSize: '157.8 x 76.2 x 7.6 mm',
        screenType: 'OLED',
        pixelDensity: '393 ppi'
    },
    'samsung-s23': { 
        viewport: '360 x 780', 
        resolution: '1080 x 2340', 
        dpr: 3.0,
        physicalSize: '146.3 x 70.9 x 7.6 mm',
        screenType: 'OLED',
        pixelDensity: '425 ppi'
    },
    'pixel-7-pro': { 
        viewport: '412 x 892', 
        resolution: '1440 x 3120', 
        dpr: 3.5,
        physicalSize: '162.9 x 76.6 x 8.9 mm',
        screenType: 'OLED',
        pixelDensity: '512 ppi'
    },
    'pixel-7': { 
        viewport: '393 x 851', 
        resolution: '1080 x 2400', 
        dpr: 2.75,
        physicalSize: '155.6 x 73.2 x 8.7 mm',
        screenType: 'OLED',
        pixelDensity: '416 ppi'
    },
    'oneplus-11': { 
        viewport: '412 x 892', 
        resolution: '1440 x 3216', 
        dpr: 3.5,
        physicalSize: '163.1 x 74.1 x 8.5 mm',
        screenType: 'OLED',
        pixelDensity: '525 ppi'
    },

    // iPhone 16系列
    'iphone-16-pro-max': { 
        viewport: '440 x 956', 
        resolution: '1320 x 2868', 
        dpr: 3.0,
        physicalSize: '160.7 x 77.6 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-16-pro': { 
        viewport: '402 x 874', 
        resolution: '1206 x 2622', 
        dpr: 3.0,
        physicalSize: '146.6 x 70.6 x 7.85 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-16-plus': { 
        viewport: '428 x 926', 
        resolution: '1284 x 2778', 
        dpr: 3.0,
        physicalSize: '160.9 x 77.8 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
    'iphone-16': { 
        viewport: '393 x 852', 
        resolution: '1179 x 2556', 
        dpr: 3.0,
        physicalSize: '146.6 x 70.6 x 7.8 mm',
        screenType: 'OLED',
        pixelDensity: '460 ppi'
    },
};

/**
 * Initialize device comparison functionality
 */
function initDeviceComparison() {
    const device1Select = document.getElementById('device1-select');
    const device2Select = document.getElementById('device2-select');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');
    const applyCustomSize = document.getElementById('apply-custom-size');

    if (device1Select) device1Select.addEventListener('change', updateDeviceDisplay);
    if (device2Select) device2Select.addEventListener('change', updateDeviceDisplay);
    if (applyCustomSize) {
        applyCustomSize.addEventListener('click', () => {
            const width = parseInt(customWidth.value);
            const height = parseInt(customHeight.value);
            if (width && height) {
                updateCustomDisplay(width, height);
            }
        });
    }

    // 添加设备旋转和缩放按钮
    addDeviceControls();

    // Initial update
    updateDeviceDisplay();
}

/**
 * Add device control buttons
 */
function addDeviceControls() {
    const deviceDisplays = document.querySelectorAll('.device-display');
    deviceDisplays.forEach(display => {
        const controls = document.createElement('div');
        controls.className = 'device-controls';
        controls.innerHTML = `
            <button class="rotate-btn" title="Rotate Device">↻</button>
            <button class="scale-btn" title="Scale Device">+</button>
        `;
        display.appendChild(controls);

        // 添加旋转按钮事件
        const rotateBtn = controls.querySelector('.rotate-btn');
        rotateBtn.addEventListener('click', () => {
            const screen = display.querySelector('.device-screen');
            screen.classList.toggle('rotated');
            updateDeviceDimensions(display);
        });

        // 添加缩放按钮事件
        const scaleBtn = controls.querySelector('.scale-btn');
        scaleBtn.addEventListener('click', () => {
            const screen = display.querySelector('.device-screen');
            screen.classList.toggle('scaled');
            updateDeviceDimensions(display);
        });
    });
}

/**
 * Update device display based on selected devices
 */
function updateDeviceDisplay() {
    updateSingleDevice('device1');
    updateSingleDevice('device2');
}

/**
 * Update single device display
 * @param {string} deviceId - ID of the device to update
 */
function updateSingleDevice(deviceId) {
    const select = document.getElementById(`${deviceId}-select`);
    if (!select) return;

    const selectedDevice = select.value;
    const device = deviceData[selectedDevice];
    if (!device) return;

    const display = document.getElementById(`${deviceId}-display`);
    const viewport = display.querySelector(`#${deviceId}-viewport`);
    const resolution = display.querySelector(`#${deviceId}-resolution`);
    const dpr = display.querySelector(`#${deviceId}-dpr`);
    const physicalSize = display.querySelector(`#${deviceId}-physical-size`);
    const screenType = display.querySelector(`#${deviceId}-screen-type`);
    const pixelDensity = display.querySelector(`#${deviceId}-pixel-density`);
    const screen = display.querySelector('.device-screen');

    if (viewport) viewport.textContent = device.viewport;
    if (resolution) resolution.textContent = device.resolution;
    if (dpr) dpr.textContent = device.dpr;
    if (physicalSize) physicalSize.textContent = device.physicalSize;
    if (screenType) screenType.textContent = device.screenType;
    if (pixelDensity) pixelDensity.textContent = device.pixelDensity;

    // 更新设备屏幕显示
    if (screen) {
        const [width, height] = device.viewport.split(' x ').map(Number);
        const scale = calculateScale(width, height);
        screen.style.width = `${width}px`;
        screen.style.height = `${height}px`;
        screen.style.transform = `scale(${scale})`;
        updateDeviceDimensions(display, width, height, device.physicalSize);
    }
}

/**
 * Update device dimensions display
 * @param {HTMLElement} display - Device display element
 * @param {number} width - Device width
 * @param {number} height - Device height
 * @param {string} physicalSize - Physical size of the device
 */
function updateDeviceDimensions(display, width, height, physicalSize) {
    // 移除旧的尺寸标注
    const oldDimensions = display.querySelectorAll('.device-dimensions');
    oldDimensions.forEach(dim => dim.remove());

    // 添加新的尺寸标注
    const frame = display.querySelector('.device-frame');
    if (!frame) return;

    // 宽度标注
    const widthDim = document.createElement('div');
    widthDim.className = 'device-dimensions width';
    widthDim.textContent = `${width}px`;
    frame.appendChild(widthDim);

    // 高度标注
    const heightDim = document.createElement('div');
    heightDim.className = 'device-dimensions height';
    heightDim.textContent = `${height}px`;
    frame.appendChild(heightDim);

    // 物理尺寸标注
    if (physicalSize) {
        const scale = document.createElement('div');
        scale.className = 'device-scale';
        scale.textContent = `Physical: ${physicalSize}`;
        frame.appendChild(scale);
    }
}

/**
 * Update display with custom size
 * @param {number} width - Custom width
 * @param {number} height - Custom height
 */
function updateCustomDisplay(width, height) {
    const display = document.getElementById('device2-display');
    const viewport = display.querySelector('#device2-viewport');
    const resolution = display.querySelector('#device2-resolution');
    const dpr = display.querySelector('#device2-dpr');
    const physicalSize = display.querySelector('#device2-physical-size');
    const screenType = display.querySelector('#device2-screen-type');
    const pixelDensity = display.querySelector('#device2-pixel-density');
    const screen = display.querySelector('.device-screen');

    if (viewport) viewport.textContent = `${width} x ${height}`;
    if (resolution) resolution.textContent = `${width} x ${height}`;
    if (dpr) dpr.textContent = '1.0';
    if (physicalSize) physicalSize.textContent = 'Custom Size';
    if (screenType) screenType.textContent = 'Custom';
    if (pixelDensity) pixelDensity.textContent = 'Custom';

    if (screen) {
        const scale = calculateScale(width, height);
        screen.style.width = `${width}px`;
        screen.style.height = `${height}px`;
        screen.style.transform = `scale(${scale})`;
        updateDeviceDimensions(display, width, height, 'Custom Size');
    }
}

/**
 * Calculate appropriate scale for device display
 * @param {number} width - Device width
 * @param {number} height - Device height
 * @returns {number} Scale factor
 */
function calculateScale(width, height) {
    const containerWidth = 280; // 最大显示宽度
    const containerHeight = 380; // 最大显示高度
    
    // 计算宽度和高度的缩放比例
    const widthScale = containerWidth / width;
    const heightScale = containerHeight / height;
    
    // 使用较小的缩放比例以确保完整显示
    const scale = Math.min(widthScale, heightScale);
    
    // 限制最小和最大缩放值
    return Math.min(Math.max(scale, 0.1), 1.0);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDeviceComparison); 