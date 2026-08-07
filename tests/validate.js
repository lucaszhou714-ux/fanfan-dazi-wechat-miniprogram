const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };

const app = JSON.parse(read('miniprogram/app.json'));
JSON.parse(read('project.config.json'));
JSON.parse(read('miniprogram/sitemap.json'));
assert(read('miniprogram/config.js').includes('envId'), 'Missing cloud environment configuration');
assert(app.pages.length === 11, 'Expected eleven configured pages');

for (const page of app.pages) {
  for (const ext of ['js', 'json', 'wxml', 'wxss']) {
    const file = path.join(root, 'miniprogram', `${page}.${ext}`);
    assert(fs.existsSync(file), `Missing page artifact: ${file}`);
    if (ext === 'json') JSON.parse(fs.readFileSync(file, 'utf8'));
  }
}

const dishText = read('miniprogram/utils/dishes.js');
assert((dishText.match(/\['/g) || []).length >= 40, 'Expected at least 40 seed dishes');

for (const file of fs.readdirSync(path.join(root, 'miniprogram/pages'))) {
  const wxmlPath = path.join(root, 'miniprogram/pages', file, `${file}.wxml`);
  if (!fs.existsSync(wxmlPath)) continue;
  const xml = fs.readFileSync(wxmlPath, 'utf8');
  assert(!/<b(?:\s|>)/.test(xml), `Unsupported b element in ${wxmlPath}`);
  const opens = (xml.match(/<view(?:\s|>)/g) || []).length;
  const closes = (xml.match(/<\/view>/g) || []).length;
  assert(opens === closes, `Unbalanced view elements in ${wxmlPath}: ${opens}/${closes}`);
}

const cloud = read('cloudfunctions/sync/index.js');
for (const action of ['push','pull','createInvite','joinInvite','shareDraw','unbind']) assert(cloud.includes(`case '${action}'`), `Missing cloud action ${action}`);
console.log('PASS: project structure, JSON, WXML balance, dish seed, and cloud actions validated.');
