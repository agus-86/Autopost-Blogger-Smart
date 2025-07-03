const puppeteer = require('puppeteer');
const fs = require('fs');
const cookies = require('./cookies.json');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.setCookie(...cookies);
    await page.goto('https://www.blogger.com/about/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'status-login.png' });
    console.log('✅ Screenshot berhasil diambil: status-login.png');
  } catch (err) {
    console.error('❌ Error saat mengambil screenshot:', err);
  } finally {
    await browser.close();
  }
})();
