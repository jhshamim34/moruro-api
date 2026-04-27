import axios from 'axios';
import pako from 'pako';

async function testPipe() {
    try {
        const e1 = Buffer.from(JSON.stringify({"path":"episodes","method":"GET","query":{"anilistId":"1"},"body":null,"version":"0.2.0"})).toString('base64url');
        console.log('e1:', e1);
        const res = await axios.get(`https://www.miruro.to/api/secure/pipe?e=${e1}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*'
            }
        });
        
        console.log('headers:', res.headers);
        const n = res.headers['x-obfuscated'];
        const t = res.data; // this is the base64url text presumably
        console.log('x-obfuscated header:', n);

        if (n) {
            let e = t.replace(/-/g, "+").replace(/_/g, "/");
            let r = e.length % 4;
            let i = e + (r ? "=".repeat(4 - r) : "");
            let a = Buffer.from(i, 'base64');
            console.log('Raw buf len:', a.length);

            // if n === '2' it uses Ro (XOR) - we will need to find Ro!
            // if n === '1' it just uses GZIP
            if (n === '1') {
                const decompressed = pako.inflateRaw(a, { to: 'string' }); // or inflate
                console.log('Decompressed:', decompressed.substring(0, 500));
            } else if (n === '2') {
                console.log('Needs XOR key Ro!');
            }
        }
    } catch(e) {
        console.error('Error 1:', e.message);
    }
}
testPipe();
