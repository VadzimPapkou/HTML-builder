const fs = require('fs/promises');
const path = require('path');

const FROM = path.join(__dirname, 'files');
const TO = path.join(__dirname, 'files-copy');

async function copyDir(from, to) {
  await fs.mkdir(to);
  const nodes = await fs.readdir(from);
  const nodeTypes = await Promise.all(nodes.map(async function (node) {
    const stats = await fs.lstat(path.join(from, node));
    return stats.isDirectory() ? 'dir' : 'file';
  }));
  const typedNodes = nodes.map((node, i) => ({node, type: nodeTypes[i]}));
  for (let i = 0; i < typedNodes.length; i++) {
    const {node, type} = typedNodes[i];
    if (type === 'dir') {
      await copyDir(path.join(from, node), path.join(to, node));
    } else {
      await fs.copyFile(path.join(from, node), path.join(to, node));
    }
  }
}

fs.rm(TO, {recursive: true})
  .then(() => copyDir(FROM, TO));
