const fs = require('fs/promises');
const {createWriteStream} = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'text.txt');

async function main() {
  await fs.appendFile(OUTPUT, '');
  console.log('Ready for writing...');

  const ws = createWriteStream(OUTPUT);

  process.stdin.on('data', data => {
    const stringInput = data.toString();
    if(stringInput.startsWith('exit')) return process.emit('SIGINT');
    ws.write(stringInput);
  });

  process.on('SIGINT', () => {
    console.log('Bye');
    process.exit();
  });
}

main();