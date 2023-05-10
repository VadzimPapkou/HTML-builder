const path = require('path');
const fs = require('fs/promises');

async function readfiles(from) {
  const nodes = await fs.readdir(from);
  const nodesStats = await Promise.all(nodes.map(async function (node) {
    return await fs.lstat(path.join(from, node));
  }));
  const nodesWithStats = nodes.map((node, i) => ({node, stats: nodesStats[i]}));

  const result = nodesWithStats.filter(({stats}) => stats.isFile())
    .map(({node, stats}) => {
      const size = stats.size;
      const {name, ext} = path.parse(node);
      return [name, ext.slice(1), size].join(' - ');
    })
    .join('\n');
  console.log(result);
}

readfiles(path.join(__dirname, 'secret-folder'));