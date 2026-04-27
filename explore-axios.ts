import axios from 'axios';

async function testPipe() {
    try {
        // {"path":"episodes","method":"GET","query":{"anilistId":"1"},"body":null,"version":"0.2.0"}
        const e1 = Buffer.from(JSON.stringify({"path":"episodes","method":"GET","query":{"anilistId":"1"},"body":null,"version":"0.2.0"})).toString('base64');
        console.log('e1:', e1);
        const res = await axios.get(`https://www.miruro.to/api/secure/pipe?e=${e1}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*'
            }
        });
        console.log('res 1:', res.data);
    } catch(e) {
        console.error('Error 1:', e.message);
        if (e.response) {
            console.error('Response:', e.response.status, e.response.data);
        }
    }
}
testPipe();
