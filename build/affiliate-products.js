const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'affiliate-products.json'), 'utf8'));

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderProductCard(product) {
    const specs = product.specs.map(spec => `<li>${escapeHtml(spec)}</li>`).join('');
    return `<article class="affiliate-product-card" data-affiliate-product-id="${escapeHtml(product.id)}">
    <div class="affiliate-product-card-body">
        <h4>${escapeHtml(product.model)}</h4>
        <ul class="affiliate-product-specs">${specs}</ul>
        <p><strong>Best for:</strong> ${escapeHtml(product.bestFor)}</p>
        <p><strong>Why it is included:</strong> ${escapeHtml(product.reason)}</p>
        <p class="affiliate-product-limitation"><strong>One limitation:</strong> ${escapeHtml(product.limitation)}</p>
    </div>
    <a class="affiliate-product-cta" href="${escapeHtml(product.affiliateUrl)}" target="_blank" rel="sponsored nofollow noopener" data-affiliate-link data-affiliate-link-id="amazon_product_${escapeHtml(product.id)}" data-affiliate-program="amazon" data-affiliate-action="amazon_product_${escapeHtml(product.id)}" data-affiliate-product="${escapeHtml(product.id)}" data-affiliate-marketplace="${escapeHtml(product.marketplace)}">View on Amazon</a>
</article>`;
}

function renderAffiliateProducts(context) {
    const ids = config.contexts[context] || [];
    const products = ids.map(id => config.products[id]).filter(product => product && product.enabled);
    return products.map(renderProductCard).join('\n');
}

function getConfig() {
    return config;
}

module.exports = { getConfig, renderAffiliateProducts };
