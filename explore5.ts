import cloudscraper from 'cloudscraper';

async function test() {
    try {
        const html = await cloudscraper.get('https://anisnatch.top/dubbed');
        console.log(html.substring(0, 1000));
    } catch (e) {
        console.error("Cloudscraper failed:", e.message);
    }
}
test();
