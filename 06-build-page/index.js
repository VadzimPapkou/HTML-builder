const fs = require('fs/promises');
const path = require('path');

const ROOT_PATH = __dirname;
const COMPONENTS_PATH = path.join(ROOT_PATH, 'components');
const STYLES_PATH = path.join(ROOT_PATH, 'styles');
const DIST_PATH = path.join(__dirname, 'project-dist');

const fileExists = async path => !!(await fs.stat(path).catch(() => false));
const isCssFile = file => path.parse(file).ext === '.css';

async function main() {
  if(await fileExists(DIST_PATH)) {
    await fs.rm(DIST_PATH, {recursive: true});
  }
  await fs.mkdir(DIST_PATH);
  const components = await readComponents();

  const template = (await fs.readFile(path.join(ROOT_PATH, 'template.html'))).toString();
  const resultHtml = template.replace(/{{.+?}}/gi, (substring => {
    const componentName = substring.slice(2, -2);
    return components[componentName];
  }));

  await fs.writeFile(path.join(DIST_PATH, 'index.html'), resultHtml);
  await mergeStyles();
  await copyDir(path.join(ROOT_PATH, 'assets'), path.join(DIST_PATH, 'assets'));
}

async function readComponents() {
  const nodes = await fs.readdir(COMPONENTS_PATH);

  const components = await Promise.all(
    nodes.map(node => fs.readFile(path.join(COMPONENTS_PATH, node))
      .then(content => [path.parse(node).ext.slice(1), path.parse(node).name, content.toString()])
    )
  );

  const htmlComponents = components.filter(([ext]) => ext === 'html').map(component => component.slice(1));

  return Object.fromEntries(htmlComponents);
}

async function mergeStyles() {
  const nodes = await fs.readdir(STYLES_PATH);
  const nodesStats = await Promise.all(nodes.map(async function (node) {
    return await fs.lstat(path.join(STYLES_PATH, node));
  }));
  const nodesWithStats = nodes.map((node, i) => ({node, stats: nodesStats[i]}));
  const cssFiles = nodesWithStats.filter(({node, stats}) => stats.isFile() && isCssFile(node));
  const cssFilesContent = await Promise.all(cssFiles.map(({node}) => fs.readFile(path.join(STYLES_PATH, node))));

  const result = cssFilesContent.join('\n');
  return fs.writeFile(path.join(DIST_PATH, 'style.css'), result);
}

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

main();