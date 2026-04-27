import axios from 'axios';
import * as cheerio from 'cheerio';
async function test() {
    try {
        const { data } = await axios.get('https://anisnatch.top/dubbed', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        console.log($('body').html().substring(0, 1500));
        console.log('--- ITEMS ---');
        console.log($('.item').length > 0 ? 'Has .item' : 'No .item');
        console.log($('.anime-card').length > 0 ? 'Has .anime-card' : 'No .anime-card');
        console.log($('.film-list').length > 0 ? 'Has .film-list' : 'No .film-list');
        console.log($('.flw-item').length > 0 ? 'Has .flw-item ' + $('.flw-item').length : 'No .flw-item');
    } catch(err) {
        console.log(err.message);
    }
}
test();
