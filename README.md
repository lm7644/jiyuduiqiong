# 积玉堆琼 · 丽江五族文化线上展馆

国内首个地市级多民族"资源聚合型"线上文化展馆——丽江五族（纳西、彝、傈僳、白、普米）与摩梭人的文化叙事，全部内容基于公开权威资料策展，图片来自 Wikimedia Commons 开放授权并逐图署名。

**仓库地址**：<https://github.com/lm7644/jiyuduiqiong>（公开仓库；静态站可直接双击 `index.html` 浏览，线上地址见下文）

> 说明：本仓库已转为 Public 并启用 GitHub Pages，线上地址 <https://lm7644.github.io/jiyuduiqiong/>（实测 HTTP 200）。

![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg) ![Content: CC BY-NC-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--NC--SA%204.0-lightgrey.svg) ![Static](https://img.shields.io/badge/Build-None-green.svg) ![Mobile](https://img.shields.io/badge/Mobile-Verified-brightgreen.svg)

## 项目亮点

- **三个互动展项**：东巴文字谱（13 字看图识字 + 猜字闯关 + 浏览器原生朗读）、影音推荐（与五族文化相关的影视与音乐清单）、Three.js 三维展厅（16 幅环形展墙，WebGL 不可用自动降级平面画廊）
- **东巴文献全球流散地图**：约 3 万册东巴经的跨大洲流散长卷（横向拖动）
- **诚实的策展**：每条事实附来源；非遗"民族共有、属地申报"边界如实标注；未核实项公开列出
- **零构建纯静态**：无任何运行时依赖，双击 `index.html` 即可离线打开（三维展厅为 ES Module，`file://` 下会自动降级为平面画廊）

## 本地查看

直接双击 `index.html`（零依赖、零构建，可离线打开）。

## 开源与部署

**完整步骤见 [`docs/上线清单.md`](docs/上线清单.md)**。许可为分层式：代码与样式 MIT；原创策展文字 CC BY-NC-SA 4.0（与站内声明一致）；图片按各自原始许可再分发（署名已逐图保留）——详见 [LICENSE](LICENSE)。

### 最短开源 + 上线路径（GitHub Desktop，无需命令行）

1. 安装 [GitHub Desktop](https://desktop.github.com/) → File → Add local repository → 选本文件夹（首次会提示 Create repository，可见性选 **Public**）
2. 填仓库名（建议 `jiyuduiqiong`）→ Publish
3. 网页端 Settings → Pages → Branch 选 `main` / `(root)` → Save → 约 1 分钟后 `https://lm7644.github.io/jiyuduiqiong/` 即已上线
4. （推荐）再用 Cloudflare Pages 连接同一仓库自动部署：免备案、支持 `_headers` 安全头、速度通常更好——两者可并存

### 命令行等价操作

```bash
cd jiyuduiqiong
git init && git add -A && git commit -m "feat: 积玉堆琼 v2.2 初始开源"
git branch -M main
git remote add origin https://github.com/lm7644/jiyuduiqiong.git
git push -u origin main
```

## 结构

```
index.html        首页（主视觉/五族入口/人口比例条/互动区）
naxi.html         纳西族馆（东巴文化体系/六项国家级非遗）
mosuo.html        摩梭人专题（母系家庭/达巴文化）
yi / lisu / bai / pumi.html   彝·傈僳·白·普米四馆
heritage.html     三项世界遗产 + 8 项国家级非遗
dongba.html       东巴文献全球流散长卷（横向拖动）
glyphs.html       东巴文字谱（13 字互动识字 + 猜字闯关）
gallery.html      三维展厅（Three.js 环形展墙，自动降级平面画廊）
audio.html        影音推荐（与五族文化相关的影视 / 音乐清单）
timeline.html     大事年表（24 帧，可按时代筛选）
resources.html    资源目录（51 条核实外链，可搜索/筛选）
about.html        方法论·授权·诚实的未核实清单
404.html          迷路页
sitemap.xml / robots.txt / _headers
docs/             开发方案 / 更新日志 / 上线清单
tools/check.js    零依赖静态自检（元信息/重复 id/图片 alt/内链/占位符）
assets/           main.css / app.js / 73 张开放授权图片（img/th 为展厅纹理，共约 28MB）
```

## 自检

```bash
node tools/check.js
```

零依赖，校验 18 个页面的元信息、标题层级、重复 id、图片替代文本、内链与锚点、占位符残留、移动端可读性守卫；任何一项不通过即以非零码退出。

## 内容原则

1. 每条事实附来源；两说并存如实注明；未核实项在 about.html 公开列出
2. 非遗"民族共有、属地申报"边界如实标注（如东巴纸申报地为香格里拉、火把节为楚雄/凉山）
3. 涉宗教内容一律学术性描述；摩梭叙事拒绝猎奇化
4. 图片 CC0/公有领域/CC BY/CC BY-SA 逐图署名；原创文字注明出处即可非商业转载

详细设计决策见 `docs/最终开发方案.md` 与上级目录的《丽江线上民族文化博物馆-调查报告.md》。
