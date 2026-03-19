const path = require('path');
const { spawnSync } = require('child_process');

const TESTS = {
    validation: 'test/simple-validation.js',
    seo: 'test/seo-tags-validator.js',
    links: 'test/internal-links-checker.js',
    redirects: 'test/blog-redirect-test.js',
    cleanUrls: 'test/dev-server-clean-url-test.js',
    languageUrls: 'test/language-url-canonicalization-test.js',
    canonicalLinks: 'test/canonical-internal-links-test.js',
    blogLanguageModal: 'test/blog-language-modal-test.js',
    languageSwitchMenu: 'test/language-switch-mega-menu-test.js'
};

function resolveSelectedTests(args) {
    if (args.includes('--smoke')) {
        return ['validation', 'seo', 'links', 'cleanUrls', 'languageUrls', 'canonicalLinks', 'blogLanguageModal', 'languageSwitchMenu'];
    }

    const namedArgs = args
        .filter(arg => arg.startsWith('--only='))
        .flatMap(arg => arg.replace('--only=', '').split(','))
        .map(name => name.trim())
        .filter(Boolean);

    if (namedArgs.length > 0) {
        return namedArgs;
    }

    return Object.keys(TESTS);
}

function runTest(testName) {
    const relativePath = TESTS[testName];
    if (!relativePath) {
        throw new Error(`Unknown test "${testName}"`);
    }

    const fullPath = path.join(process.cwd(), relativePath);
    console.log(`\n[test] Running ${relativePath}`);

    const result = spawnSync(process.execPath, [fullPath], {
        stdio: 'inherit'
    });

    if (result.status !== 0) {
        throw new Error(`${relativePath} failed with exit code ${result.status}`);
    }
}

function runTestSuite(args = process.argv.slice(2)) {
    const selectedTests = resolveSelectedTests(args);
    selectedTests.forEach(runTest);
    console.log('\n[test] All selected checks passed.');
}

if (require.main === module) {
    try {
        runTestSuite();
    } catch (error) {
        console.error('\n[test] Failed:', error.message);
        process.exit(1);
    }
}

module.exports = { runTestSuite };
