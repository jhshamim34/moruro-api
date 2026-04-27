import axios from 'axios';
async function test() {
    try {
        const { data } = await axios.get('https://anisnatch.top/assets/script/ajax.min.js');
        console.log(data);
    } catch(err) {
        console.log("Failed", err.message);
    }
}
test();
