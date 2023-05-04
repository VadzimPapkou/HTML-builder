const path = require('path');
const fs = require('fs/promises');

const STYLES_SRC_PATH = path.join(__dirname, 'styles');
const OUTPUT_PATH = path.join(__dirname, 'project-dist');

function isCssFile(file) {
  return path.parse(file).ext === '.css';
}

async function main() {
  const nodes = await fs.readdir(STYLES_SRC_PATH);
  const nodesStats = await Promise.all(nodes.map(async function (node) {
    return await fs.lstat(path.join(STYLES_SRC_PATH, node));
  }));
  const nodesWithStats = nodes.map((node, i) => ({node, stats: nodesStats[i]}));
  const cssFiles = nodesWithStats.filter(({node, stats}) => stats.isFile() && isCssFile(node));
  const cssFilesContent = await Promise.all(cssFiles.map(({node}) => fs.readFile(path.join(STYLES_SRC_PATH, node))));

  const result = cssFilesContent.join('\n');
  fs.writeFile(path.join(OUTPUT_PATH, 'bundle.css'), result);
}

main();