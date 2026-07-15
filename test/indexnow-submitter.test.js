const assert = require('assert');
const IndexNowSubmitter = require('../build/indexnow-submitter');

const DEFAULT_KEY = '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead';
const HOST = 'screensizechecker.com';
const KEY_LOCATION = `https://${HOST}/${DEFAULT_KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function createMockHttp(responses = {}) {
  const calls = [];
  return {
    calls,
    boundary: {
      get: async (url) => {
        calls.push({ type: 'get', url });
        const response = responses.get || { statusCode: 200, body: DEFAULT_KEY };
        return { ...response };
      },
      post: async (url, payload, headers) => {
        calls.push({ type: 'post', url, payload, headers });
        const response = responses.post || { statusCode: 200, body: '' };
        return { ...response };
      }
    }
  };
}

function assertThrows(fn, expectedMessage) {
  try {
    fn();
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error to include "${expectedMessage}", got "${error.message}"`);
    }
    return;
  }
  throw new Error(`Expected function to throw${expectedMessage ? ` "${expectedMessage}"` : ''}`);
}

async function assertRejects(promise, expectedMessage) {
  try {
    await promise;
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error to include "${expectedMessage}", got "${error.message}"`);
    }
    return;
  }
  throw new Error(`Expected promise to reject${expectedMessage ? ` "${expectedMessage}"` : ''}`);
}

const tests = {
  'parseArgs accepts repeated --url and --confirm-submit': () => {
    const submitter = new IndexNowSubmitter();
    const result = submitter.parseArgs([
      '--url', 'https://screensizechecker.com/',
      '--url', 'https://screensizechecker.com/page',
      '--confirm-submit'
    ]);
    assert.deepStrictEqual(result.urls, ['https://screensizechecker.com/', 'https://screensizechecker.com/page']);
    assert.strictEqual(result.confirmSubmit, true);
  },

  'parseArgs ignores npm argument separator': () => {
    const submitter = new IndexNowSubmitter();
    const result = submitter.parseArgs(['--', '--url', 'https://screensizechecker.com/']);
    assert.deepStrictEqual(result.urls, ['https://screensizechecker.com/']);
    assert.strictEqual(result.confirmSubmit, false);
  },

  'parseArgs fails when no --url is provided': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.parseArgs(['--confirm-submit']), 'At least one --url is required');
  },

  'parseArgs fails when --url is missing its value': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.parseArgs(['--url', '--confirm-submit']), '--url requires a value');
    assertThrows(() => submitter.parseArgs(['--url']), '--url requires a value');
  },

  'parseArgs fails on unknown flags': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.parseArgs(['--url', 'https://screensizechecker.com/', '--verbose']), 'Unknown flag: --verbose');
  },

  'parseArgs fails on positional URL arguments': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.parseArgs(['https://screensizechecker.com/']), 'Positional argument not allowed');
  },

  'normalizeAndValidateUrl normalizes both homepage spellings': () => {
    const submitter = new IndexNowSubmitter();
    assert.strictEqual(submitter.normalizeAndValidateUrl('https://screensizechecker.com'), 'https://screensizechecker.com/');
    assert.strictEqual(submitter.normalizeAndValidateUrl('https://screensizechecker.com/'), 'https://screensizechecker.com/');
  },

  'normalizeAndValidateUrl preserves path and query': () => {
    const submitter = new IndexNowSubmitter();
    assert.strictEqual(
      submitter.normalizeAndValidateUrl('https://screensizechecker.com/path?a=1&b=2'),
      'https://screensizechecker.com/path?a=1&b=2'
    );
  },

  'normalizeAndValidateUrl rejects non-HTTPS URLs': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('http://screensizechecker.com/'), 'URL must use HTTPS');
  },

  'normalizeAndValidateUrl rejects foreign hosts': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('https://example.com/'), `URL must be on ${HOST}`);
  },

  'normalizeAndValidateUrl rejects subdomains': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('https://www.screensizechecker.com/'), `URL must be on ${HOST}`);
    assertThrows(() => submitter.normalizeAndValidateUrl('https://blog.screensizechecker.com/'), `URL must be on ${HOST}`);
  },

  'normalizeAndValidateUrl rejects credentials': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('https://user:pass@screensizechecker.com/'), 'URL must not contain credentials');
  },

  'normalizeAndValidateUrl rejects fragments': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('https://screensizechecker.com/#section'), 'URL must not contain fragment');
  },

  'normalizeAndValidateUrl rejects non-default ports': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('https://screensizechecker.com:8443/'), 'URL must use default HTTPS port');
    assertThrows(() => submitter.normalizeAndValidateUrl('https://screensizechecker.com:8080/path'), 'URL must use default HTTPS port');
  },

  'normalizeAndValidateUrl rejects malformed URLs': () => {
    const submitter = new IndexNowSubmitter();
    assertThrows(() => submitter.normalizeAndValidateUrl('not a url'), 'Invalid URL');
    assertThrows(() => submitter.normalizeAndValidateUrl('https://'), 'Invalid URL');
  },

  'normalizeUrls order-deduplicates URLs': () => {
    const submitter = new IndexNowSubmitter();
    const result = submitter.normalizeUrls([
      'https://screensizechecker.com/',
      'https://screensizechecker.com/page',
      'https://screensizechecker.com',
      'https://screensizechecker.com/page',
      'https://screensizechecker.com/other'
    ]);
    assert.deepStrictEqual(result, [
      'https://screensizechecker.com/',
      'https://screensizechecker.com/page',
      'https://screensizechecker.com/other'
    ]);
  },

  'dryRun performs zero HTTP calls and returns exact batches': () => {
    const mock = createMockHttp();
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    const result = submitter.dryRun([
      'https://screensizechecker.com/',
      'https://screensizechecker.com/page'
    ]);

    assert.deepStrictEqual(result, {
      endpoint: ENDPOINT,
      host: HOST,
      urlCount: 2,
      batchCount: 1,
      batches: [
        ['https://screensizechecker.com/', 'https://screensizechecker.com/page']
      ]
    });
    assert.strictEqual(mock.calls.length, 0);
  },

  'confirmSubmit validates key file before POST': async () => {
    const mock = createMockHttp({ get: { statusCode: 200, body: DEFAULT_KEY } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(['https://screensizechecker.com/']);
    assert.strictEqual(mock.calls.length, 2);
    assert.strictEqual(mock.calls[0].type, 'get');
    assert.strictEqual(mock.calls[0].url, KEY_LOCATION);
    assert.strictEqual(mock.calls[1].type, 'post');
  },

  'confirmSubmit fails and does not POST when key file mismatches': async () => {
    const mock = createMockHttp({ get: { statusCode: 200, body: 'wrong-key' } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await assertRejects(
      submitter.confirmSubmit(['https://screensizechecker.com/']),
      'Key file validation failed: content mismatch'
    );
    assert.strictEqual(mock.calls.filter(c => c.type === 'post').length, 0);
  },

  'confirmSubmit fails and does not POST when key file returns non-200': async () => {
    const mock = createMockHttp({ get: { statusCode: 404, body: '' } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await assertRejects(
      submitter.confirmSubmit(['https://screensizechecker.com/']),
      'Key file validation failed: HTTP 404'
    );
    assert.strictEqual(mock.calls.filter(c => c.type === 'post').length, 0);
  },

  'confirmSubmit sends exact payload and keyLocation': async () => {
    const mock = createMockHttp();
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(['https://screensizechecker.com/page?x=1']);

    const postCall = mock.calls.find(c => c.type === 'post');
    assert.strictEqual(postCall.url, ENDPOINT);
    const payload = JSON.parse(postCall.payload);
    assert.strictEqual(payload.host, HOST);
    assert.strictEqual(payload.key, DEFAULT_KEY);
    assert.strictEqual(payload.keyLocation, KEY_LOCATION);
    assert.deepStrictEqual(payload.urlList, ['https://screensizechecker.com/page?x=1']);
    assert.strictEqual(postCall.headers['Content-Type'], 'application/json; charset=utf-8');
  },

  'confirmSubmit uses only one endpoint': async () => {
    const mock = createMockHttp();
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(['https://screensizechecker.com/']);
    const postCalls = mock.calls.filter(c => c.type === 'post');
    assert.strictEqual(postCalls.length, 1);
    assert.strictEqual(postCalls[0].url, ENDPOINT);
  },

  'confirmSubmit accepts HTTP 200': async () => {
    const mock = createMockHttp({ post: { statusCode: 200, body: 'OK' } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(['https://screensizechecker.com/']);
    assert.strictEqual(mock.calls.filter(c => c.type === 'post').length, 1);
  },

  'confirmSubmit accepts HTTP 202': async () => {
    const mock = createMockHttp({ post: { statusCode: 202, body: 'Accepted' } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(['https://screensizechecker.com/']);
    assert.strictEqual(mock.calls.filter(c => c.type === 'post').length, 1);
  },

  'confirmSubmit fails on non-200/202 response and does not retry': async () => {
    const mock = createMockHttp({ post: { statusCode: 400, body: 'Bad Request' } });
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await assertRejects(
      submitter.confirmSubmit(['https://screensizechecker.com/']),
      'IndexNow submission failed: HTTP 400'
    );
    assert.strictEqual(mock.calls.filter(c => c.type === 'post').length, 1);
  },

  'confirmSubmit batches URLs at 10000 per request': async () => {
    const urls = [];
    for (let i = 0; i < 10001; i++) {
      urls.push(`https://screensizechecker.com/page-${i}`);
    }

    const mock = createMockHttp();
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.confirmSubmit(urls);

    const postCalls = mock.calls.filter(c => c.type === 'post');
    assert.strictEqual(postCalls.length, 2);
    assert.strictEqual(JSON.parse(postCalls[0].payload).urlList.length, 10000);
    assert.strictEqual(JSON.parse(postCalls[1].payload).urlList.length, 1);
  },

  'run default is dry run': async () => {
    const mock = createMockHttp();
    const submitter = new IndexNowSubmitter({ httpBoundary: mock.boundary });
    await submitter.run(['--url', 'https://screensizechecker.com/']);
    assert.strictEqual(mock.calls.length, 0);
  }
};

async function main() {
  let failed = 0;
  const names = Object.keys(tests);

  for (const name of names) {
    try {
      await tests[name]();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
    }
  }

  console.log(`\n${names.length - failed}/${names.length} tests passed`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { tests };
