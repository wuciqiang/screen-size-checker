// cookie-notice.js - Cookie consent management

/**
 * Initialize cookie notice
 */
export function initCookieNotice() {
    console.log('Initializing cookie notice...');
    if (!localStorage.getItem('cookieConsent')) {
        console.log('No cookie consent found, showing notice...');
        showCookieNotice();
    } else {
        console.log('Cookie consent already exists');
    }
}

/**
 * Show cookie notice
 */
function showCookieNotice() {
    console.log('Creating cookie notice element...');
    const notice = document.createElement('div');
    notice.className = 'cookie-notice';
    notice.innerHTML = `
        <div class="cookie-notice-content">
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
            <div class="cookie-notice-buttons">
                <button class="cookie-accept-btn">Accept</button>
                <button class="cookie-settings-btn">Settings</button>
            </div>
        </div>
    `;

    document.body.appendChild(notice);
    console.log('Cookie notice added to DOM');

    // Add event listeners
    notice.querySelector('.cookie-accept-btn').addEventListener('click', () => {
        console.log('Accept button clicked');
        acceptCookies();
        notice.remove();
    });

    notice.querySelector('.cookie-settings-btn').addEventListener('click', () => {
        console.log('Settings button clicked');
        showCookieSettings();
    });
}

/**
 * Accept cookies
 */
function acceptCookies() {
    console.log('Accepting cookies...');
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
        necessary: true,
        analytics: true,
        preferences: true
    }));
    console.log('Cookie preferences saved');
}

/**
 * Show cookie settings
 */
export function showCookieSettings() {
    console.log('Showing cookie settings...');
    
    // 获取已保存的Cookie偏好设置
    let savedPreferences = {
        necessary: true,
        analytics: true,
        preferences: true
    };
    
    try {
        const savedPrefs = localStorage.getItem('cookiePreferences');
        if (savedPrefs) {
            savedPreferences = JSON.parse(savedPrefs);
            console.log('Loaded saved preferences:', savedPreferences);
        }
    } catch (error) {
        console.error('Error loading saved preferences:', error);
    }
    
    const settings = document.createElement('div');
    settings.className = 'cookie-settings';
    settings.innerHTML = `
        <div class="cookie-settings-content">
            <h3>Cookie Settings</h3>
            <div class="cookie-setting-item">
                <label>
                    <input type="checkbox" checked disabled>
                    Necessary Cookies
                </label>
                <p>Required for the website to function properly.</p>
            </div>
            <div class="cookie-setting-item">
                <label>
                    <input type="checkbox" id="analytics-cookies" ${savedPreferences.analytics ? 'checked' : ''}>
                    Analytics Cookies
                </label>
                <p>Help us understand how visitors interact with our website.</p>
            </div>
            <div class="cookie-setting-item">
                <label>
                    <input type="checkbox" id="preferences-cookies" ${savedPreferences.preferences ? 'checked' : ''}>
                    Preference Cookies
                </label>
                <p>Remember your settings and preferences.</p>
            </div>
            <div class="cookie-settings-buttons">
                <button class="save-preferences-btn">Save Preferences</button>
                <button class="accept-all-btn">Accept All</button>
            </div>
        </div>
    `;

    document.body.appendChild(settings);
    console.log('Cookie settings added to DOM');

    // Add event listeners
    settings.querySelector('.save-preferences-btn').addEventListener('click', () => {
        console.log('Save preferences clicked');
        saveCookiePreferences(settings);
        settings.remove();
    });

    settings.querySelector('.accept-all-btn').addEventListener('click', () => {
        console.log('Accept all clicked');
        // 设置所有选项为选中状态
        settings.querySelector('#analytics-cookies').checked = true;
        settings.querySelector('#preferences-cookies').checked = true;
        // 保存并关闭设置
        acceptCookies();
        settings.remove();
    });
}

/**
 * Save cookie preferences
 */
function saveCookiePreferences(settings) {
    console.log('Saving cookie preferences...');
    const analytics = settings.querySelector('#analytics-cookies').checked;
    const preferences = settings.querySelector('#preferences-cookies').checked;
    
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
        necessary: true,
        analytics: analytics,
        preferences: preferences
    }));
    console.log('Cookie preferences saved:', { analytics, preferences });
} 