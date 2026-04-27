import puppeteer from 'puppeteer';

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        const type = response.headers()['content-type'];
        if (url.includes('api') || url.includes('source') || url.includes('server') || url.includes('episode')) {
            console.log('Got response from:', url, type);
            if (type && type.includes('json')) {
                try {
                    const text = await response.text();
                    console.log('Data:', text.substring(0, 300));
                } catch(e) {}
            }
        }
    });

    console.log('Navigating...');
    await page.goto('https://www.miruro.to/watch/1?ep=1', { waitUntil: 'networkidle2' });
    
    // Wait for any extra requests
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await browser.close();
}

run().catch(console.error);
