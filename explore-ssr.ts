import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function fetchPage() {
    const { data } = await axios.get('https://www.miruro.to/watch/1?ep=1', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    let ssrStr = '';
    const scripts = $('script');
    scripts.each((_, el) => {
        const html = $(el).html();
        if (html && html.includes('window.__SSR_DATA__=')) {
            const prefix = 'window.__SSR_DATA__=';
            ssrStr = html.substring(html.indexOf(prefix) + prefix.length).trim();
            if (ssrStr.endsWith(';')) ssrStr = ssrStr.slice(0, -1);
        }
    });

    if (ssrStr) {
        fs.writeFileSync('ssr_data.json', ssrStr);
        console.log('Saved to ssr_data.json');
        
        try {
           const obj = JSON.parse(ssrStr);
           console.log('Keys:', Object.getOwnPropertyNames(obj));
           if (obj.episodes) {
               console.log('Has episodes!', obj.episodes.length);
           }
        } catch(e) {
           console.error('Parse error');
        }
    }
}
fetchPage();
