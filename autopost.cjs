const puppeteer = require('puppeteer');
const rssParser = require('rss-parser');
const fs = require('fs');
const parser = new rssParser();

const adLink = 'https://www.profitableratecpm.com/eqswpmdja7?key=38c592d01c4436c5bcc875af058b53f3';
const rssFeeds = [
  'https://yts.mx/rss'
];

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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  const blogId = getRandomItem(blogIds);

  for (const feedUrl of rssFeeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const movie = getRandomItem(feed.items);

      const title = spinTitle(movie.title);
      const content = generateContent(movie);

      console.log(`📌 Posting ke blog ID: ${blogId} dengan judul: ${title}`);

      await page.goto(`https://www.blogger.com/blog/posts/${blogId}`);
      await page.waitForSelector('div[role="button"]:has-text("New post")', { timeout: 15000 });
      await page.click('div[role="button"]:has-text("New post")');

      await page.waitForSelector('textarea[aria-label="Post title"]', { timeout: 10000 });
      await page.type('textarea[aria-label="Post title"]', title);
      await page.keyboard.press('Tab');
      await page.keyboard.type(content);

      await page.waitForSelector('[aria-label="Publish"], div[role="button"]:has-text("Publish")', { timeout: 10000 });
      await page.click('[aria-label="Publish"], div[role="button"]:has-text("Publish")');

      await page.waitForTimeout(2000);
      console.log(`✅ Berhasil posting: ${title}`);
      break;

    } catch (err) {
      console.warn(`⚠️ Feed gagal: ${feedUrl} - ${err.message}`);
    }
  }

  await browser.close();
})();
