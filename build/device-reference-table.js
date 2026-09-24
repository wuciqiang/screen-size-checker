const fs = require('fs');
const path = require('path');

const PAGE_FAMILIES = {
    'iphone-content': 'iphone',
    'ipad-content': 'ipad',
    'android-content': 'android'
};

const NUMERIC_FIELDS = ['native_resolution_px', 'physical_diagonal_in', 'ppi', 'physical_dimensions_mm'];
const EVIDENCE_LABELS = {
    native_resolution_px: 'field_resolution',
    physical_diagonal_in: 'field_diagonal',
    ppi: 'field_ppi',
    physical_dimensions_mm: 'physical_dimensions',
    viewport_css_px: 'field_viewport',
    dpr: 'field_dpr'
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function formatPixels(value) {
    return Array.isArray(value) && value.length === 2 ? `${value[0]} × ${value[1]}` : null;
}

function validExternalUrl(value) {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function assertEvidence(state, row, field) {
    const value = state[field];
    if (value === null || value === undefined) return;
    const evidence = state.field_provenance?.[field];
    const quote = typeof evidence === 'string' ? evidence : evidence?.quote;
    const evidenceUrl = validExternalUrl(evidence?.source_url || state.source_url);
    if (!quote || !evidenceUrl) {
        throw new Error(`Verified ${field} lacks quoted source evidence for ${row.id}/${state.id}`);
    }
}

function validateNumericField(value, rowId, stateId, field) {
    if (value === null || value === undefined) return;
    const numericValues = Array.isArray(value) ? value : [value];
    const expectedLength = field === 'physical_dimensions_mm' ? 3 : 2;
    if ((field.endsWith('_px') || field.endsWith('_mm')) && (!Array.isArray(value) || value.length !== expectedLength)) {
        throw new Error(`${field} must be a ${expectedLength}-value array for ${rowId}/${stateId}`);
    }
    if (numericValues.some(number => typeof number !== 'number' || !Number.isFinite(number) || number <= 0)) {
        throw new Error(`${field} must contain positive numbers for ${rowId}/${stateId}`);
    }
}

function readData(rootPath) {
    const file = path.join(rootPath, 'data', 'device-reference.json');
    if (!fs.existsSync(file)) throw new Error(`Missing device reference dataset: ${file}`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data.rows)) throw new Error('Device reference dataset must contain rows[]');
    if (typeof data.data_as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.data_as_of)) {
        throw new Error('Device reference dataset must include data_as_of as YYYY-MM-DD');
    }
    const rowIds = new Set();
    data.rows.forEach(row => {
        if (!row || typeof row.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(row.id) || rowIds.has(row.id)) {
            throw new Error(`Invalid or duplicate device reference row id: ${row?.id}`);
        }
        rowIds.add(row.id);
        if (!['iphone', 'ipad', 'android'].includes(row.family) || !row.model || !Array.isArray(row.states)) {
            throw new Error(`Invalid device reference row: ${row.id}`);
        }
        const stateIds = new Set();
        row.states.forEach(state => {
            if (!state || !/^[a-z0-9][a-z0-9-]*$/.test(state.id || '') || stateIds.has(state.id)) {
                throw new Error(`Invalid or duplicate state id for ${row.id}`);
            }
            stateIds.add(state.id);
            NUMERIC_FIELDS.forEach(field => {
                validateNumericField(state[field], row.id, state.id, field);
                assertEvidence(state, row, field);
            });
            validateNumericField(state.viewport_css_px, row.id, state.id, 'viewport_css_px');
            validateNumericField(state.dpr, row.id, state.id, 'dpr');
            const stateSourceUrl = validExternalUrl(state.source_url);
            if (state.source_url && !stateSourceUrl) throw new Error(`Invalid source URL for ${row.id}/${state.id}`);
            Object.entries(state.field_provenance || {}).forEach(([field, evidence]) => {
                if (!evidence || typeof evidence !== 'object') return;
                const provenanceUrl = validExternalUrl(evidence.source_url);
                if (evidence.source_url && !provenanceUrl) throw new Error(`Invalid provenance URL for ${row.id}/${state.id}/${field}`);
            });
        });
    });
    return data;
}

function renderAssets(pageData) {
    return [
        `<link rel="stylesheet" href="${escapeHtml(pageData.css_path || 'css')}/device-reference-table.css">`,
        `<script defer src="${escapeHtml(pageData.js_path || 'js')}/device-reference-table.js"></script>`
    ].join('\n');
}

function render({ rootPath, family, lang }) {
    const data = readData(rootPath);
    const translationPath = path.join(rootPath, 'locales', lang, 'translation.json');
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    const label = key => {
        const value = translations[`device_reference_${key}`];
        if (typeof value !== 'string' || !value) throw new Error(`Missing device_reference_${key} translation for ${lang}`);
        return escapeHtml(value);
    };
    const rows = data.rows.filter(row => row.family === family);
    if (!rows.length) throw new Error(`No device reference rows for family ${family}`);

    const htmlRows = rows.flatMap(row => row.states.map((state, index) => {
        const viewport = state.reference_viewport || (state.viewport_css_px ? formatPixels(state.viewport_css_px) : null);
        const resolution = formatPixels(state.native_resolution_px);
        const dpr = state.reference_dpr || (state.dpr === null || state.dpr === undefined ? null : String(state.dpr));
        const diagonal = state.physical_diagonal_in === null || state.physical_diagonal_in === undefined ? null : String(state.physical_diagonal_in);
        const ppi = state.ppi === null || state.ppi === undefined ? null : String(state.ppi);
        const stateLabel = state.id === 'cover' ? label('state_cover') : state.id === 'main' ? label('state_main') : '';
        const anchor = `device-${row.id}${state.id === 'default' ? '' : `-${state.id}`}`;
        const modelText = `${row.manufacturer || ''} ${row.model}`.trim();
        const provenances = Object.values(state.field_provenance || {});
        const sourceUrl = validExternalUrl(state.source_url)
            || provenances.map(evidence => validExternalUrl(evidence?.source_url)).find(Boolean);
        const valueCell = (value, isUnverified) => value
            ? `<span class="drt-value">${escapeHtml(value)}</span>${isUnverified ? `<span class="drt-status">${label('unverified')}</span>` : ''}`
            : `<span class="drt-pending">${label('pending')}</span>`;
        const dimensions = state.physical_dimensions_mm === null || state.physical_dimensions_mm === undefined
            ? '' : `<dt>${label('physical_dimensions')}</dt><dd>${escapeHtml(Array.isArray(state.physical_dimensions_mm) ? state.physical_dimensions_mm.join(' × ') : state.physical_dimensions_mm)} mm</dd>`;
        const note = state.note ? `<p>${escapeHtml(state.note)}</p>` : '';
        const locatorValues = [...new Set([state.source_locator].filter(Boolean))];
        const locator = locatorValues.map(value => `<dt>${label('source_locator')}</dt><dd>${escapeHtml(value)}</dd>`).join('');
        const verifiedValues = [...new Set([state.verified_at, ...provenances.map(evidence => evidence?.accessed_at)].filter(Boolean))];
        const verifiedAt = verifiedValues.map(value => `<dt>${label('verified_at')}</dt><dd>${escapeHtml(String(value).slice(0, 10))}</dd>`).join('');
        const quotes = Object.entries(state.field_provenance || {}).map(([field, evidence]) => {
            const quote = typeof evidence === 'string' ? evidence : evidence?.quote;
            const fieldLabel = EVIDENCE_LABELS[field] ? label(EVIDENCE_LABELS[field]) : label('evidence_quote');
            return quote ? `<dt>${fieldLabel}</dt><dd><q>${escapeHtml(quote)}</q></dd>` : '';
        }).join('');
        const details = dimensions || note || locator || verifiedAt || quotes
            ? `<details class="drt-details"><summary>${label('details')}</summary><dl>${dimensions}${locator}${verifiedAt}${quotes}</dl>${note}</details>` : '';
        const model = index === 0 ? `<span class="drt-model">${escapeHtml(row.model)}</span><span class="drt-manufacturer">${escapeHtml(row.manufacturer || '')}</span>` : `<span class="drt-model">${escapeHtml(row.model)}</span>`;
        return `<tr id="${escapeHtml(anchor)}" data-device-row data-search="${escapeHtml(modelText.toLocaleLowerCase())}">
            <th scope="row">${model}${stateLabel ? `<span class="drt-state">${stateLabel}</span>` : ''}${details}</th>
            <td>${valueCell(viewport, true)}</td><td>${valueCell(resolution, false)}</td><td>${valueCell(dpr, true)}</td><td>${valueCell(diagonal, false)}</td><td>${valueCell(ppi, false)}</td>
            <td>${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${label('source_link')}<span class="drt-sr-only">: ${escapeHtml(modelText)}</span></a>` : `<span class="drt-pending">${label('pending')}</span>`}</td>
        </tr>`;
    })).join('\n');

    return `<section class="device-reference" data-device-reference>
        <div class="drt-controls" hidden>
            <label>${label('search_label')}<input type="search" data-drt-search autocomplete="off"></label>
            <label>${label('manufacturer_label')}<select data-drt-manufacturer><option value="">${label('all_manufacturers')}</option></select></label>
            <button type="button" data-drt-reset>${label('reset')}</button>
        </div>
        <p class="drt-count" aria-live="polite"><span data-drt-count>${rows.reduce((count, row) => count + row.states.length, 0)}</span> ${label('count')}</p>
        <p class="drt-data-as-of">${label('data_as_of')}: ${escapeHtml(data.data_as_of || '')}</p>
        <p class="drt-scroll-hint">${label('scroll_hint')}</p>
        <div class="drt-scroll" tabindex="0" role="region" aria-label="${label('table_region')}">
            <table class="drt-table">
                <thead><tr><th scope="col">${label('model_header')}</th><th scope="col">${label('viewport_header')}</th><th scope="col">${label('resolution_header')}</th><th scope="col">${label('dpr_header')}</th><th scope="col">${label('diagonal_header')}</th><th scope="col">${label('ppi_header')}</th><th scope="col">${label('source_header')}</th></tr></thead>
                <tbody>${htmlRows}</tbody>
            </table>
        </div>
        <p class="drt-no-results" data-drt-no-results hidden>${label('no_results')}</p>
    </section>`;
}

module.exports = {
    getFamilyForPage: pageContent => PAGE_FAMILIES[pageContent] || null,
    renderAssets,
    render
};
