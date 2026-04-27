import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
async function run() {
  try {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto('https://anisnatch.top/dubbed', {waitUntil: 'networkidle2'});
    const html = await page.content();
    const $ = cheerio.load(html);
    
    console.log(html.substring(1000, 2000));
    
    // Find interesting collections
    console.log("div classes:", $('div').map((_, el) => $(el).attr('class')).get().filter(c => c).slice(0, 20));
    console.log("a classes:", $('a').map((_, el) => $(el).attr('class')).get().filter(c => c).slice(0, 20));

    await browser.close();
  } catch (e) {
    console.log('Error:', e.message);
  }
}
run();
