/* 零依赖静态自检：node tools/check.js
   覆盖：元信息、标题层级、重复 id、图片替代文本、内链与锚点、
   外链协议、占位符残留、移动端可读性守卫、关键文件存在性 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const errors = [];
const warns = [];
const err = (f, m) => errors.push(f + ': ' + m);

const strip = s => s.replace(/<!--[\s\S]*?-->/g, '');
const fileCache = {};
const read = f => (fileCache[f] || fs.readFileSync(path.join(ROOT, f), 'utf8'));

for (const f of PAGES) {
  const s = strip(read(f));

  if (!/<html[^>]+lang="zh-CN"/.test(s)) err(f, '缺少 html lang="zh-CN"');
  if (!/name="viewport"/.test(s)) err(f, '缺少 viewport');
  if (!/<title>[^<]+<\/title>/.test(s)) err(f, '缺少 title');
  if (f !== '404.html' && !/name="description"/.test(s)) err(f, '缺少 meta description');

  const h1 = (s.match(/<h1\b/g) || []).length;
  if (h1 !== 1) err(f, 'h1 数量应为 1，实际 ' + h1);

  const ids = (s.match(/\bid="([^"]+)"/g) || []).map(x => x.slice(4, -1));
  const seen = {};
  ids.forEach(id => { seen[id] = (seen[id] || 0) + 1; });
  Object.keys(seen).filter(k => seen[k] > 1).forEach(k => err(f, '重复 id="' + k + '" ×' + seen[k]));

  (s.match(/<img\b[^>]*>/g) || []).forEach(tag => {
    if (!/\balt\s*=/.test(tag)) err(f, 'img 缺少 alt: ' + tag.slice(0, 60));
  });
  (s.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []).forEach(tag => {
    if (!/rel="[^"]*noopener/.test(tag)) warns.push(f + ': target=_blank 未带 rel=noopener');
  });

  // 内链、图片、脚本、样式资源必须存在（区分大小写）
  const refs = (s.match(/(?:href|src)="([^"#?:]+(?:\.html|\.css|\.js|\.jpg|\.jpeg|\.png|\.webp|\.svg|\.xml|\.txt|\.ico|\.woff2?))"/g) || [])
    .map(x => x.split('="')[1].slice(0, -1));
  refs.forEach(r => {
    if (/^https?:/.test(r)) return;
    if (!fs.existsSync(path.join(ROOT, r))) err(f, '引用资源不存在: ' + r);
  });

  // 锚点必须落在本页 id 上
  (s.match(/href="#([^"]+)"/g) || []).forEach(x => {
    const id = x.slice(7, -1);
    if (id && !new RegExp('id="' + id + '"').test(s)) err(f, '锚点目标不存在: #' + id);
  });

  if (/TODO|FIXME|待补|占位|https:\/\/<|你的用户名|your-name|<user>/.test(s)) err(f, '存在占位符或待办标记');
  (s.match(/href="http:\/\//g) || []).forEach(() => warns.push(f + ': 存在 http 明文外链'));
}

// 移动端可读性与触控守卫
const css = read('assets/css/main.css');
if (!/min-height:\s*44px/.test(css)) err('assets/css/main.css', '缺少 44px 触控目标规则');
if (!/@media\s*\(max-width:\s*760px\)/.test(css)) err('assets/css/main.css', '缺少移动端断点');
if (!/font-size:\s*16px/.test(css)) err('assets/css/main.css', '缺少 16px 正文规则');
if (!/env\(safe-area-inset/.test(css)) warns.push('main.css: 未处理安全区');

// 站点级文件
['sitemap.xml', 'robots.txt', '_headers', 'LICENSE'].forEach(f => {
  if (!fs.existsSync(path.join(ROOT, f))) err('root', '缺少 ' + f);
});
const sm = read('sitemap.xml');
if (/<loc>\.?\//.test(sm) || !/<loc>https?:/.test(sm)) warns.push('sitemap.xml: loc 建议使用绝对地址（部署域名确定后替换）');
const rb = read('robots.txt');
if (!/Sitemap:\s*https?:/.test(rb)) warns.push('robots.txt: Sitemap 建议使用绝对地址');

// HTML 页面必须都在 sitemap 中（404 除外）
PAGES.filter(p => p !== '404.html').forEach(p => {
  if (!sm.includes(p)) warns.push('sitemap.xml: 未收录 ' + p);
});

console.log('检查页面 ' + PAGES.length + ' 个');
warns.forEach(w => console.log('WARN  ' + w));
if (errors.length) {
  errors.forEach(e => console.log('ERROR ' + e));
  console.log('\n失败：' + errors.length + ' 项错误，' + warns.length + ' 项提醒');
  process.exit(1);
}
console.log('通过：0 项错误，' + warns.length + ' 项提醒');
