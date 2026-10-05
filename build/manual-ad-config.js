const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'manual-ad-slots.json'), 'utf8'));
const SLOT_ID_PATTERN = /^[1-9]\d*$/;
const CLIENT_ID_PATTERN = /^ca-pub-\d+$/;

function escapeAttribute(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

function getSlot(position) {
    const value = String(config.slots[position] == null ? '' : config.slots[position]).trim();
    return SLOT_ID_PATTERN.test(value) ? value : '';
}

function getClient() {
    const value = String(config.client == null ? '' : config.client).trim();
    return CLIENT_ID_PATTERN.test(value) ? value : '';
}

module.exports = { getConfig: () => config, getSlot, getClient, escapeAttribute, SLOT_ID_PATTERN, CLIENT_ID_PATTERN };
