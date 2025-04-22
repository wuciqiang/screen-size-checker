// Device data
const deviceData = {
    // iPhone
    'iphone-14-pro-max': {
        name: 'iPhone 14 Pro Max',
        viewport: { width: 430, height: 932 },
        resolution: { width: 1290, height: 2796 },
        dpr: 3.0
    },
    'iphone-14-pro': {
        name: 'iPhone 14 Pro',
        viewport: { width: 393, height: 852 },
        resolution: { width: 1179, height: 2556 },
        dpr: 3.0
    },
    'iphone-14': {
        name: 'iPhone 14',
        viewport: { width: 390, height: 844 },
        resolution: { width: 1170, height: 2532 },
        dpr: 3.0
    },
    'iphone-13-pro-max': {
        name: 'iPhone 13 Pro Max',
        viewport: { width: 428, height: 926 },
        resolution: { width: 1284, height: 2778 },
        dpr: 3.0
    },
    'iphone-13-pro': {
        name: 'iPhone 13 Pro',
        viewport: { width: 390, height: 844 },
        resolution: { width: 1170, height: 2532 },
        dpr: 3.0
    },
    'iphone-13': {
        name: 'iPhone 13',
        viewport: { width: 390, height: 844 },
        resolution: { width: 1170, height: 2532 },
        dpr: 3.0
    },
    'iphone-13-mini': {
        name: 'iPhone 13 mini',
        viewport: { width: 375, height: 812 },
        resolution: { width: 1125, height: 2436 },
        dpr: 3.0
    },
    
    // iPad
    'ipad-pro-12.9': {
        name: 'iPad Pro 12.9"',
        viewport: { width: 1024, height: 1366 },
        resolution: { width: 2048, height: 2732 },
        dpr: 2.0
    },
    'ipad-pro-11': {
        name: 'iPad Pro 11"',
        viewport: { width: 834, height: 1194 },
        resolution: { width: 1668, height: 2388 },
        dpr: 2.0
    },
    'ipad-air': {
        name: 'iPad Air',
        viewport: { width: 820, height: 1180 },
        resolution: { width: 1640, height: 2360 },
        dpr: 2.0
    },
    'ipad-mini': {
        name: 'iPad Mini',
        viewport: { width: 768, height: 1024 },
        resolution: { width: 1536, height: 2048 },
        dpr: 2.0
    },
    
    // Android
    'samsung-s23-ultra': {
        name: 'Samsung Galaxy S23 Ultra',
        viewport: { width: 412, height: 878 },
        resolution: { width: 1440, height: 3088 },
        dpr: 3.5
    },
    'samsung-s23-plus': {
        name: 'Samsung Galaxy S23+',
        viewport: { width: 393, height: 851 },
        resolution: { width: 1080, height: 2340 },
        dpr: 2.75
    },
    'samsung-s23': {
        name: 'Samsung Galaxy S23',
        viewport: { width: 360, height: 780 },
        resolution: { width: 1080, height: 2340 },
        dpr: 3.0
    },
    'pixel-7-pro': {
        name: 'Google Pixel 7 Pro',
        viewport: { width: 412, height: 892 },
        resolution: { width: 1440, height: 3120 },
        dpr: 3.5
    },
    'pixel-7': {
        name: 'Google Pixel 7',
        viewport: { width: 393, height: 851 },
        resolution: { width: 1080, height: 2400 },
        dpr: 2.75
    },
    'oneplus-11': {
        name: 'OnePlus 11',
        viewport: { width: 412, height: 892 },
        resolution: { width: 1440, height: 3216 },
        dpr: 3.5
    }
};

// Initialize the comparison tool
document.addEventListener('DOMContentLoaded', () => {
    const device1Select = document.getElementById('device1-select');
    const device2Select = document.getElementById('device2-select');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');
    const applyCustomSizeBtn = document.getElementById('apply-custom-size');
    
    // Event listeners for device selection
    device1Select.addEventListener('change', () => updateDeviceDisplay(1, device1Select.value));
    device2Select.addEventListener('change', () => updateDeviceDisplay(2, device2Select.value));
    
    // Event listener for custom size
    applyCustomSizeBtn.addEventListener('click', () => {
        const width = parseInt(customWidthInput.value);
        const height = parseInt(customHeightInput.value);
        
        if (width && height) {
            updateCustomDisplay(1, width, height);
        }
    });
});

// Update device display
function updateDeviceDisplay(deviceNumber, deviceId) {
    const device = deviceData[deviceId];
    if (!device) return;
    
    const display = document.getElementById(`device${deviceNumber}-display`);
    const screen = display.querySelector('.device-screen');
    const viewportSpan = document.getElementById(`device${deviceNumber}-viewport`);
    const resolutionSpan = document.getElementById(`device${deviceNumber}-resolution`);
    const dprSpan = document.getElementById(`device${deviceNumber}-dpr`);
    
    // Update screen size
    screen.style.width = `${device.viewport.width}px`;
    screen.style.height = `${device.viewport.height}px`;
    
    // Update information
    viewportSpan.textContent = `${device.viewport.width} × ${device.viewport.height}`;
    resolutionSpan.textContent = `${device.resolution.width} × ${device.resolution.height}`;
    dprSpan.textContent = device.dpr;
    
    // Update device name
    display.querySelector('h4').textContent = device.name;
}

// Update custom size display
function updateCustomDisplay(deviceNumber, width, height) {
    const display = document.getElementById(`device${deviceNumber}-display`);
    const screen = display.querySelector('.device-screen');
    const viewportSpan = document.getElementById(`device${deviceNumber}-viewport`);
    const resolutionSpan = document.getElementById(`device${deviceNumber}-resolution`);
    const dprSpan = document.getElementById(`device${deviceNumber}-dpr`);
    
    // Update screen size
    screen.style.width = `${width}px`;
    screen.style.height = `${height}px`;
    
    // Update information
    viewportSpan.textContent = `${width} × ${height}`;
    resolutionSpan.textContent = '---';
    dprSpan.textContent = '---';
    
    // Update device name
    display.querySelector('h4').textContent = 'Custom Size';
} 