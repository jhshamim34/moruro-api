import fs from 'fs';

let js = fs.readFileSync('index.js', 'utf8');
let jweIndex = js.indexOf('decryptResponse');
console.log(js.substring(Math.max(0, jweIndex - 500), jweIndex + 1500));
