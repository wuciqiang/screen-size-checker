#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const out = path.join(root, 'multilang-build');
const temp = path.join(root, 'test-build', 'pure-color-equivalence');
const config = JSON.parse(fs.readFileSync(path.join(root, 'build/pages-config.json'), 'utf8'));
const langs = ['en', 'zh', 'de', 'es', 'pt', 'fr'];
const colors = [
    ['white-screen', '#FFFFFF', 'rgb(255, 255, 255)'], ['black-screen', '#000000', 'rgb(0, 0, 0)'],
    ['red-screen', '#FF0000', 'rgb(255, 0, 0)'], ['green-screen', '#00FF00', 'rgb(0, 255, 0)'],
    ['blue-screen', '#0000FF', 'rgb(0, 0, 255)'], ['yellow-screen', '#FFFF00', 'rgb(255, 255, 0)'],
    ['orange-screen', '#FFA500', 'rgb(255, 165, 0)'], ['purple-screen', '#800080', 'rgb(128, 0, 128)'],
    ['pink-screen', '#FFC0CB', 'rgb(255, 192, 203)'], ['gray-screen', '#808080', 'rgb(128, 128, 128)']
];
const breadcrumbUi = {
    en: { home: 'Home', tools: 'Tools' },
    zh: { home: '首页', tools: '工具' },
    de: { home: 'Startseite', tools: 'Werkzeuge' },
    es: { home: 'Inicio', tools: 'Herramientas' },
    pt: { home: 'Início', tools: 'Ferramentas' },
    fr: { home: 'Accueil', tools: 'Outils' }
};
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const attr = (html, name) => {
    const match = html.match(new RegExp(`${name}="([^"]*)"`));
    assert.ok(match, `missing ${name}`);
    return match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
};
const text = html => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const articleText = html => text((html.match(/<article class="pure-color-tool"[\s\S]*?<\/article>/) || [''])[0]);
const proseFields = data => [data.description, data.intent_note, data.color_intro, data.technical, ...data.sections.map(item => item.text), ...data.faqs.map(item => item.a)];
const splitSentences = value => value.replace(/\b(?:e\.g|i\.e|RGB|CSS|sRGB|BSOD)\./gi, match => match.replace('.', '<DOT>')).split(/[.!?。！？]+/).map(item => item.replace(/<DOT>/g, '.').trim()).filter(Boolean);
const countWords = value => value.trim().split(/\s+/).filter(Boolean).length;
const schemaNodes = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1])).flatMap(item => item['@graph'] || [item]);
const outputPath = (lang, slug) => path.join(out, lang === 'en' ? `${slug}.html` : path.join(lang, `${slug}.html`));

assert.deepStrictEqual(langs, ['en', 'zh', 'de', 'es', 'pt', 'fr']);
const purePages = config.pages.filter(page => page.template === 'color-page');
assert.strictEqual(purePages.length, 10);
for (const [slug, hex, rgb] of colors) {
    const page = purePages.find(item => item.name === slug);
    assert.ok(page, `missing ${slug}`);
    assert.deepStrictEqual(page.enabled_languages, langs);
    assert.strictEqual(page.config.hex, hex);
    assert.strictEqual(page.config.rgb, rgb);
    assert.strictEqual(page.config.sections.length, 3);
    assert.strictEqual(page.config.faqs.length, 3);
    for (const lang of langs.slice(1)) {
        const overlay = page.config.locales[lang];
        assert.ok(overlay, `${slug} missing ${lang}`);
        for (const key of ['page_title', 'og_title', 'og_description', 'description', 'page_keywords', 'page_heading', 'color_name', 'intent_note', 'color_intro', 'technical', 'how_to_title']) assert.ok(overlay[key]);
        assert.strictEqual(overlay.sections.length, 3);
        assert.strictEqual(overlay.faqs.length, 3);
    }
}

for (const lang of langs) {
    const arrays = purePages.map(item => {
        const data = lang === 'en' ? item.config : item.config.locales[lang];
        return data.faqs.map(faq => `${faq.q}|${faq.a}`).join('\n');
    });
    assert.strictEqual(new Set(arrays).size, 10, `${lang} all color FAQ arrays must be unique`);
}
const orangeMarkers = {
    en: [/CSS orange color tool/i, /not an operating-system error screen/i],
    zh: [/标准 CSS 橙色工具/, /不是操作系统错误屏幕/],
    de: [/CSS-Orange-Farbwerkzeug/i, /kein Betriebssystem-Fehlerbild/i],
    es: [/herramienta de color naranja CSS/i, /no es una pantalla de error del sistema/i],
    pt: [/ferramenta de cor laranja CSS/i, /não é uma tela de erro do sistema/i],
    fr: [/outil de couleur orange CSS/i, /pas d’un écran d’erreur système/i]
};
const grayMarkers = {
    en: [/not a physical paint swatch/i, /not a calibrated 18% photographic gray card/i],
    zh: [/不是实体油漆色卡/, /不是校准的 18% 摄影灰卡/],
    de: [/kein physisches Farbfeld/i, /keine kalibrierte 18%-Graukarte/i],
    es: [/no es una muestra de pintura física/i, /ni una tarjeta gris fotográfica calibrada del 18\s*%/i],
    pt: [/não é uma amostra de tinta física/i, /nem um cartão cinza fotográfico calibrado de 18\s*%/i],
    fr: [/pas un nuancier de peinture physique/i, /ni une charte grise photo calibrée à 18\s*%/i]
};
for (const lang of langs) {
    const orange = purePages.find(item => item.name === 'orange-screen').config;
    const gray = purePages.find(item => item.name === 'gray-screen').config;
    for (const marker of orangeMarkers[lang]) assert.match((lang === 'en' ? orange : orange.locales[lang]).intent_note, marker);
    for (const marker of grayMarkers[lang]) assert.match((lang === 'en' ? gray : gray.locales[lang]).intent_note, marker);
}
for (const page of purePages) for (const lang of langs) {
    const data = lang === 'en' ? page.config : page.config.locales[lang];
    if (lang !== 'zh') {
        assert.ok(data.description.length <= 160 && data.og_description.length <= 160, `${lang}/${page.name} descriptions exceed 160 characters`);
    }
    if (lang === 'pt') assert.ok(!/tela\s+\p{L}+\s+cheia/iu.test(data.page_keywords));
    if (lang === 'en') assert.match(data.how_to_title, /this\s+[a-z]+\s+screen$/);
    for (const sentence of proseFields(data)) for (const part of splitSentences(sentence)) {
        const limit = lang === 'en' ? 24 : lang === 'zh' ? 45 : 28;
        assert.ok(lang === 'zh' ? part.replace(/[^\p{Script=Han}\p{L}\p{N}]/gu, '').length <= limit : countWords(part) <= limit, `${lang}/${page.name} sentence exceeds budget: ${part}`);
    }
}
const esBlack = purePages.find(page => page.name === 'black-screen').config.locales.es;
assert.ok(esBlack.technical.includes('pero el resultado depende del panel'));
const esWhite = purePages.find(page => page.name === 'white-screen').config.locales.es;
assert.ok(esWhite.technical.includes('#FFFFFF') && esWhite.technical.includes('rgb(255, 255, 255)'));
const ptGreen = purePages.find(page => page.name === 'green-screen').config.locales.pt;
assert.ok(ptGreen.sections[0].text.includes('Afaste o objeto') && !ptGreen.sections[0].text.includes('Afaste o assunto'));
const ptYellow = purePages.find(page => page.name === 'yellow-screen').config.locales.pt;
assert.ok(ptYellow.sections[2].text.includes('tempo de visualização') && !ptYellow.sections[2].text.includes('tempo de exposição'));

const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', timeout: 180000 });
if (build.status !== 0) throw new Error((build.stderr || build.stdout || 'build failed').split(/\r?\n/).slice(-30).join('\n'));

for (const lang of langs) for (const [slug, hex, rgb] of colors) {
    const page = purePages.find(item => item.name === slug);
    const data = lang === 'en' ? page.config : page.config.locales[lang];
    const canonical = `https://screensizechecker.com/${lang === 'en' ? '' : `${lang}/`}${slug}`;
    const html = fs.readFileSync(outputPath(lang, slug), 'utf8');
    assert.ok(!html.includes('{{'), `${lang}/${slug} has unresolved template`);
    if (lang !== 'en') assert.ok(!/screen checks|creative backgrounds/i.test(articleText(html)), `${lang}/${slug} has contamination marker`);
    if (lang === 'zh') assert.ok(!/\b(weiß|schwarz|rot|grün|blau|gelb|lila|rosa|grau)\b/i.test(articleText(html)), `${lang}/${slug} has German prose`);
    if (['de', 'es', 'pt', 'fr'].includes(lang)) assert.ok(!/[\u3400-\u9fff]/.test(articleText(html)), `${lang}/${slug} has CJK prose`);
    assert.strictEqual(attr(html, 'data-color'), hex);
    assert.strictEqual(attr(html, 'data-rgb'), rgb);
    assert.match(html, new RegExp(`<title[^>]*>${escapeRegExp(data.page_title)}</title>`));
    assert.ok(text(html).includes(data.page_heading));
    assert.ok(text(html).includes(data.how_to_title));
    assert.ok(text(html).includes(data.technical));
    for (const section of data.sections) assert.ok(text(html).includes(section.title) && text(html).includes(section.text));
    for (const faq of data.faqs) assert.ok(text(html).includes(faq.q) && text(html).includes(faq.a));
    assert.strictEqual((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(match => [match[1], match[2]]);
    assert.deepStrictEqual(alternates, langs.map(item => [item, `https://screensizechecker.com/${item === 'en' ? '' : `${item}/`}${slug}`]).concat([['x-default', `https://screensizechecker.com/${slug}`]]));
    assert.strictEqual((html.match(/class="color-swatch-link"/g) || []).length, 10);
    const swatches = [...html.matchAll(/<a class="color-swatch-link" href="([^"]+)" aria-label="([^"]+)" title="([^"]+)"/g)];
    assert.strictEqual(swatches.length, 10);
    assert.ok(swatches.every(match => match[2].trim() && match[3].trim()));
    assert.deepStrictEqual(swatches.map(match => match[1]), colors.map(item => `${lang === 'en' ? '' : `/${lang}`}/${item[0]}`));
    assert.ok(html.includes(`${lang === 'en' ? '' : `/${lang}`}/devices/lcd-screen-tester`));
    assert.ok(html.includes(`${lang === 'en' ? '' : `/${lang}`}/resolution-test`));
    assert.ok(html.includes('id="language-modal-trigger"') && html.includes('language-modal'));
    const familyHref = `${lang === 'en' ? '' : `/${lang}`}/white-screen`;
    const headerHtml = html.slice(0, html.indexOf('</header>'));
    const footerHtml = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
    assert.strictEqual((headerHtml.match(new RegExp(`href="${escapeRegExp(familyHref)}"`, 'g')) || []).length, 1);
    assert.strictEqual((footerHtml.match(new RegExp(`href="${escapeRegExp(familyHref)}"`, 'g')) || []).length, 1);
    const nodes = schemaNodes(html);
    const app = nodes.find(item => item['@type'] === 'WebApplication');
    const faq = nodes.find(item => item['@type'] === 'FAQPage');
    const breadcrumb = nodes.find(item => item['@type'] === 'BreadcrumbList');
    assert.deepStrictEqual({ name: app.name, description: app.description, url: app.url, inLanguage: app.inLanguage }, { name: data.page_title, description: data.description, url: canonical, inLanguage: lang });
    assert.deepStrictEqual(faq.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), data.faqs.map(item => [item.q, item.a]));
    assert.deepStrictEqual(breadcrumb.itemListElement.map(item => [item.item['@id'], item.item.name]), [[`${canonical.replace(`/${slug}`, '/')}`, breadcrumbUi[lang].home], [`https://screensizechecker.com/${lang === 'en' ? '' : `${lang}/`}#tools`, breadcrumbUi[lang].tools], [canonical, data.page_heading]]);
}

const sitemapUrls = [...fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedSitemap = new Set(langs.flatMap(lang => colors.map(([slug]) => `https://screensizechecker.com/${lang === 'en' ? '' : `${lang}/`}${slug}`)));
assert.strictEqual(sitemapUrls.filter(url => expectedSitemap.has(url)).length, 60);
assert.strictEqual(new Set(sitemapUrls.filter(url => expectedSitemap.has(url))).size, 60);
const redirects = fs.readFileSync(path.join(out, '_redirects'), 'utf8');
const redirectPairs = [...redirects.matchAll(/^([^\s#]+\.html)\s+([^\s#]+)\s+301$/gm)].map(match => [match[1], match[2]]).filter(([source]) => /(?:zh\/|de\/|es\/|pt\/|fr\/)?(?:white|black|red|green|blue|yellow|orange|purple|pink|gray)-screen\.html$/.test(source));
assert.strictEqual(redirectPairs.length, 60);
assert.strictEqual(new Set(redirectPairs.map(item => item.join(' '))).size, 60);

const representative = ['index.html', 'blog/index.html', 'devices/lcd-screen-tester.html', 'resolution-test.html'];
for (const relative of representative) {
    const html = fs.readFileSync(path.join(out, relative), 'utf8');
    assert.strictEqual((html.match(/href="(?:\/|)white-screen"/g) || []).length, 2, `${relative} color family nav count`);
}
const protectedPages = [
    ['index.html', 'What Is My Screen Size? Instant Screen Resolution Checker', 'What Is My Screen Size?', 'https://screensizechecker.com/'],
    ['resolution-test.html', 'Screen Resolution Checker - Live Test', 'Resolution Test', 'https://screensizechecker.com/resolution-test'],
    ['devices/lcd-screen-tester.html', 'LCD Test Online: Dead Pixel, Color & Ghosting Screen Tester', 'LCD Test Online', 'https://screensizechecker.com/devices/lcd-screen-tester']
];
for (const [relative, title, heading, canonical] of protectedPages) {
    const html = fs.readFileSync(path.join(out, relative), 'utf8');
    assert.match(html, new RegExp(`<title[^>]*>${escapeRegExp(title)}</title>`));
    assert.ok(text(html).includes(heading));
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
}

try {
    fs.rmSync(temp, { recursive: true, force: true });
    fs.mkdirSync(temp, { recursive: true });
    for (const lang of ['en', 'zh', 'de']) {
        const args = ['scripts/build-page.js', '--page=white-screen', `--lang=${lang}`, `--out-dir=${path.join(temp, lang)}`];
        const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 180000 });
        if (result.status !== 0) throw new Error(result.stderr || result.stdout);
        const full = fs.readFileSync(outputPath(lang, 'white-screen'), 'utf8');
        const selected = fs.readFileSync(path.join(temp, lang, lang === 'en' ? 'white-screen.html' : path.join(lang, 'white-screen.html')), 'utf8');
        assert.strictEqual(selected, full, `full/selected ${lang} output mismatch`);
    }
} finally {
    fs.rmSync(temp, { recursive: true, force: true });
    assert.ok(!fs.existsSync(temp));
}

console.log('[pure-color] six-language source, output, SEO, schema, sitemap, redirect and builder-equivalence contracts passed');
