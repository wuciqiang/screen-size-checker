const https = require('https');

const DEFAULT_API_KEY = '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead';
const DEFAULT_HOST = 'screensizechecker.com';
const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 10000;

function defaultGet(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    https.get(parsed, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    }).on('error', reject);
  });
}

function defaultPost(url, payload, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

class IndexNowSubmitter {
  constructor(options = {}) {
    this.apiKey = options.apiKey || DEFAULT_API_KEY;
    this.host = options.host || DEFAULT_HOST;
    this.endpoint = options.endpoint || DEFAULT_ENDPOINT;
    this.keyLocation = `https://${this.host}/${this.apiKey}.txt`;
    this.httpBoundary = options.httpBoundary || {
      get: defaultGet,
      post: defaultPost
    };
  }

  parseArgs(argv) {
    const urls = [];
    let confirmSubmit = false;

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      if (arg === '--') {
        continue;
      }

      if (arg === '--url') {
        const next = argv[++i];
        if (!next || next.startsWith('--')) {
          throw new Error('--url requires a value');
        }
        urls.push(next);
      } else if (arg === '--confirm-submit') {
        confirmSubmit = true;
      } else if (arg.startsWith('--')) {
        throw new Error(`Unknown flag: ${arg}`);
      } else {
        throw new Error(`Positional argument not allowed: ${arg}`);
      }
    }

    if (urls.length === 0) {
      throw new Error('At least one --url is required');
    }

    return { urls, confirmSubmit };
  }

  normalizeAndValidateUrl(input) {
    if (typeof input !== 'string' || input.trim() === '') {
      throw new Error(`Invalid URL: ${input}`);
    }

    let url;
    try {
      url = new URL(input);
    } catch {
      throw new Error(`Invalid URL: ${input}`);
    }

    if (url.protocol !== 'https:') {
      throw new Error(`URL must use HTTPS: ${input}`);
    }
    if (url.hostname !== this.host) {
      throw new Error(`URL must be on ${this.host}: ${input}`);
    }
    if (url.username || url.password) {
      throw new Error(`URL must not contain credentials: ${input}`);
    }
    if (url.hash) {
      throw new Error(`URL must not contain fragment: ${input}`);
    }
    if (url.port) {
      throw new Error(`URL must use default HTTPS port: ${input}`);
    }

    return url.toString();
  }

  normalizeUrls(urls) {
    const seen = new Set();
    const result = [];

    for (const url of urls) {
      const normalized = this.normalizeAndValidateUrl(url);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    }

    return result;
  }

  createBatches(urls, batchSize = BATCH_SIZE) {
    const batches = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }
    return batches;
  }

  dryRun(urls) {
    const batches = this.createBatches(urls);
    return {
      endpoint: this.endpoint,
      host: this.host,
      urlCount: urls.length,
      batchCount: batches.length,
      batches
    };
  }

  async verifyKeyFile() {
    const { statusCode, body } = await this.httpBoundary.get(this.keyLocation);
    if (statusCode !== 200) {
      throw new Error(`Key file validation failed: HTTP ${statusCode}`);
    }
    if (body.trim() !== this.apiKey) {
      throw new Error('Key file validation failed: content mismatch');
    }
  }

  async submitBatch(batch) {
    const payload = JSON.stringify({
      host: this.host,
      key: this.apiKey,
      keyLocation: this.keyLocation,
      urlList: batch
    });

    const { statusCode, body } = await this.httpBoundary.post(
      this.endpoint,
      payload,
      { 'Content-Type': 'application/json; charset=utf-8' }
    );

    if (statusCode !== 200 && statusCode !== 202) {
      throw new Error(`IndexNow submission failed: HTTP ${statusCode}: ${body || ''}`);
    }
  }

  async confirmSubmit(urls) {
    if (urls.length === 0) {
      throw new Error('No URLs to submit');
    }

    await this.verifyKeyFile();

    const batches = this.createBatches(urls);
    for (const batch of batches) {
      await this.submitBatch(batch);
    }
  }

  async run(argv) {
    const { urls, confirmSubmit } = this.parseArgs(argv);
    const normalizedUrls = this.normalizeUrls(urls);

    if (confirmSubmit) {
      await this.confirmSubmit(normalizedUrls);
      console.log(`Submitted ${normalizedUrls.length} URL(s) to IndexNow.`);
    } else {
      const result = this.dryRun(normalizedUrls);
      console.log(JSON.stringify(result, null, 2));
    }

    return 0;
  }
}

if (require.main === module) {
  const submitter = new IndexNowSubmitter();
  submitter.run(process.argv.slice(2)).then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = IndexNowSubmitter;
