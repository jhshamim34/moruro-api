import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function fetchJs() {
    const { data } = await axios.get('https://www.miruro.to/watch/1?ep=1', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    const scripts = $('script');
    for (const el of scripts) {
        const src = $(el).attr('src');
        if (src && src.includes('index-')) {
             console.log('fetching', src);
             try {
                const js = await axios.get(src.startsWith('http') ? src : 'https://www.miruro.to' + src);
                fs.writeFileSync('index.js', js.data);
                console.log('Saved index.js');
             } catch(e) {}
             break;
        }
    }
}
fetchJs();
