function replaceLanguagePrefixTokens(value, lang) {
    const langPrefix = lang === 'en' ? '' : `/${lang}`;
    return String(value || '')
        .replace(/\{\{lang_prefix\}\}/g, langPrefix)
        .replace(/%7B%7Blang_prefix%7D%7D/gi, langPrefix);
}

function normalizeInternalHref(href, lang) {
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href)) {
        return href;
    }

    const tokenNormalizedHref = replaceLanguagePrefixTokens(href, lang);
    const sameSiteMatch = tokenNormalizedHref.match(/^(https?:\/\/screensizechecker\.com)(\/[^?#]*)?([?#].*)?$/i);
    if (/^[a-z][a-z0-9+.-]*:/i.test(tokenNormalizedHref) && !sameSiteMatch) {
        return tokenNormalizedHref;
    }

    let origin = '';
    let rawPath = tokenNormalizedHref;
    let suffix = '';

    if (sameSiteMatch) {
        origin = sameSiteMatch[1];
        rawPath = sameSiteMatch[2] || '/';
        suffix = sameSiteMatch[3] || '';
    } else {
        const parts = tokenNormalizedHref.match(/^([^?#]*)([?#].*)?$/);
        if (!parts) {
            return tokenNormalizedHref;
        }
        rawPath = parts[1];
        suffix = parts[2] || '';
    }

    if (!rawPath) {
        return `${origin}${rawPath}${suffix}`;
    }

    const isRootRelative = rawPath.startsWith('/');
    let normalizedPath = rawPath;

    if (isRootRelative) {
        if (normalizedPath === '/en' || normalizedPath === '/en/') {
            normalizedPath = '/';
        } else {
            normalizedPath = normalizedPath.replace(/^\/en(?=\/|$)/, '') || '/';
        }

        if (normalizedPath === '/index.html') {
            normalizedPath = '/';
        } else if (normalizedPath.endsWith('/index.html')) {
            normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
        } else {
            normalizedPath = normalizedPath.replace(/\.html$/i, '');
        }
    } else {
        let relativePrefix = '';
        while (normalizedPath.startsWith('../')) {
            relativePrefix += '../';
            normalizedPath = normalizedPath.slice(3);
        }
        if (normalizedPath.startsWith('./')) {
            relativePrefix += './';
            normalizedPath = normalizedPath.slice(2);
        }

        if (normalizedPath === 'en' || normalizedPath === 'en/') {
            normalizedPath = '';
        } else if (normalizedPath.startsWith('en/')) {
            normalizedPath = normalizedPath.slice(3);
        }

        if (normalizedPath === 'index.html') {
            normalizedPath = '';
        } else if (normalizedPath.endsWith('/index.html')) {
            normalizedPath = normalizedPath.replace(/\/index\.html$/i, '/');
        } else {
            normalizedPath = normalizedPath.replace(/\.html$/i, '');
        }

        normalizedPath = normalizedPath ? relativePrefix + normalizedPath : relativePrefix || './';
    }

    return `${origin}${normalizedPath}${suffix}`;
}

function normalizeGeneratedHtmlLinks(html, lang) {
    const tokenNormalizedHtml = replaceLanguagePrefixTokens(html, lang);
    return tokenNormalizedHtml.replace(/\bhref=(["'])(.*?)\1/gi, (match, quote, href) => {
        return `href=${quote}${normalizeInternalHref(href, lang)}${quote}`;
    });
}

module.exports = {
    normalizeGeneratedHtmlLinks,
    normalizeInternalHref,
    replaceLanguagePrefixTokens
};
