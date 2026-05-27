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

## 4. UI 设计

整体风格参考 Linear / Vercel 的极简主义：大量留白、克制的色彩、精细的排版层次。工作台偏向工具感，博客保持阅读温度。

### 4.1 色彩系统

| 语义 | 变量名 | 亮色模式 | 暗色模式 | 用途 |
|------|--------|---------|---------|------|
| 背景主色 | `--bg-primary` | `#ffffff` | `#0a0a0a` | 工作台主背景 |
| 背景次色 | `--bg-secondary` | `#f8f8f8` | `#111111` | 侧边栏、卡片背景 |
| 背景再次色 | `--bg-tertiary` | `#f0f0f0` | `#1a1a1a` | 输入框、分隔区域 |
| 文字主色 | `--text-primary` | `#111111` | `#ededed` | 正文、标题 |
| 文字次色 | `--text-secondary` | `#666666` | `#888888` | 标注、时间戳、辅助信息 |
| 文字弱化色 | `--text-tertiary` | `#999999` | `#555555` | placeholder、禁用态 |
| 边框色 | `--border` | `#e5e5e5` | `#2a2a2a` | 分隔线、输入框边框 |
| 强调色 | `--accent` | `#2563eb` | `#3b82f6` | 主按钮、激活态、链接 |
| 强调悬浮 | `--accent-hover` | `#1d4ed8` | `#60a5fa` | 按钮 hover |
| 成功色 | `--success` | `#16a34a` | `#22c55e` | 发布成功、完成状态 |
| 警告色 | `--warning` | `#d97706` | `#f59e0b` | 未生成、部分完成 |
| 错误色 | `--error` | `#dc2626` | `#ef4444` | 生成失败、校验错误 |
| 品牌渐变色 | `--brand-gradient` | `linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)` | 同左 | Logo、主行动按钮、工作台 header |

**克制原则**：全站除品牌渐变色外，仅使用黑白灰 + 强调色。其余语义色只在状态反馈时出现。

### 4.2 字体系统

| 层级 | 字号 | 字重 | 行高 | 颜色 | 用途 |
|------|------|------|------|------|------|
| H1 | 28px / 1.75rem | 700 | 1.2 | `--text-primary` | 页面大标题 |
| H2 | 20px / 1.25rem | 600 | 1.3 | `--text-primary` | 区块标题 |
| H3 | 16px / 1rem | 600 | 1.4 | `--text-primary` | 卡片标题、小标题 |
| Body | 14px / 0.875rem | 400 | 1.6 | `--text-primary` | 正文、列表项 |
| Body-Small | 13px / 0.8125rem | 400 | 1.5 | `--text-secondary` | 辅助文字、描述 |
| Caption | 12px / 0.75rem | 400 | 1.4 | `--text-tertiary` | 时间戳、标签、状态 |
| Code | 13px / 0.8125rem | 400 | 1.5 | `--text-primary` | 代码、命令 |
| Mono | 13px / 0.8125rem | 400 | 1.5 | `--text-primary` | 等宽数据（ID、路径） |

**字体族**：
- 正文：`-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif`
- 代码：`"JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace`
- 小红书卡片标题：`"Noto Serif SC", "Source Han Serif SC", serif`（可选 serif 增强质感）

### 4.3 间距系统

基于 4px 基准单位：

```
--space-1:  4px    --space-2:  8px    --space-3:  12px
--space-4:  16px   --space-5:  20px   --space-6:  24px
--space-8:  32px   --space-10: 40px   --space-12: 48px
--space-16: 64px   --space-20: 80px   --space-24: 96px
```

### 4.4 圆角

```
--radius-sm:  4px   (标签、小按钮)
--radius-md:  6px   (输入框、卡片)
--radius-lg:  8px   (大卡片、对话框)
--radius-xl:  12px  (模态框、面板)
--radius-full: 9999px (头像、pill 按钮)
```

### 4.5 阴影

```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04)         (卡片悬浮)
--shadow-md:  0 4px 12px rgba(0,0,0,0.08)         (下拉菜单、Popover)
--shadow-lg:  0 8px 30px rgba(0,0,0,0.12)         (模态框、截图预览)
--shadow-inner: inset 0 1px 2px rgba(0,0,0,0.05)  (输入框聚焦态)
```

### 4.6 工作台页面线框

#### 4.6.1 内容列表页 `/workspace/`

```
┌─────────────────────────────────────────────────────────────┐
│ ☐ Logo           工作台                          [主题] [⚙] │  ← bg: white, border-bottom: 1px solid var(--border)
├────────┬────────────────────────────────────────────────────┤
│ 侧边栏  │  内容列表                                          │
│        │                                                    │
│ ▸ 全部  │  ┌──────────────────────────────────────────────┐ │
│   博客   │  │  [+ 新建内容]   [筛选: 全部 ▾]   [搜索...]   │ │
│   微信   │  └──────────────────────────────────────────────┘ │
│   小红书 │                                                    │
│   想法   │  ┌──────────────────────────────────────────────┐ │
│        │  │ 📄 AI 提效指南                    2026-05-27   │ │
│ 设置    │  │    目标: ● 博客  ● 微信  ● 小红书            │ │
│        │  │    状态: ✓ ✓ ✓                           [编辑]│ │
│        │  └──────────────────────────────────────────────┘ │
│        │                                                    │
│        │  ┌──────────────────────────────────────────────┐ │
│        │  │ 📄 TypeScript 泛型笔记            2026-05-26  │ │
│        │  │    目标: ● 博客  ○ 微信                      │ │
│        │  │    状态: ✓ ○ —                           [编辑]│ │
│        │  └──────────────────────────────────────────────┘ │
│        │                                                    │
│        │  ┌──────────────────────────────────────────────┐ │
│        │  │ 📄 为什么选 Vue 3                 2026-05-25  │ │
│        │  │    目标: ● 小红书                            │ │
│        │  │    状态: — — ✓ (3张截图)              [编辑] │ │
│        │  └──────────────────────────────────────────────┘ │
├────────┴────────────────────────────────────────────────────┤
│ 共 3 篇文章                                                  │
└─────────────────────────────────────────────────────────────┘
```

侧边栏：`width: 200px`, `bg: var(--bg-secondary)`, `border-right: 1px solid var(--border)`
内容区：`flex: 1`, `bg: var(--bg-primary)`, `padding: var(--space-8)`

#### 4.6.2 编辑器页 `/workspace/edit/:id`

```
┌─────────────────────────────────────────────────────────────┐
│ ← 返回    AI 提效指南              [保存] [生成全部] [发布]  │
├────────────────────────┬────────────────────────────────────┤
│ Meta 面板              │ 预览区                              │
│                        │                                    │
│ 标题: [___________]   │  [● 博客]  [○ 微信]  [○ 小红书]    │
│ 日期: [2026-05-27]    │  ┌────────────────────────────────┐ │
│ 标签: [#AI] [#工具]   │  │                                │ │
│                        │  │  预览内容渲染区                 │ │
│ 目标平台:              │  │                                │ │
│   ☑ 博客               │  │  (Markdown 渲染 /              │ │
│   ☑ 微信               │  │   HTML 排版 /                  │ │
│   ☐ 小红书             │  │   小红书卡片)                  │ │
│                        │  │                                │ │
│ 小红书配置(展开):      │  │                                │ │
│   卡片风格: [gradient] │  │                                │ │
│   主题: [● light ○dark]│  │                                │ │
│                        │  └────────────────────────────────┘ │
├────────────────────────┤                                    │
│ Markdown 编辑器         │  操作栏                            │
│                        │  [复制] [下载] [查看截图] [导出全部]│
│ # AI 提效指南          │                                    │
│                        │                                    │
│ 这里介绍了几款实用的    │                                    │
│ AI 工具...            │                                    │
│                        │                                    │
│ ```ts                 │                                    │
│ const x = 1           │                                    │
│ ```                    │                                    │
│                        │                                    │
└────────────────────────┴────────────────────────────────────┘
```

编辑器区：`flex: 1`, `font-family: var(--font-mono)`, `bg: var(--bg-primary)`
预览区：`flex: 1`, `bg: var(--bg-secondary)`, `border-left: 1px solid var(--border)`

#### 4.6.3 小红书截图预览 `/workspace/preview/:id?tab=xhs`

```
┌─────────────────────────────────────────────────────────────┐
│ ← 返回    AI 提效指南 — 小红书截图                          │
├─────────────────────────────────────────────────────────────┤
│ 卡片风格: [● Gradient] [○ Quote] [○ Code] [○ Minimal] [○ List] │
│ 主题: [● 亮色] [○ 暗色]    分段: 1/3  [< 1  2  3 >]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌───────────────────────────────────────────┐            │
│    │                                           │            │
│    │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← 渐变背景
│    │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│    │  ░░  AI 提效指南                    @slashhuang  ░░  │
│    │  ░░                                        ░░  │
│    │  ░░  这里介绍了几款实用的 AI 工具，        ░░  │
│    │  ░░  帮助你提升 10 倍工作效率...          ░░  │
│    │  ░░                                        ░░  │
│    │  ░░  #AI工具  #效率提升  #打工人必备      ░░  │
│    │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│    │                                           │            │
│    └───────────────────────────────────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  [ 下载此卡 ]  [ 生成全部截图 ↓ ]           │
└─────────────────────────────────────────────────────────────┘
```

截图展示区：`max-width: 540px`（1080px 的一半），居中，带阴影。

### 4.7 核心组件规范

#### 按钮

```
Primary:    bg(--accent), color(white), hover(--accent-hover), radius(--radius-md)
Secondary:  bg(transparent), border(--border, 1px), hover(bg(--bg-tertiary))
Ghost:      bg(transparent), hover(bg(--bg-tertiary)), no-border
Brand:      bg(--brand-gradient), color(white), border-radius(--radius-md), shadow(--shadow-sm)
Danger:     bg(--error), color(white), hover(darken(--error))

Size SM: padding(4px 10px), font(12px)
Size MD: padding(6px 14px), font(13px)
Size LG: padding(10px 20px), font(14px)
```

#### 卡片

```
bg(--bg-primary), border(--border, 1px), radius(--radius-md), shadow(--shadow-sm)
hover: shadow(--shadow-md), border-color(--accent) [仅当卡片可点击时]
padding: var(--space-4)
```

#### Tab 切换

```
bg(--bg-tertiary), radius(--radius-md), padding(2px)
active item: bg(--bg-primary), shadow(--shadow-sm), radius(--radius-sm)
inactive item: color(--text-secondary), hover: color(--text-primary)
```

#### 输入框

```
bg(--bg-primary), border(--border, 1px), radius(--radius-md), padding(--space-3)
focus: border(--accent, 2px), box-shadow(--shadow-inner)
placeholder: color(--text-tertiary)
```

#### 状态徽章

```
radius(--radius-full), padding(2px 10px), font(12px)
成功: bg(#dcfce7), color(#166534)   [✓ 已生成]
警告: bg(#fef3c7), color(#92400e)   [○ 未生成]
错误: bg(#fee2e2), color(#991b1b)   [✗ 失败]
```

#### 博客 UI 特色

- 阅读区最大宽度 `65ch`（中文适配约 720px），居中
- 段落间距 `--space-4`，行高 `1.75`
- 代码块：暗色主题背景 `#1e1e2e`，圆角 `--radius-lg`，带语言标签
- 图片：圆角 `--radius-lg`，最大宽度 100%，带 caption 样式

## 5. 工作台功能

### 5.1 路由结构

```
/workspace/              - 内容列表页
/workspace/edit/:id      - 编辑器页（左侧 Markdown 编辑器 + 右侧多平台预览）
/workspace/preview/:id   - 纯预览页（三栏 Tab：博客/微信/小红书）
/workspace/ideas/        - 想法/笔记管理页
```

### 5.2 核心组件

- **ContentList**: 内容列表，支持筛选、搜索、状态展示
- **MarkdownEditor**: 基于 Monaco Editor 的 Markdown 编辑器
- **PlatformPreview**: 平台预览切换组件（博客/微信/小红书）
- **WechatPreview**: 微信公众号 HTML 渲染预览（模拟微信样式）
- **XiaohongshuPreview**: 小红书 HTML 卡片预览（模拟小红书样式，支持卡片风格切换、分段预览、一键截图下载）
- **ExportPanel**: 导出面板（复制、下载、生成全部、批量截图）

### 5.3 技术选型

#### 工作台前端

| 领域 | 技术 | 理由 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | 与 VuePress 一致，轻量 |
| 构建 | Vite | 快速 HMR，独立构建 workspace |
| 路由 | Vue Router | 与 VuePress 路由集成 |
| 编辑器 | Monaco Editor (`@guolao/vue-monaco-editor`) | VS Code 同引擎，Markdown 语法高亮开箱即用 |
| Markdown 渲染 | Markdown-it + `markdown-it-container` | 轻量，可自定义容器/规则 |
| 代码高亮 | Shiki | 与 VuePress shikiPlugin 一致 |
| 状态管理 | Vue 3 `ref/reactive` + `provide/inject` | 轻量，不需要 Pinia 的额外复杂度 |
| HTTP 客户端 | 无（前端直接读本地生成文件，dev server 代理） | 本地开发，不需要 API |
| CSS | CSS 变量 + SCSS | CSS 变量实现主题切换，SCSS 提供嵌套/函数 |
| 图标 | Lucide Icons (`lucide-vue-next`) | 线性风格，与 `iconPlugin` 一致 |
| 截图预览 | Lightbox 自定义实现 | 轻量，不需要完整图片库 |

#### 转换引擎（后端）

| 领域 | 技术 | 理由 |
|------|------|------|
| 运行时 | Node.js 20+ / TypeScript | 项目已有 TS 基础 |
| Markdown 解析 | Markdown-it + 自定义插件 | 支持 frontmatter 提取 |
| HTML 模板 | EJS | 简单直观，TypeScript 友好 |
| 截图 | Puppeteer (Chromium) | 成熟方案，精确控制渲染 |
| 文件监听 | chokidar | Node.js 生态最稳定的文件监听库 |
| 图片处理 | sharp | 快速，支持 PNG 压缩、尺寸调整 |

#### VuePress 集成

| 领域 | 技术 | 理由 |
|------|------|------|
| 博客构建 | VuePress 2 (Vite bundler) | 现有项目 |
| 主题 | @vuepress/theme-default (定制) | 基于现有主题扩展 UI |
| 博客内容源 | `content/generated/blog/` 软链接到 `docs/` | 构建时自动关联 |
| RSS/Feed | @vuepress/plugin-feed | 已有，保留 |
| SEO | @vuepress/plugin-seo | 已有，保留 |
| 评论 | Giscus | 已有，保留 |

## 6. 数据流

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

## 9. 成功形态

描述系统构建完成后，用户的完整操作路径和内容生产流程。这是最终目标的具象化描述。

### 9.1 典型用户角色

- **作者**：slashhuang（你），唯一用户，负责创作和发布

### 9.2 内容生产路径

#### 场景一：写一篇文章，发布到所有平台

```
用户操作                              系统行为
─────────────────────────────────────────────────────────
1. 打开 http://localhost:8080/workspace
                                    显示内容列表，空状态提示
                                    [ + 新建内容 ]

2. 点击 [ + 新建内容 ]
   填写：
   - 标题: "AI 效率工具推荐"
   - 目标平台: ☑博客 ☑微信 ☑小红书    自动生成 content/posts/2026-05-27-ai-tools.md
   - 标签: #AI #工具                 带 frontmatter 模板
   点击 [ 创建 ]

3. 自动跳转到编辑器 /workspace/edit/2026-05-27-ai-tools
   左侧：Markdown 编辑器              右侧：三 Tab 实时预览
   用户边写边看：                     [ 博客 ] [ 微信 ] [ 小红书 ]
   - 输入标题、正文                  博客 Tab: 完整 Markdown 渲染
   - 插入代码块                      微信 Tab: 适配微信的 HTML 排版
   - 调整段落                        小红书 Tab: 渐变卡片实时预览

4. 切换到「小红书」Tab，调整样式
   - 卡片风格: gradient → quote      卡片样式即时变化
   - 主题: light → dark              暗色主题预览
   - 看到长文自动分成 3 张卡片        分页预览: [1/3] [2/3] [3/3]

5. 点击 [ 生成全部截图 ]
                                    引擎执行：
                                    1. 解析 Markdown
                                    2. 按卡片模板生成 HTML
                                    3. Puppeteer 截图 3 张 PNG
                                    输出到 content/generated/xiaohongshu/screenshots/

6. 检查生成的截图
   预览每张卡片，确认样式正确         显示截图列表，支持放大查看
   点击 [ 下载全部 ]                  打包下载 3 张 PNG

7. 切换到「微信公众号」Tab
   检查 HTML 排版效果                 模拟微信阅读样式预览
   点击 [ 复制 HTML ]                 复制带内联样式的完整 HTML

8. 发布到各平台（人工操作）
   - 博客: 自动发布（pnpm build + git push → CI/CD 部署站点）
   - 微信公众号: 粘贴 HTML 到微信编辑器 → 群发
   - 小红书: 上传下载的 PNG 截图 + 复制标题和标签 → 发布笔记
```

#### 场景二：只写博客文章

```
1. 在编辑器新建内容
2. 目标平台只选 ☑博客
3. 专注写作，博客预览实时更新
4. 点击 [ 发布 ] → pnpm build → 站点上线
```

#### 场景三：快速记录一个想法

```
1. 打开 /workspace/ideas/
2. 快速输入一段文字（不需要完整 frontmatter）
3. 保存为 content/ideas/2026-05-27-quick-thought.md
4. 想法列表自动更新，支持后续转为正式文章
```

#### 场景四：将旧文章转为社媒内容

```
1. 在内容列表选中一篇已发布的博客文章
2. 点击 [ 转为社媒内容 ]
   - 自动在 frontmatter 的 targets 中添加 wechat, xiaohongshu
3. 进入编辑器，调整社媒专属配置（标题、标签、卡片风格）
4. 生成小红书截图、微信公众号 HTML
5. 人工发布到对应平台
```

### 9.3 最终成功形态

系统建成后的日常使用体验：

1. **一次创作，多端分发**
   - 在 `/workspace/` 写一篇 Markdown
   - 自动产出：博客页面 + 微信公众号排版 + 小红书精美图片
   - 不再需要为每个平台单独排版

2. **所见即所得**
   - 编辑器中看到的预览 ≈ 实际发布效果
   - 小红书截图的字体、颜色、间距与实际输出一致
   - 微信公众号 HTML 粘贴后效果一致

3. **卡片质量**
   - 小红书截图达到"可直接发布"质量
   - 5 种卡片风格覆盖不同内容类型
   - 渐变色、排版、字体大小可自定义

4. **操作效率**
   - 一篇 2000 字文章从创作到三端准备就绪：< 15 分钟
   - 小红书长文自动分段，无需手动拆分
   - 常用配置（主题色、作者名、默认标签）可预设

5. **内容资产**
   - `content/posts/` 是单一真实来源
   - `content/generated/` 可被 CI/CD 复用
   - 历史内容可搜索、可筛选、可复用

### 9.4 验收标准

| 验收项 | 标准 |
|--------|------|
| 博客发布 | `pnpm build` 后博客站点正常显示文章内容 |
| 微信预览 | HTML 输出在微信开发者工具/手机微信中预览效果正确 |
| 小红书截图 | PNG 图片尺寸 1080×1440，字体清晰，样式与预览一致 |
| 热更新 | 编辑 Markdown 保存后，3 秒内各平台预览自动刷新 |
| CLI 可用 | `pnpm transform new` 创建模板，`pnpm transform all` 转换全部内容 |
| 工作台可访问 | `pnpm dev` 后 `/workspace/` 路由正常加载 |

## 10. 后续扩展

- 更多平台支持（抖音、Twitter/X、知乎等）
- 微信公众号/小红书 API 自动发布
- AI 辅助内容改写（自动适配不同平台风格）
- 内容排期发布（定时生成 + 提醒）
- 数据分析（各平台阅读量、互动等）
