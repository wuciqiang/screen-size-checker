// Device comparison functionality

/**
 * Device data mapping
 */
const deviceData = {
    // 最新iPhone机型 (iPhone 15系列)
    'iphone-15-pro-max': { viewport: '430 x 932', resolution: '1290 x 2796', dpr: 3.0 },
    'iphone-15-pro': { viewport: '393 x 852', resolution: '1179 x 2556', dpr: 3.0 },
    'iphone-15-plus': { viewport: '430 x 932', resolution: '1284 x 2778', dpr: 3.0 },
    'iphone-15': { viewport: '393 x 852', resolution: '1179 x 2556', dpr: 3.0 },

    // iPhone 14系列
    'iphone-14-pro-max': { viewport: '430 x 932', resolution: '1290 x 2796', dpr: 3.0 },
    'iphone-14-pro': { viewport: '393 x 852', resolution: '1179 x 2556', dpr: 3.0 },
    'iphone-14-plus': { viewport: '428 x 926', resolution: '1284 x 2778', dpr: 3.0 },
    'iphone-14': { viewport: '390 x 844', resolution: '1170 x 2532', dpr: 3.0 },

    // iPhone 13系列
    'iphone-13-pro-max': { viewport: '428 x 926', resolution: '1284 x 2778', dpr: 3.0 },
    'iphone-13-pro': { viewport: '390 x 844', resolution: '1170 x 2532', dpr: 3.0 },
    'iphone-13': { viewport: '390 x 844', resolution: '1170 x 2532', dpr: 3.0 },
    'iphone-13-mini': { viewport: '375 x 812', resolution: '1125 x 2436', dpr: 3.0 },

    // iPhone 12系列
    'iphone-12-pro-max': { viewport: '428 x 926', resolution: '1284 x 2778', dpr: 3.0 },
    'iphone-12-pro': { viewport: '390 x 844', resolution: '1170 x 2532', dpr: 3.0 },
    'iphone-12': { viewport: '390 x 844', resolution: '1170 x 2532', dpr: 3.0 },
    'iphone-12-mini': { viewport: '375 x 812', resolution: '1125 x 2436', dpr: 3.0 },

    // iPhone 11系列
    'iphone-11-pro-max': { viewport: '414 x 896', resolution: '1242 x 2688', dpr: 3.0 },
    'iphone-11-pro': { viewport: '375 x 812', resolution: '1125 x 2436', dpr: 3.0 },
    'iphone-11': { viewport: '414 x 896', resolution: '828 x 1792', dpr: 2.0 },

    // iPhone X/XS/XR系列
    'iphone-xs-max': { viewport: '414 x 896', resolution: '1242 x 2688', dpr: 3.0 },
    'iphone-xs': { viewport: '375 x 812', resolution: '1125 x 2436', dpr: 3.0 },
    'iphone-xr': { viewport: '414 x 896', resolution: '828 x 1792', dpr: 2.0 },
    'iphone-x': { viewport: '375 x 812', resolution: '1125 x 2436', dpr: 3.0 },

    // iPhone 8系列及更早
    'iphone-8-plus': { viewport: '414 x 736', resolution: '1080 x 1920', dpr: 3.0 },
    'iphone-8': { viewport: '375 x 667', resolution: '750 x 1334', dpr: 2.0 },
    'iphone-7-plus': { viewport: '414 x 736', resolution: '1080 x 1920', dpr: 3.0 },
    'iphone-7': { viewport: '375 x 667', resolution: '750 x 1334', dpr: 2.0 },
    'iphone-6s-plus': { viewport: '414 x 736', resolution: '1080 x 1920', dpr: 3.0 },
    'iphone-6s': { viewport: '375 x 667', resolution: '750 x 1334', dpr: 2.0 },
    'iphone-6-plus': { viewport: '414 x 736', resolution: '1080 x 1920', dpr: 3.0 },
    'iphone-6': { viewport: '375 x 667', resolution: '750 x 1334', dpr: 2.0 },
    
    // iPad models
    'ipad-pro-12.9': { viewport: '1024 x 1366', resolution: '2048 x 2732', dpr: 2.0 },
    'ipad-pro-11': { viewport: '834 x 1194', resolution: '1668 x 2388', dpr: 2.0 },
    'ipad-air': { viewport: '820 x 1180', resolution: '1640 x 2360', dpr: 2.0 },
    'ipad-mini': { viewport: '768 x 1024', resolution: '1536 x 2048', dpr: 2.0 },
    
    // Android models
    'samsung-s23-ultra': { viewport: '412 x 878', resolution: '1440 x 3088', dpr: 3.5 },
    'samsung-s23-plus': { viewport: '393 x 851', resolution: '1080 x 2340', dpr: 2.75 },
    'samsung-s23': { viewport: '360 x 780', resolution: '1080 x 2340', dpr: 3.0 },
    'pixel-7-pro': { viewport: '412 x 892', resolution: '1440 x 3120', dpr: 3.5 },
    'pixel-7': { viewport: '393 x 851', resolution: '1080 x 2400', dpr: 2.75 },
    'oneplus-11': { viewport: '412 x 892', resolution: '1440 x 3216', dpr: 3.5 },

    // iPhone 16系列
    'iphone-16-pro-max': { viewport: '440 x 956', resolution: '1320 x 2868', dpr: 3.0 },
    'iphone-16-pro': { viewport: '402 x 874', resolution: '1206 x 2622', dpr: 3.0 },
    'iphone-16-plus': { viewport: '428 x 926', resolution: '1284 x 2778', dpr: 3.0 },
    'iphone-16': { viewport: '393 x 852', resolution: '1179 x 2556', dpr: 3.0 },
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

    // Initial update
    updateDeviceDisplay();
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
    const display = document.getElementById(`${deviceId}-display`);
    if (!select || !display) return;

    const selectedDevice = select.value;
    const data = deviceData[selectedDevice];
    if (!data) return;

    // 更新信息显示
    const viewport = display.querySelector(`#${deviceId}-viewport`);
    const resolution = display.querySelector(`#${deviceId}-resolution`);
    const dpr = display.querySelector(`#${deviceId}-dpr`);

    if (viewport) viewport.textContent = data.viewport;
    if (resolution) resolution.textContent = data.resolution;
    if (dpr) dpr.textContent = data.dpr.toFixed(1);

    // 更新设备屏幕可视化
    const screen = display.querySelector('.device-screen');
    if (screen) {
        const [width, height] = data.viewport.split(' x ').map(Number);
        const scale = calculateScale(width, height);
        
        // 设置实际尺寸
        screen.style.width = `${width}px`;
        screen.style.height = `${height}px`;
        
        // 应用缩放和居中
        screen.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
}

/**
 * Update display with custom size
 * @param {number} width - Custom width
 * @param {number} height - Custom height
 */
function updateCustomDisplay(width, height) {
    const device2Display = document.getElementById('device2-display');
    if (!device2Display) return;

    const viewport = device2Display.querySelector('#device2-viewport');
    const resolution = device2Display.querySelector('#device2-resolution');
    const dpr = device2Display.querySelector('#device2-dpr');
    const screen = device2Display.querySelector('.device-screen');

    if (viewport) viewport.textContent = `${width} x ${height}`;
    if (resolution) resolution.textContent = `${width} x ${height}`;
    if (dpr) dpr.textContent = '1.0';

    if (screen) {
        const scale = calculateScale(width, height);
        screen.style.width = `${width * scale}px`;
        screen.style.height = `${height * scale}px`;
        screen.style.transform = `translate(-50%, -50%) scale(${scale})`;
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