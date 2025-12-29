const https = require('https');
const fs = require('fs');
const path = require('path');

class IndexNowSubmitter {
  constructor() {
    this.apiKey = '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead';
    this.host = 'screensizechecker.com';
    this.endpoints = [
      'api.indexnow.org',
      'www.bing.com/indexnow'
    ];
  }

  async submitUrls(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      console.log('No URLs to submit');
      return;
    }

    const urlList = urls.map(url => {
      if (url.startsWith('http')) return url;
      return `https://${this.host}${url.startsWith('/') ? url : '/' + url}`;
    });

    const payload = JSON.stringify({
      host: this.host,
      key: this.apiKey,
      urlList: urlList
    });

    console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

    for (const endpoint of this.endpoints) {
      try {
        await this.submitToEndpoint(endpoint, payload);
        console.log(`✓ Successfully submitted to ${endpoint}`);
      } catch (error) {
        console.error(`✗ Failed to submit to ${endpoint}:`, error.message);
      }
    }
  }

  submitToEndpoint(endpoint, payload) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: endpoint,
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  async submitAllPages() {
    const buildDir = path.join(__dirname, '../multilang-build');
    if (!fs.existsSync(buildDir)) {
      console.log('Build directory not found. Run build first.');
      return;
    }

    const urls = this.collectUrls(buildDir);
    await this.submitUrls(urls);
  }

  collectUrls(dir, baseUrl = '', urls = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.collectUrls(filePath, `${baseUrl}/${file}`, urls);
      } else if (file.endsWith('.html')) {
        const url = file === 'index.html'
          ? baseUrl || '/'
          : `${baseUrl}/${file.replace('.html', '')}`;
        urls.push(url);
      }
    }

    return urls;
  }
}

if (require.main === module) {
  const submitter = new IndexNowSubmitter();

  const args = process.argv.slice(2);
  if (args.length > 0) {
    submitter.submitUrls(args);
  } else {
    submitter.submitAllPages();
  }
}

module.exports = IndexNowSubmitter;
