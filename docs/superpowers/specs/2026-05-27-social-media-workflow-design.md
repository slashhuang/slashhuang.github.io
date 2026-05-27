# 社媒工作流系统设计文档

> 统一创作、多平台适配、自动生成的个人社媒工作台。

## 1. 概述

将现有 VuePress 博客仓库改造成**个人工作台**，实现：
- **统一创作**：一篇 Markdown 源文件，通过 frontmatter 标注目标平台
- **多平台适配**：自动转换为博客、微信公众号、小红书三种格式
- **内容预览与导出**：在 Web 工作台中实时预览各平台效果，支持复制、下载和截图导出
- **目录重构**：个人博客内容与社媒工作台内容分离管理

## 2. 目录结构

```
slashhuang.github.io/
├── content/                          # 统一内容仓库（新增）
│   ├── posts/                        # 主内容源文件
│   │   └── 2026-05-27-my-first-post.md
│   ├── generated/                    # 自动生成的各平台版本（只读）
│   │   ├── blog/                     # 博客版 Markdown
│   │   ├── wechat/                   # 微信公众号 HTML 预览
│   │   ├── xiaohongshu/              # 小红书 HTML 卡片 → 截图 PNG
│   │   │   ├── cards/               # HTML 卡片模板渲染结果
│   │   │   └── screenshots/         # Puppeteer 截图输出（PNG）
│   └── ideas/                        # 碎片化想法/笔记
│
├── workspace/                        # 工作台 UI（新增）
│   ├── src/
│   │   ├── views/                    # 页面：内容列表、编辑器、预览
│   │   ├── components/               # 编辑器、预览面板等
│   │   └── services/                 # 内容转换 API 调用
│   └── dist/                         # 构建产物 → VuePress /workspace/ 路由
│
├── engine/                           # 内容转换引擎（新增）
│   ├── src/
│   │   ├── parser.ts                 # 解析 frontmatter + Markdown
│   │   ├── transformers/
│   │   │   ├── blog.ts               # 博客版 Markdown 转换
│   │   │   ├── wechat.ts             # 微信公众号 HTML 转换
│   │   │   └── xiaohongshu.ts        # 小红书 HTML 卡片转换
│   │   ├── renderer/
│   │   │   ├── templates/            # HTML 卡片模板（卡片风格、渐变、引用等）
│   │   │   ├── card-generator.ts     # 生成精美 HTML 卡片
│   │   │   └── screenshot.ts         # Puppeteer 截图渲染
│   │   ├── exporter.ts               # 导出到 generated/
│   │   └── dev-server.ts             # 开发模式热更新
│   ├── cli.ts                        # CLI 入口
│   └── package.json
│
├── docs/                             # 原有 VuePress 博客（保留）
│   └── .vuepress/                    # VuePress 配置（扩展 workspace 路由）
│
├── docs_old/                         # 旧内容（保留但归档）
├── plugins/                          # VuePress 插件（保留）
└── scripts/                          # 构建脚本（扩展）
```

## 3. 内容格式

### 3.1 源文件（`content/posts/*.md`）

```yaml
---
title: "文章标题"
date: 2026-05-27
cover: /assets/covers/cover.jpg
targets:
  - blog
  - wechat
  - xiaohongshu
tags: [AI, 效率, 工具]
summary: "摘要内容，用于小红书和公众号摘要"
wechat:
  digest: "公众号推送摘要"
  author: "slashhuang"
  original: true
xiaohongshu:
  title_override: "小红书标题"
  hashtags: ["#AI工具", "#效率提升"]
  card_style: "gradient"              # 卡片风格: gradient / quote / minimal / code
  theme: "light"                      # 亮色/暗色主题
  split_mode: "auto"                  # 长文自动分段: auto / manual
blog:
  category: "技术教程"
  pinned: false
---

# 正文内容...
```

### 3.2 各平台输出格式

| 平台 | 输出格式 | 特点 |
|------|---------|------|
| 博客 | Markdown（与源文件基本一致） | 完整内容，代码块、TOC、SEO 保留 |
| 微信公众号 | HTML（带内联 CSS 排版） | 去除代码块/TOC，段落间距优化，适配微信编辑器 |
| 小红书 | HTML 精美卡片 → PNG 截图 | 渐变/引用/极简等多种卡片风格，自动分段，支持亮暗主题，输出图片直接可用 |

## 4. 工作台 UI

### 4.1 路由结构

```
/workspace/              - 内容列表页
/workspace/edit/:id      - 编辑器页（左侧 Markdown 编辑器 + 右侧多平台预览）
/workspace/preview/:id   - 纯预览页（三栏 Tab：博客/微信/小红书）
/workspace/ideas/        - 想法/笔记管理页
```

### 4.2 核心组件

- **ContentList**: 内容列表，支持筛选、搜索、状态展示
- **MarkdownEditor**: 基于 Monaco Editor 的 Markdown 编辑器
- **PlatformPreview**: 平台预览切换组件（博客/微信/小红书）
- **WechatPreview**: 微信公众号 HTML 渲染预览（模拟微信样式）
- **XiaohongshuPreview**: 小红书 HTML 卡片预览（模拟小红书样式，支持卡片风格切换、分段预览、一键截图下载）
- **ExportPanel**: 导出面板（复制、下载、生成全部、批量截图）

### 4.3 技术选型

- 编辑器: Monaco Editor 或 CodeMirror 6
- 预览渲染: Markdown-it + 平台特定模板
- 状态管理: Vue 3 `ref/reactive`
- 路由: Vue Router（与 VuePress 集成）

## 5. 数据流

```
创作 (Workspace 编辑) → content/posts/*.md
  ↓
转换引擎 (engine/) → 解析 frontmatter + Markdown → 按 targets 分支转换
  ↓
生成到 content/generated/{blog,wechat,xiaohongshu}/
  ↓
Workspace UI 读取 generated/ → 实时预览 → 复制/导出
```

## 6. 构建集成

### 6.1 npm scripts

| 命令 | 行为 |
|------|------|
| `pnpm dev` | VuePress 开发服务器 + 自动监听 content/posts/ 变更 |
| `pnpm build` | 引擎生成 generated/blog/ → 链接到 docs/ → VuePress 构建 |
| `pnpm workspace:dev` | 单独启动工作台开发模式 |
| `pnpm transform` | CLI：手动触发内容转换 |
| `pnpm transform new` | CLI：创建新内容模板 |
| `pnpm transform preview` | CLI：预览指定文件的指定平台输出 |

### 6.2 开发模式热更新

- `content/posts/` 文件变更 → chokidar 监听 → 触发引擎重新转换 → 刷新 workspace 预览
- VuePress HMR 自动更新博客页面

## 7. 技术栈

| 部分 | 技术 |
|------|------|
| 转换引擎 | Node.js + TypeScript |
| Markdown 解析 | Markdown-it |
| 微信公众号 HTML | 自定义模板引擎（ejs/handlebars） |
| 小红书 HTML 卡片 | 自定义 Vue 组件模板 + CSS 渐变/排版 |
| 截图渲染 | Puppeteer（headless Chrome 截图） |
| 工作台 UI | Vue 3 + Vue Router |
| 编辑器 | Monaco Editor / CodeMirror 6 |
| 文件监听 | chokidar |
| 构建 | Vite (workspace) + VuePress (博客) |

## 8. 小红书卡片渲染

### 8.1 渲染流程

```
Markdown 源内容 → 提取文本段落 → 按卡片模板渲染 HTML → Puppeteer 截图 → PNG
```

1. **内容提取**：从源 Markdown 提取标题、正文段落、代码块、标签
2. **分段**：根据字数自动拆分（单卡片 300-500 字），或手动指定分段
3. **卡片模板渲染**：每个段落注入对应的 HTML 卡片模板（带内联 CSS）
4. **截图**：Puppeteer 打开 HTML，设置 viewport 为小红书推荐尺寸（3:4），截图输出 PNG

### 8.2 卡片风格

| 风格 | 用途 | 示例 |
|------|------|------|
| `gradient` | 通用内容，渐变背景 | 渐变色背景 + 标题 + 正文 + 标签 |
| `quote` | 金句/核心观点 | 大字引用样式，居中排版 |
| `code` | 代码分享 | 代码高亮 + 简要说明，等宽字体 |
| `minimal` | 极简风格 | 纯白/浅灰背景 + 文字 + 底部署名 |
| `list` | 清单/要点 | 编号列表 + 图标 |

### 8.3 小红书卡片 HTML 模板结构

```html
<div class="xhs-card" style="width: 1080px; padding: 80px; font-family: ...">
  <div class="card-header">
    <div class="title">标题文字</div>
    <div class="author">@slashhuang</div>
  </div>
  <div class="card-body">
    <p>正文段落...</p>
  </div>
  <div class="card-footer">
    <span class="tag">#AI工具</span>
    <span class="tag">#效率提升</span>
  </div>
</div>
```

- 所有 CSS 内联，确保截图一致性
- 卡片尺寸：1080×1440px（3:4 比例，小红书推荐）
- 支持自定义主题色、背景渐变角度、字体大小

### 8.4 截图流程

```typescript
// engine/src/renderer/screenshot.ts
async function captureCard(html: string, options: {
  width: number = 1080,
  height: number = 1440,
  deviceScaleFactor: number = 2,
}): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: options.width, height: options.height, deviceScaleFactor })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const buffer = await page.screenshot({ type: 'png', quality: 95 })
  await browser.close()
  return buffer
}
```

### 8.5 工作台卡片实时预览

- 工作台中使用与截图引擎相同的 CSS 模板（Vue 组件复用）
- 左侧编辑 Markdown，右侧实时渲染 HTML 卡片预览（非截图，纯 DOM 渲染）
- 「生成截图」按钮：调用 Puppeteer 截图后端，下载 PNG
- 支持卡片风格切换、主题切换、分段浏览

## 9. 后续扩展

- 更多平台支持（抖音、Twitter/X、知乎等）
- 微信公众号/小红书 API 自动发布
- AI 辅助内容改写（自动适配不同平台风格）
- 内容排期发布（定时生成 + 提醒）
- 数据分析（各平台阅读量、互动等）
