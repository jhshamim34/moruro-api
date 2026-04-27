import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
async function run() {
  try {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto('https://anisnatch.top/dubbed', {waitUntil: 'networkidle2'});
    const html = await page.content();
    const $ = cheerio.load(html);
    
    console.log('--- ITEMS ---');
    console.log('Count (.flw-item):', $('.flw-item').length);
    if ($('.flw-item').length > 0) {
        $('.flw-item').slice(0, 3).each((_, el) => {
             console.log({
                 title: $(el).find('.film-name, .dynamic-name, a.dynamic-name').text().trim(),
                 url: $(el).find('a.film-poster-ahref').attr('href'),
                 image: $(el).find('img.film-poster-img').attr('data-src') || $(el).find('img.film-poster-img').attr('src')
             });
        });
    }
    await browser.close();
  } catch (e) {
    console.log('Error:', e.message);
  }
}
run();
