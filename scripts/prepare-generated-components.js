const BlogBuilder = require('../build/blog-builder');
const HubBuilder = require('../build/hub-builder');

function prepareGeneratedComponents() {
    console.log('\n[prepare] Generating blog components...');
    const blogBuilder = new BlogBuilder();
    const blogResult = blogBuilder.build();

    if (!blogResult || blogResult.success === false) {
        throw new Error('Blog generated components build failed');
    }

    console.log('\n[prepare] Generating hub components...');
    const hubBuilder = new HubBuilder();
    const hubResult = hubBuilder.build();

    if (!hubResult || hubResult.success === false) {
        throw new Error('Hub generated components build failed');
    }
}

if (require.main === module) {
    try {
        prepareGeneratedComponents();
        console.log('\n[prepare] Generated components are ready.');
    } catch (error) {
        console.error('\n[prepare] Failed:', error.message);
        process.exit(1);
    }
}

module.exports = { prepareGeneratedComponents };
