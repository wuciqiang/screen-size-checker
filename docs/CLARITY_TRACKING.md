# Microsoft Clarity Tracking

## 2026-07-06

- Site: `screensizechecker.com`
- Clarity Project ID: `xi2qv9v3dh`
- Implementation file: `components/head.html`
- Legal static pages: `privacy-policy.html`, `terms-of-service.html`
- Consent bridge: `js/cookie-notice.js`
- Privacy policy updated: `privacy-policy.html`

## Behavior

- Clarity only loads on the production host `screensizechecker.com`.
- Clarity is initialized with Consent API v2 default denied state.
- When analytics cookies are accepted, the site dispatches `cookieConsentChanged` and updates Clarity analytics storage to `granted`.
- Clarity ad storage remains `denied`.
- Static legal pages already had their own GA snippet, so they also include the production-only Clarity loader with default denied consent.

## Follow-Up Review

Use Clarity with GA4, GSC, AdSense, and Amazon affiliate data in the next full review.

Primary Clarity checks:

- Session count and recording availability.
- Dead clicks and rage clicks.
- Scroll depth on `/devices/compare`, `/devices/standard-resolutions`, and `/hub/best-monitor-size-fps`.
- Whether affiliate modules are seen and clicked.
- Whether ads or cookie notices interrupt the first useful action.
