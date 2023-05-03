const fs = require('fs/promises');
const {createWriteStream} = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'text.txt');

async function main() {
  await fs.writeFile(OUTPUT, '');
  console.log('Ready for writing...');

  process.stdin.pipe(
    createWriteStream(OUTPUT)
  );

  process.on('SIGINT', () => {
    console.log('Bye');
    process.exit();
  });
}

main();