const puppeteer = require('puppeteer');
const rssParser = require('rss-parser');
const fs = require('fs');
const parser = new rssParser();

const adLink = 'https://www.profitableratecpm.com/eqswpmdja7?key=38c592d01c4436c5bcc875af058b53f3';
const rssFeeds = ['https://yts.mx/rss'];
const blogIds = require('./blog_ids.json');
const cookies = require('./cookies.json');

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function spinTitle(originalTitle) {
  const templates = [
    `Nonton Movie ${originalTitle} Subtitle Indonesia`,
    `${originalTitle} Full Movie HD Streaming`,
    `Streaming Film ${originalTitle} Kualitas Terbaik`,
    `Download ${originalTitle} Subtitle Indonesia`,
    `Tonton Sekarang: ${originalTitle}`
  ];
  return getRandomItem(templates);
}

function generateContent(movie) {
  const genres = movie.categories?.join(', ') || 'Unknown';
  const description = movie.contentSnippet || 'Film terbaik dengan kualitas tinggi dan subtitle Indonesia.';
  return `
    <p><strong>${movie.title}</strong></p>
    <p>${description}</p>
    <p>🎬 Genre: ${genres}</p>
    <p>🔗 <a href="${adLink}" target="_blank">Tonton Sekarang</a></p>
  `;
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setCookie(...cookies);

  const blogId = getRandomItem(blogIds);
  const feed = await parser.parseURL(getRandomItem(rssFeeds));
  const movie = getRandomItem(feed.items);

  const title = spinTitle(movie.title);
  const content = generateContent(movie);

  try {
    console.log('🔍 Buka halaman post...');
    await page.goto(`https://www.blogger.com/blog/posts/${blogId}`);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '1-dashboard.png' });

    console.log('📝 Klik "New Post"...');
    await page.waitForSelector('a[href*="create"]', { timeout: 15000 });
    await page.click('a[href*="create"]');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '2-new-post-page.png' });

    console.log('✍️ Isi judul...');
    await page.waitForSelector('textarea[aria-label="Post title"]', { timeout: 10000 });
    await page.type('textarea[aria-label="Post title"]', title);

    console.log('📋 Isi konten...');
    await page.keyboard.press('Tab');
    await page.keyboard.type(content);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '3-content-filled.png' });

    console.log('📤 Klik Publish...');
    await page.waitForSelector('div[aria-label="Publish"]', { timeout: 10000 });
    await page.click('div[aria-label="Publish"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '4-after-publish.png' });

    console.log(`✅ Berhasil publish: ${title}`);
  } catch (err) {
    console.error('❌ Gagal saat proses:', err.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  await browser.close();
})();
