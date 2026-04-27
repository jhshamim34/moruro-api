import axios from 'axios';
import pako from 'pako';

async function testPipe() {
    try {
        const e1 = Buffer.from(JSON.stringify({"path":"episodes","method":"GET","query":{"anilistId":"1"},"body":null,"version":"0.2.0"})).toString('base64url');
        const res = await axios.get(`https://www.miruro.to/api/secure/pipe?e=${e1}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const n = res.headers['x-obfuscated'];
        const t = res.data;

        if (n) {
            let e = t.replace(/-/g, "+").replace(/_/g, "/");
            let r = e.length % 4;
            let i = e + (r ? "=".repeat(4 - r) : "");
            let a = Buffer.from(i, 'base64');
            
            const Lo = "71951034f8fbcf53d89db52ceb3dc22c";
            const Ro = new Uint8Array(Lo.match(/.{2}/g).map(x => parseInt(x, 16)));
            
            if (n === '2') {
                for (let j = 0; j < a.length; j++) {
                    a[j] ^= Ro[j % Ro.length];
                }
            }

            try {
                const decompressed = pako.inflate(a, { to: 'string' });
                const json = JSON.parse(decompressed);
                console.log('Got Episodes:', json.length, 'e.g.', Object.keys(json[0]));
            } catch (err) {
                 console.log('Failed standard inflate, trying inflateRaw');
                 const decompressed = pako.inflateRaw(a, { to: 'string' });
                 const json = JSON.parse(decompressed);
                 console.log('Got Episodes:', json.length, 'e.g.', Object.keys(json[0]));
            }
        }
    } catch(e) {
        console.error('Error 1:', e.message);
    }
}
testPipe();
