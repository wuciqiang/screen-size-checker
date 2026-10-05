const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const products = JSON.parse(read('data/affiliate-products.json'));
const manualAds = JSON.parse(read('data/manual-ad-slots.json'));
const analyticsSource = read('js/analytics.js');
const manualAdConfig = require('../build/manual-ad-config');
const affiliateSource = read('components/affiliate-product-recommendations.html');

assert.strictEqual(products.marketplace, 'amazon.com');
assert.strictEqual(products.affiliateTag, 'screensizechecker-20');
assert.match(products.affiliateTag, /^[a-z0-9-]+$/);
assert.deepStrictEqual(products.contexts.compare, products.contexts['best-monitor-size-fps']);
assert.strictEqual(products.contexts.compare.length, 3);

for (const product of Object.values(products.products)) {
    assert.strictEqual(product.enabled, true);
    assert.match(product.asin, /^B[A-Z0-9]{9}$/);
    assert.strictEqual(new URL(product.affiliateUrl).searchParams.get('tag'), products.affiliateTag);
    assert.ok(product.model && product.specs.length && product.bestFor && product.reason && product.limitation);
    assert.strictEqual(product.image, null, `${product.id} must remain text-only until image rights are verified`);
}

const compareSource = read('components/compare-content.html');
const fpsSource = read('hub-content/best-monitor-size-fps.md');
assert.ok(compareSource.includes('data-affiliate-product-component="compare"'));
assert.ok(fpsSource.includes('data-affiliate-product-component="best-monitor-size-fps"'));
assert.ok(compareSource.includes('data-manual-ad-position="compare_results_after"'));
assert.ok(fpsSource.includes('data-manual-ad-position="best_monitor_size_fps_after_guidance"'));
assert.ok(affiliateSource.includes('tag={{affiliate_tag}}'));
assert.strictEqual((affiliateSource.match(/data-affiliate-marketplace="amazon\.com"/g) || []).length, 2);

const compareOutput = read('multilang-build/devices/compare.html');
const fpsOutput = read('multilang-build/hub/best-monitor-size-fps.html');
const zhCompareOutput = read('multilang-build/zh/devices/compare.html');
const zhFpsOutput = read('multilang-build/zh/hub/best-monitor-size-fps.html');
for (const [output, slot] of [
    [compareOutput, manualAds.slots.compare_results_after],
    [fpsOutput, manualAds.slots.best_monitor_size_fps_after_guidance]
]) {
    assert.strictEqual((output.match(/data-affiliate-product-id=/g) || []).length, 3);
    assert.strictEqual((output.match(/data-affiliate-link-id="amazon_product_/g) || []).length, 3);
    assert.ok(!output.includes('data-ad-slot=""')); // empty slots use data-manual-ad-slot, never a fake ad request
    assert.match(slot, /^[1-9]\d*$/);
    assert.ok(output.includes(`data-manual-ad-slot="${slot}"`));
    assert.match(output, /data-ad-client="ca-pub-9212629010224868"/);
    assert.strictEqual((output.match(/data-affiliate-marketplace="amazon\.com"/g) || []).length, 5);
    assert.ok(output.includes('?tag=screensizechecker-20'));
    assert.ok(!output.includes('qianshuixia-20'));
    assert.ok(!output.includes('aggregateRating'));
    assert.ok(!output.includes('itemprop="review"'));
    assert.ok(!output.includes('itemprop="offers"'));
    assert.ok(!output.includes('class="affiliate-product-image"'));
}
assert.strictEqual((zhCompareOutput.match(/data-affiliate-product-id=/g) || []).length, 0);
assert.strictEqual((zhFpsOutput.match(/data-affiliate-product-id=/g) || []).length, 0);
assert.strictEqual(manualAdConfig.getSlot('compare_results_after'), manualAds.slots.compare_results_after);
assert.strictEqual(manualAdConfig.getSlot('best_monitor_size_fps_after_guidance'), manualAds.slots.best_monitor_size_fps_after_guidance);
assert.strictEqual(manualAdConfig.getClient(), manualAds.client);
assert.ok(manualAdConfig.SLOT_ID_PATTERN.test('123456'));
assert.ok(!manualAdConfig.SLOT_ID_PATTERN.test('123 456'));
assert.ok(manualAdConfig.CLIENT_ID_PATTERN.test(manualAds.client));

const manualAdsSource = read('js/manual-ads.js');
assert.ok(manualAdsSource.includes('canUseAdvertising'));
assert.ok(manualAdsSource.includes('isValidSlotId'));
assert.ok(manualAdsSource.includes('isValidClientId'));
assert.ok(manualAdsSource.includes("window.adsbygoogle.push({})"));
assert.ok(manualAdsSource.includes("data-manual-ad-initialized"));
assert.ok(manualAdsSource.includes("document.createElement('ins')"));
assert.ok(analyticsSource.includes("product_id: link.getAttribute('data-affiliate-product')"));
assert.ok(analyticsSource.includes("marketplace: link.getAttribute('data-affiliate-marketplace')"));

console.log('Affiliate product, language scope, disclosure, and configured manual-ad slot contracts passed.');
