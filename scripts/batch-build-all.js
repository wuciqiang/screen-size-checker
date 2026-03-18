const ComponentBuilder = require('../build/component-builder');
const { prepareGeneratedComponents } = require('./prepare-generated-components');

function runBatchBuild() {
    prepareGeneratedComponents();

    const builder = new ComponentBuilder();
    if (!builder.validateComponents()) {
        throw new Error('Component validation failed');
    }

    const success = builder.buildAllPages();
    if (!success) {
        throw new Error('Batch build failed');
    }
}

if (require.main === module) {
    try {
        runBatchBuild();
        console.log('\n[batch-build] Completed successfully.');
    } catch (error) {
        console.error('\n[batch-build] Failed:', error.message);
        process.exit(1);
    }
}

module.exports = { runBatchBuild };
