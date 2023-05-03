const fs = require('fs');
const path = require('path');

async function main() {
  fs.createReadStream(path.join(__dirname, 'text.txt'))
    .pipe(process.stdout);
}

main();