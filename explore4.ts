import axios from 'axios';
async function test() {
    try {
        const response = await axios.get('https://anisnatch.top/dubbed', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log('Status', response.status);
        console.log('Headers', response.headers);
    } catch(err) {
        console.log('Error', err.response?.status, err.response?.headers);
    }
}
test();
