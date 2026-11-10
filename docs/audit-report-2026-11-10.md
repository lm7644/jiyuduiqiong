# 积玉堆琼（jiyuduiqiong）全面审查报告

- 审查日期：2026-11-10
- 审查对象：GitHub 仓库 `lm7644/jiyuduiqiong`（branch `main`），线上地址 https://lm7644.github.io/jiyuduiqiong/
- 审查范围：代码质量、安全漏洞、依赖风险、配置问题；逐页视觉与交互（布局 / 响应式 / 图片加载 / 文字排版 / 链接可用性）；可补充内容调研。
- 审查方式：只读审查。**本次审查未修改任何仓库代码**（详见文末「修改声明」）。

---

## 0. 总体结论

这是一个完成度与工艺水平都相当高的零构建静态站（HTML/CSS/原生 JS + 本地 vendor 的 Three.js）。

优点（已实测验证）：
- 18 页在真实 390px 移动视口下**全部无横向溢出**，汉堡按钮正常显示、网格正确折行。
- 交互全部可用：移动导航开合、图片灯箱、资源分类筛选与搜索、东巴字谱闯关判分、年表筛选。
- WebGL 三维展厅（gallery.html）可正常渲染（headless + SwiftShader 验证）。
- 65 条外链 + 13 条字形 Commons 链接**无真实 404 死链**。
- a11y 基础扎实：skip link、focus-visible、prefers-reduced-motion、44px 触控目标、sr-only、打印样式、safe-area。
- 内容态度诚实：about.html 有「诚实的局限清单」，未核实数据如实标注。

问题集中在：**安全配置未落地、命名/计数一致性、渐进增强、社交分享元数据、个别依赖与性能打磨**。无阻断性缺陷。

---

## 1. 问题清单（按严重程度分级）

### 🔴 严重（Critical）

**C-1 会话中明文泄露的 GitHub Fine-grained PAT 必须立即撤销/轮换。**
该 token 曾以明文出现在审查请求的聊天内容中，应视为已泄露。请到 GitHub → Settings → Developer settings → Fine-grained tokens 撤销并重新签发最小权限 token。审查过程仅以临时请求头方式只读使用该 token，未将其写入任何项目文件、记忆或提交。

### 🟠 高（High）

**H-1 安全响应头在 GitHub Pages 上完全不生效，且 CSP 本身过弱。**
- 实测线上响应头**仅含 HSTS**；仓库根 `_headers` 中的 `X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy / CSP / Cache-Control` 全部被 GitHub Pages 忽略（`_headers` 仅 Cloudflare Pages / Netlify 识别）。
- 即便生效，现有 CSP 只有 `frame-ancestors 'none'; base-uri 'self'; form-action 'self'`，**缺少 `default-src` / `script-src`**，几乎无防 XSS 能力。
- 建议：按 README 既定方案迁移到 Cloudflare Pages 使 `_headers` 生效；或退而用 `<meta http-equiv="Content-Security-Policy">` 兜底；并补全形如 `default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' <字体CDN>; font-src 'self' <字体CDN>; frame-ancestors 'none'` 的策略。

### 🟡 中（Medium）

**M-1 外部 CDN 样式无 SRI，且违背「零依赖 / 可离线」宣称。**
`lisu.html:16` 引入 `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-lisu@5/index.css`，无 `integrity` / `crossorigin` → 供应链投毒风险 + 国内可用性风险。建议将 OFL 许可的 woff2 字体本地 vendor 化（与 three.js 一致），或至少加 SRI + 本地 fallback。

**M-2 许可与署名仍用旧站名，法律 attribution 不一致。**
`LICENSE` 头部与内容署名写「江流有声 / Jiangliu Yousheng」，而现站名为「积玉堆琼」；`assets/js/app.js` 与 `assets/css/main.css` 头注释又是另一旧名「金生丽水」。CC BY-NC-SA 的署名必须与现站名统一，否则授权链有瑕疵。建议全仓统一为「积玉堆琼」。

**M-3 资源计数自相矛盾。**
`resources.html` 的 meta / h1 称「60 余条」，实测仅 **51** 条外链（README 与 index 亦写 51）。建议改文案为准确数字或补齐链接。

**M-4 禁用 JS 时正文不可见（渐进增强缺口）。**
`assets/css/main.css:550` `.rv{opacity:0}` 依赖 IntersectionObserver 加 `.in` 才显示；无 JS 环境下整页正文隐藏。建议默认可见、仅在有 JS 时加类做入场动画，或加 `<noscript>` 覆罩 `.rv{opacity:1;transform:none}`。

**M-5 og:image 为相对路径（17 页）。**
社交抓取器要求绝对 URL，相对路径导致分享卡片无图。建议统一改为 `https://lm7644.github.io/jiyuduiqiong/assets/img/…`；sitemap.xml 的 `<loc>` 同理应为绝对 URL。

### 🟢 低（Low）

**L-1 87 个 `<img>` 缺少 width/height** → CLS 风险。`figure.fig img` 有 `aspect-ratio:4/3` 缓解了一部分，其余建议补固有尺寸或 aspect-ratio。
**L-2 8 张 eager 图片**，其中部分在折叠线以下（如 `pumi.html:113-114`）→ 改 `loading="lazy"`。
**L-3 index.html 有 6 处内联 `onmouseover/onmouseout`**（约 171/177/183 行）→ 不利 CSP 与维护，改 CSS `:hover` 或 JS 监听。
**L-4 resources.html 有 4 条 `http://` 外链** → 尽量升级 https（混合内容与隐私考量）。
**L-5 灯箱 / 展厅用 `innerHTML` 注入说明**（`assets/js/app.js:113` `lbCap.innerHTML = cap.innerHTML`；gallery 内静态数据 innerHTML）。当前数据全静态故风险低；若未来接外部数据需改 `textContent` 或转义（防御纵深）。
**L-6 字谱详情弹层 `role=dialog aria-modal=true` 但无焦点陷阱 / 焦点归还** → a11y 补全。
**L-7 命名不一致**：`glyphs.html:85,217` 导航 / 页脚写「语音导览」，他页为「影音推荐」；`about.html:109` 称 Three.js 走 CDN 实为本地 vendor（`gallery.html:210` import 本地 `./assets/js/vendor/three.module.js`）。建议统一文案。
**L-8 Three.js 为 r160（约 2 年前）且未压缩 1.27MB**（`assets/js/vendor/three.module.js` `REVISION='160'`）。无已知高危 CVE，但建议升级 + 压缩以减负。
**L-9 三维展厅墙面说明牌在 headless 下呈空白白条**（canvas 纹理文字疑似字体未就绪即绘制）。需真实浏览器复核，属待确认项，非定论缺陷。
**L-10 `tools/check.js` 仅正则检查根级 HTML**，覆盖不足。建议纳入本次审计项（og:image 绝对化、img 尺寸、计数一致性、内联事件、http 外链）。

---

## 2. 已验证无问题项（避免误报）

- **移动响应式**：用「同源 srcdoc iframe 固定 390px」探针实测 18 页，`iframeInnerWidth=390`、`scrollWidth=375`、`overflow=false`、`menuBtnDisplay=block`（404 无头部故 none）、stats 折为单列（`335px`）。dongba 的横卷（strip right=2100）与 gallery 字幕（gal-cap right=725）超宽是**有意的横向滚动 / 离屏容器**，不造成文档溢出，非缺陷。
  - 说明：headless Chrome 直接以 `--window-size=390` 截移动图会产生「布局视口偏宽再裁切」的假象（看似溢出 / 汉堡消失），已用探针排除，**不构成真实移动端缺陷**。
- **交互**（探针模拟点击）：index 移动导航开 / 合、灯箱打开均 true；resources 分类 lang 显示 8 条且全匹配；glyphs 闯关开始 / 判分 / 计数（`1 / 10 · 答对 0`）正常；timeline 4 个筛选 chip、筛选后 9 条可见。资源「搜索 + 分类」为交集逻辑（正确 UX）。
- **链接**：65 条外链无真实 404；报告中的 `000/403/412` 为网络阻断 / 反爬假象（Google/Wikipedia 000、loc.gov/europeana 403、zhongguoyuyan 412），非死链。13 条字形 Commons 链接 12 条 200，`rain` 为瞬时限流（本地 `glyph-rain.png` 存在）。
- **桌面视觉**：18 页桌面截图排版 / 字体 / 图片加载正常；WebGL 三维展厅渲染正常。
- **图片资产**：除本地下载截断的两文件外（见文末），其余图片均正常解码（naturalWidth>0）。

---

## 3. 结构审计统计（18 页全量）

| 指标 | 数值 |
|---|---|
| 页面数 | 18 |
| 结构性错误（lang/viewport/title/h1/重复 id/锚点/内部引用） | 0 |
| 缺 width/height 的 img | 87 |
| eager 图片 | 8 |
| og:image 相对路径页 | 17 |
| index 内联事件 | 6 |
| resources http:// 外链 | 4 |
| resources 外链总数 | 51 |

---

## 4. 可补充内容调研（含来源）

- **真实音频**（audio.html 目前仅 Web Speech TTS，无真实录音）：接入开放语言档案 ELAR（https://www.elararchive.org/）、PARADISEC（https://www.sydney.edu.au/music/our-research/paradisec.html）的纳西 / 傈僳田野录音；以及北大「东巴文化数字人文实践基地」采集的东巴语音文献、《创世纪》活态演述抢救性影音记录。
- **古籍库直链**：补云南古籍数字图书馆具体库地址 http://msq.ynlib.cn/#/index（现仅连 ynlib 主站）；识典古籍东巴文汉文合璧《创世纪》知识库直达页。
- **2026 新进展**：院藏 3700 余册高清数字化、2025 首批 900 册定级、498 万字译注、「东巴文天气预报」短视频（点赞超 45 万）、法国阿尔比数字图书馆「云出海」、与国家版本馆珍贵版本数字化合作。
- **非遗名录补全**：第五批国家级新增永胜珐琅银器、三多节、普米族拈达则封山仪式、纳西族童谣（扩展），凑足「8 项国家级」口径；普米「搓蹉」、吾昔节可充实普米馆。

来源：
- 云南省民宗委《丽江市数字守护千年东巴文》2026-02：http://mzzj.yn.gov.cn/html/2026/difangdongtai_0214/4062763.html
- 云南网 2026-01：https://m.yunnan.cn/system/2026/01/14/033827577.shtml
- 新华网《云南一批少数民族文字古籍首次"登上云端"》2024-09：https://www.xinhuanet.com/ci/20240920/d5747a3198944479b997e75784429cc5/c.html
- 丽江文旅《三大世界遗产，八大国家级非遗》：http://www.ljhyw.com/view-1296.html
- ELAR：https://www.elararchive.org/
- PARADISEC：https://www.sydney.edu.au/music/our-research/paradisec.html

---

## 5. 修复优先级建议

1. **C-1** 撤销 / 轮换泄露 token（用户操作，最优先）。
2. **H-1** 让安全头真正生效（迁 Cloudflare Pages 或 meta CSP 兜底）+ 补全 CSP。
3. **M-1** 字体本地化 / SRI。
4. **M-2 / M-3** 统一署名与资源计数。
5. **M-4 / M-5** noscript 覆罩 + og:image / sitemap 绝对化。
6. 其余 L 级为打磨项，可批量处理。

---

## 6. 修改声明

- 本次审查为**只读审查，未修改任何仓库代码 / 内容 / 配置**。
- 审查中曾在本地副本临时创建 `_probe.html` / `_probe2.html` 两个测量探针，**已删除**，未上传、未进入仓库。
- 本地副本与远端逐文件 git-blob SHA 比对：122 个 blob 中 120 个完全一致；仅 `assets/img/dongba-script-2.jpg` 与 `assets/img/map-pumi.png` 两文件本地字节数小于远端（下载截断损坏，属本地副本 artifacts），**非人为修改，亦未上传**（上传反而会破坏远端完好文件）。远端仓库保持原样、完好。
- 本文档为审查后新增的唯一交付文件。