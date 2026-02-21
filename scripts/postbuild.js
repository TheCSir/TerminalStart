import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const extDir = path.join(root, 'extension');
const distAssets = path.join(distDir, 'assets');
const extAssets = path.join(extDir, 'assets');

// 1. Extract hashed asset filenames from dist/index.html
const distHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

const jsMatch = distHtml.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
const cssMatch = distHtml.match(/href="\.\/assets\/(index-[^"]+\.css)"/);

if (!jsMatch || !cssMatch) {
    console.error('Could not find asset references in dist/index.html');
    process.exit(1);
}

const newJs = jsMatch[1];
const newCss = cssMatch[1];

// 2. Clear and copy assets folder
if (fs.existsSync(extAssets)) {
    fs.rmSync(extAssets, { recursive: true });
}
fs.mkdirSync(extAssets, { recursive: true });

for (const file of fs.readdirSync(distAssets)) {
    fs.copyFileSync(path.join(distAssets, file), path.join(extAssets, file));
}

// 3. Update newtab.html asset references
const newtabPath = path.join(extDir, 'newtab.html');
let newtab = fs.readFileSync(newtabPath, 'utf-8');

newtab = newtab.replace(
    /src="\.\/assets\/index-[^"]+\.js"/,
    `src="./assets/${newJs}"`
);
newtab = newtab.replace(
    /href="\.\/assets\/index-[^"]+\.css"/,
    `href="./assets/${newCss}"`
);

fs.writeFileSync(newtabPath, newtab);

console.log(`Extension updated: ${newJs}, ${newCss}`);
console.log(`Copied ${fs.readdirSync(extAssets).length} files to extension/assets/`);
