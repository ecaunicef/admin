const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, 'environments', 'environment.ts');
const envFile = fs.readFileSync(envFilePath, 'utf-8');

// Extract the value of apiUrl from the environment.ts file
const regex = /apiUrl:\s*'([^']+)'/g;
const matches = regex.exec(envFile);
const apiUrl = matches[1];
//console.log(apiUrl)
const PROXY_CONFIG = {
  '/api': {
    target: apiUrl,
    secure: false,
    changeOrigin: true,
    cookieDomainRewrite: "localhost"
    // pathRewrite: {
    //   '^/api': ''
    // }
  }
};

module.exports = PROXY_CONFIG;