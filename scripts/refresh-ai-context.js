const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, '.claude', 'index.json');

function isContentMarkdown(filePath) {
    const baseName = path.basename(filePath);
    return filePath.endsWith('.md') && !['CLAUDE.md', 'README.md'].includes(baseName);
}

function countFiles(dir, predicate = () => true) {
    if (!fs.existsSync(dir)) return 0;

    let count = 0;
    const stack = [dir];

    while (stack.length > 0) {
        const current = stack.pop();
        const entries = fs.readdirSync(current, { withFileTypes: true });

        entries.forEach(entry => {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
            } else if (entry.isFile() && predicate(fullPath)) {
                count += 1;
            }
        });
    }

    return count;
}

function listActiveSpecs(dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
}

function loadPackageJson() {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
}

function buildContext() {
    const packageJson = loadPackageJson();

    return {
        project: {
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
            homepage: packageJson.homepage
        },
        generatedAt: new Date().toISOString(),
        sourcesOfTruth: {
            claude: 'CLAUDE.md',
            buildDocs: 'docs/BUILD_SYSTEM.md',
            deploymentDocs: 'docs/DEPLOYMENT.md',
            pageConfig: 'build/pages-config.json',
            activeSpecs: '.claude/specs/active/'
        },
        workingRules: {
            manualComponents: 'components/*.html (non blog-*/hub-* files)',
            generatedComponents: 'components/generated/**',
            blogContent: 'blog-content/{lang}/*.md',
            hubContent: 'hub-content/*.md',
            doNotEditDirectly: [
                'components/generated/blog/*.html',
                'components/generated/hub/*.html'
            ]
        },
        commands: {
            build: 'npm run multilang-build',
            dev: 'npm run dev',
            pagePreview: 'npm run build:page -- --page compare --lang en',
            batchBuild: 'npm run batch-build',
            tests: 'npm run test',
            smokeTests: 'npm run test:smoke',
            refreshContext: 'npm run ai:refresh-context'
        },
        counts: {
            buildScripts: countFiles(path.join(ROOT, 'build'), file => file.endsWith('.js')),
            manualComponents: countFiles(path.join(ROOT, 'components'), file => {
                const relative = path.relative(path.join(ROOT, 'components'), file).replace(/\\/g, '/');
                return file.endsWith('.html') && !relative.startsWith('generated/');
            }),
            generatedBlogComponents: countFiles(path.join(ROOT, 'components', 'generated', 'blog'), file => file.endsWith('.html')),
            generatedHubComponents: countFiles(path.join(ROOT, 'components', 'generated', 'hub'), file => file.endsWith('.html')),
            templates: countFiles(path.join(ROOT, 'templates'), file => file.endsWith('.html')),
            locales: countFiles(path.join(ROOT, 'locales'), file => file.endsWith('.json')),
            blogMarkdown: countFiles(path.join(ROOT, 'blog-content'), isContentMarkdown),
            hubMarkdown: countFiles(path.join(ROOT, 'hub-content'), isContentMarkdown),
            tests: countFiles(path.join(ROOT, 'test'), file => file.endsWith('.js'))
        },
        activeSpecs: listActiveSpecs(path.join(ROOT, '.claude', 'specs', 'active'))
    };
}

function refreshAiContext() {
    const context = buildContext();
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(context, null, 2)}\n`, 'utf8');
    console.log(`[ai-context] Refreshed ${path.relative(ROOT, OUTPUT_PATH)}`);
}

if (require.main === module) {
    try {
        refreshAiContext();
    } catch (error) {
        console.error('[ai-context] Failed:', error.message);
        process.exit(1);
    }
}

module.exports = { refreshAiContext };
