const https = require('https');
const fs = require('fs');
const path = require('path');

class IndexNowSubmitter {
  constructor() {
    this.apiKey = '965fb3d0413453519401afd900e344bcb6c11ba665d7ba5e1a0e134cc9b8dead';
    this.host = 'screensizechecker.com';
    this.endpoints = [
      'api.indexnow.org',
      'www.bing.com'
    ];
    this.logFile = path.join(__dirname, '../indexnow-submission.log');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  async submitUrls(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      this.log('No URLs to submit');
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

    this.log(`Submitting ${urlList.length} URLs to IndexNow...`);
    this.log('Sample URLs: ' + urlList.slice(0, 3).join(', '));

    for (const endpoint of this.endpoints) {
      try {
        await this.submitToEndpoint(endpoint, payload);
        this.log(`✓ Successfully submitted to ${endpoint}`);
      } catch (error) {
        this.log(`✗ Failed to submit to ${endpoint}: ${error.message}`);
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
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      console.log(`Connecting to ${endpoint}...`);

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`Response from ${endpoint}: ${res.statusCode}`);
          if (data) console.log('Response body:', data);

          if (res.statusCode === 200 || res.statusCode === 202) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data || res.statusMessage}`));
          }
        });
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
