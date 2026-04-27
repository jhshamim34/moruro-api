import axios from 'axios';
import * as cheerio from 'cheerio';
async function test() {
    const { data } = await axios.get('https://www.miruro.to/watch/1', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    let ssrStr = '';
    $('script').each((_, el) => {
        const html = $(el).html();
        if (html && html.includes('window.__SSR_DATA__=')) {
            const prefix = 'window.__SSR_DATA__=';
            ssrStr = html.substring(html.indexOf(prefix) + prefix.length).trim();
            if (ssrStr.endsWith(';')) ssrStr = ssrStr.slice(0, -1);
        }
    });
    const obj = JSON.parse(ssrStr);
    console.log('Total episodes:', obj.episodes);
    if (obj.streamingEpisodes) console.log('streamingEpisodes:', obj.streamingEpisodes[0]);
}
test();
