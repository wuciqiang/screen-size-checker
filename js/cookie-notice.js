// Compatibility adapter for the shared consent runtime.
export function initCookieNotice() {
    return window.ScreenSizeConsent || null;
}

export function showCookieSettings() {
    if (!window.ScreenSizeConsent) {
        return false;
    }
    return window.ScreenSizeConsent.openPrivacyChoices();
}
