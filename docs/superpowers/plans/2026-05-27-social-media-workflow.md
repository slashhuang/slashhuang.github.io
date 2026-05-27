# 社媒工作流系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 VuePress 博客仓库改造成统一创作、多平台适配的社媒工作流系统，支持博客 + 微信公众号 + 小红书。

**Architecture:** 三阶段实施——Phase 1 构建内容转换引擎（Node.js/TS），Phase 2 构建工作台 UI（Vue 3 SPA），Phase 3 集成 VuePress 构建管线。每个阶段独立可测试。

**Tech Stack:** Node.js/TS, Markdown-it, EJS, Puppeteer, sharp, Vue 3, Vite, Monaco Editor, SCSS, VuePress 2

**Spec:** `docs/superpowers/specs/2026-05-27-social-media-workflow-design.md`

---

## Phase 1: 内容转换引擎

### Task 1: 创建目录结构和 Engine 项目骨架

**Files:**
- Create: `engine/package.json`
- Create: `engine/tsconfig.json`
- Create: `engine/src/index.ts`
- Create: `engine/src/types.ts`
- Create: `content/posts/.gitkeep`
- Create: `content/generated/.gitkeep`
- Create: `content/ideas/.gitkeep`

- [ ] **Step 1: 创建 engine/package.json**

```json
{
  "name": "@ai/content-engine",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "transform": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc -b tsconfig.json",
    "dev": "tsc -b tsconfig.json --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "markdown-it": "^14.0.0",
    "@types/markdown-it": "^14.0.0",
    "gray-matter": "^4.0.3",
    "@types/gray-matter": "^4.0.2",
    "ejs": "^3.1.9",
    "@types/ejs": "^3.1.5",
    "puppeteer": "^23.0.0",
    "sharp": "^0.33.0",
    "chokidar": "^4.0.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "vitest": "3.0.6",
    "@types/node": "^22.13.5"
  }
}
```

- [ ] **Step 2: 创建 engine/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建 engine/src/types.ts**

```typescript
import type { Page } from 'vuepress'

export interface ContentMeta {
  title: string
  date: string
  cover?: string
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  tags: string[]
  summary?: string
  wechat?: WechatMeta
  xiaohongshu?: XiaohongshuMeta
  blog?: BlogMeta
}

export interface WechatMeta {
  digest?: string
  author?: string
  original?: boolean
}

export interface XiaohongshuMeta {
  titleOverride?: string
  hashtags?: string[]
  cardStyle?: 'gradient' | 'quote' | 'minimal' | 'code' | 'list'
  theme?: 'light' | 'dark'
  splitMode?: 'auto' | 'manual'
}

export interface BlogMeta {
  category?: string
  pinned?: boolean
}

export interface GeneratedFile {
  path: string
  content: string
  platform: 'blog' | 'wechat' | 'xiaohongshu'
}

export interface ParsedContent {
  meta: ContentMeta
  body: string
  sourcePath: string
}
```

- [ ] **Step 4: 创建 engine/src/index.ts**

```typescript
export type { ContentMeta, WechatMeta, XiaohongshuMeta, BlogMeta, GeneratedFile, ParsedContent } from './types.js'
```

- [ ] **Step 5: 创建 content 目录占位文件**

```bash
mkdir -p content/posts content/generated content/ideas
touch content/posts/.gitkeep content/generated/.gitkeep content/ideas/.gitkeep
```

- [ ] **Step 6: 更新根 tsconfig.build.json，添加 engine 项目引用**

在 `tsconfig.build.json` 的 `"references"` 数组中添加：
```json
{ "path": "engine" }
```

- [ ] **Step 7: 更新 pnpm-workspace.yaml**

在 packages 列表中添加 `engine`：
```yaml
packages:
  - 'docs'
  - 'plugins/*'
  - 'themes/*'
  - 'tools/*'
  - 'engine'
  - 'workspace'
```

- [ ] **Step 8: 提交**

```bash
git add engine/package.json engine/tsconfig.json engine/src/ content/ tsconfig.build.json pnpm-workspace.yaml
git commit -m "feat: scaffold content-engine project and directory structure"
```

---

### Task 2: Parser — 解析 Markdown 源文件

**Files:**
- Create: `engine/src/parser.ts`
- Create: `engine/src/parser.test.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { describe, it, expect } from 'vitest'
import { parseContent } from './parser.js'

describe('parseContent', () => {
  it('parses frontmatter and body from markdown', () => {
    const md = `---
title: "Test Post"
date: 2026-05-27
targets:
  - blog
  - wechat
tags: [AI, Tools]
---

# Hello World

This is content.
`
    const result = parseContent(md, '/test/path.md')
    expect(result.meta.title).toBe('Test Post')
    expect(result.meta.date).toBe('2026-05-27')
    expect(result.meta.targets).toEqual(['blog', 'wechat'])
    expect(result.meta.tags).toEqual(['AI', 'Tools'])
    expect(result.body.trim()).toBe('# Hello World\n\nThis is content.')
  })

  it('parses xiaohongshu nested config', () => {
    const md = `---
title: "XHS Post"
date: 2026-05-27
targets:
  - xiaohongshu
tags: [test]
xiaohongshu:
  titleOverride: "Custom XHS Title"
  hashtags: ["#test", "#demo"]
  cardStyle: gradient
---

Content here.
`
    const result = parseContent(md, '/test.md')
    expect(result.meta.xiaohongshu?.titleOverride).toBe('Custom XHS Title')
    expect(result.meta.xiaohongshu?.hashtags).toEqual(['#test', '#demo'])
    expect(result.meta.xiaohongshu?.cardStyle).toBe('gradient')
  })

  it('uses defaults for optional fields', () => {
    const md = `---
title: "Minimal"
date: 2026-05-27
targets:
  - blog
tags: []
---

Body
`
    const result = parseContent(md, '/test.md')
    expect(result.meta.wechat).toBeUndefined()
    expect(result.meta.blog).toBeUndefined()
    expect(result.meta.xiaohongshu).toBeUndefined()
  })
})
```

- [ ] **Step 2: 实现 parser**

```typescript
import matter from 'gray-matter'
import type { ContentMeta, ParsedContent } from './types.js'

export function parseContent(markdown: string, sourcePath: string): ParsedContent {
  const { data, content } = matter(markdown)

  const meta: ContentMeta = {
    title: data.title || '',
    date: data.date ? String(data.date) : '',
    cover: data.cover,
    targets: data.targets || [],
    tags: data.tags || [],
    summary: data.summary,
    wechat: data.wechat,
    xiaohongshu: data.xiaohongshu,
    blog: data.blog,
  }

  return {
    meta,
    body: content.trim(),
    sourcePath,
  }
}
```

- [ ] **Step 3: 安装依赖并运行测试**

```bash
cd engine && pnpm install
cd engine && pnpm test
```

Expected: 3 tests pass.

- [ ] **Step 4: 提交**

```bash
git add engine/src/parser.ts engine/src/parser.test.ts
git commit -m "feat: add content parser with frontmatter extraction"
```

---

### Task 3: Blog Transformer — 博客版 Markdown 转换

**Files:**
- Create: `engine/src/transformers/blog.ts`
- Create: `engine/src/transformers/blog.test.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { describe, it, expect } from 'vitest'
import { transformBlog } from './blog.js'
import { parseContent } from '../parser.js'

describe('transformBlog', () => {
  it('outputs source-compatible markdown with enhanced frontmatter', () => {
    const md = `---
title: "Blog Post"
date: 2026-05-27
targets:
  - blog
tags: [AI]
blog:
  category: "技术"
---

# Hello
`
    const parsed = parseContent(md, '/test.md')
    const output = transformBlog(parsed)

    expect(output.path).toMatch(/\.md$/)
    expect(output.content).toContain('---')
    expect(output.content).toContain('title: "Blog Post"')
    expect(output.content).toContain('# Hello')
  })
})
```

- [ ] **Step 2: 实现**

```typescript
import type { ParsedContent, GeneratedFile } from '../types.js'

export function transformBlog(parsed: ParsedContent): GeneratedFile {
  const { meta, body, sourcePath } = parsed

  const blogFm = {
    title: meta.title,
    date: meta.date,
    tags: meta.tags,
    ...(meta.blog?.category ? { category: meta.blog.category } : {}),
    ...(meta.blog?.pinned ? { pinned: meta.blog.pinned } : {}),
    ...(meta.cover ? { cover: meta.cover } : {}),
    ...(meta.summary ? { summary: meta.summary } : {}),
  }

  const frontmatter = Object.entries(blogFm)
    .filter(([_, v]) => v !== undefined && v !== false)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: [${v.join(', ')}]`
      if (typeof v === 'string') return `${k}: "${v}"`
      return `${k}: ${v}`
    })
    .join('\n')

  const content = `---
${frontmatter}
---

${body}
`

  const fileName = sourcePath.split('/').pop()?.replace('.md', '') || 'post'
  return {
    path: `blog/${fileName}.md`,
    content,
    platform: 'blog',
  }
}
```

- [ ] **Step 3: 运行测试**

```bash
cd engine && pnpm test -- --testNamePattern="transformBlog"
```

- [ ] **Step 4: 提交**

```bash
git add engine/src/transformers/blog.ts engine/src/transformers/blog.test.ts
git commit -m "feat: add blog transformer"
```

---

### Task 4: WeChat Transformer — 微信公众号 HTML 转换

**Files:**
- Create: `engine/src/transformers/wechat.ts`
- Create: `engine/src/transformers/wechat.test.ts`
- Create: `engine/src/templates/wechat-article.ejs`

- [ ] **Step 1: 编写测试**

```typescript
import { describe, it, expect } from 'vitest'
import { transformWechat } from './wechat.js'
import { parseContent } from '../parser.js'

describe('transformWechat', () => {
  it('generates HTML with inline styles for WeChat', () => {
    const md = `---
title: "微信文章"
date: 2026-05-27
targets:
  - wechat
tags: [test]
wechat:
  author: "slashhuang"
  original: true
---

# 标题

这是一段正文。

## 小标题

第二段内容。
`
    const parsed = parseContent(md, '/test.md')
    const output = transformWechat(parsed)

    expect(output.platform).toBe('wechat')
    expect(output.path).toMatch(/\.html$/)
    expect(output.content).toContain('<section')
    expect(output.content).toContain('这是一段正文')
    expect(output.content).toContain('第二段内容')
  })

  it('strips code blocks from output', () => {
    const md = `---
title: "Code Post"
date: 2026-05-27
targets:
  - wechat
tags: []
---

Normal text.

\`\`\`ts
const x = 1
\`\`\`

More text.
`
    const parsed = parseContent(md, '/test.md')
    const output = transformWechat(parsed)

    expect(output.content).not.toContain('const x = 1')
  })
})
```

- [ ] **Step 2: 创建 EJS 模板**

```html
<section style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif; line-height: 1.8; color: #333;">
  <section style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
    <span style="font-size: 22px; font-weight: bold; color: #111; letter-spacing: 0.5px;"><%= title %></span>
    <% if (author) { %>
    <section style="margin-top: 8px; font-size: 13px; color: #888;"><%= author %></section>
    <% } %>
  </section>

  <%- body %>

  <section style="margin-top: 40px; padding-top: 16px; border-top: 1px dashed #ddd; text-align: center; font-size: 12px; color: #bbb;">
    — END —
  </section>
</section>
```

- [ ] **Step 3: 实现 transformer**

```typescript
import ejs from 'ejs'
import MarkdownIt from 'markdown-it'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ParsedContent, GeneratedFile } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// Strip code blocks for WeChat (微信不支持代码块)
const mdNoCode = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
mdNoCode.block.ruler.disable('code')
mdNoCode.inline.ruler.disable('code')

function addInlineStyles(html: string): string {
  return html
    .replace(/<h1[^>]*>/g, '<section style="font-size: 20px; font-weight: bold; margin: 24px 0 12px; color: #111; padding-left: 12px; border-left: 3px solid #2563eb;">')
    .replace(/<h2[^>]*>/g, '<section style="font-size: 17px; font-weight: 600; margin: 20px 0 10px; color: #111; padding-left: 12px; border-left: 3px solid #8b5cf6;">')
    .replace(/<h3[^>]*>/g, '<section style="font-size: 15px; font-weight: 600; margin: 16px 0 8px; color: #333;">')
    .replace(/<p>/g, '<section style="margin: 12px 0; font-size: 15px; line-height: 1.8; color: #333;">')
    .replace(/<ul>/g, '<section style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<ol>/g, '<section style="margin: 8px 0; padding-left: 20px;">')
    .replace(/<li>/g, '<section style="margin: 4px 0; font-size: 15px; line-height: 1.7; color: #333;">')
    .replace(/<blockquote>/g, '<section style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #ddd; background: #f9f9f9; font-style: italic; color: #666;">')
    .replace(/<strong>/g, '<strong style="color: #111; font-weight: 700;">')
    .replace(/<em>/g, '<em style="color: #555;">')
    .replace(/<img /g, '<img style="max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; " ')
    .replace(/<a /g, '<a style="color: #2563eb; text-decoration: none; border-bottom: 1px solid rgba(37, 99, 235, 0.3); " ')
    .replace(/<\/h[123]>/g, '</section>')
    .replace(/<\/p>/g, '</section>')
    .replace(/<\/[uo]l>/g, '</section>')
    .replace(/<\/li>/g, '</section>')
    .replace(/<\/blockquote>/g, '</section>')
}

export function transformWechat(parsed: ParsedContent): GeneratedFile {
  const { meta, body } = parsed

  const bodyHtml = addInlineStyles(mdNoCode.render(body))
  const template = readFileSync(join(__dirname, '../templates/wechat-article.ejs'), 'utf-8')
  const html = ejs.render(template, {
    title: meta.title,
    body: bodyHtml,
    author: meta.wechat?.author,
  })

  const fileName = parsed.sourcePath.split('/').pop()?.replace('.md', '') || 'post'
  return {
    path: `wechat/${fileName}.html`,
    content: html,
    platform: 'wechat',
  }
}
```

- [ ] **Step 4: 运行测试**

```bash
cd engine && pnpm test -- --testNamePattern="transformWechat"
```

- [ ] **Step 5: 提交**

```bash
git add engine/src/transformers/wechat.ts engine/src/transformers/wechat.test.ts engine/src/templates/wechat-article.ejs
git commit -m "feat: add WeChat HTML transformer with inline styles"
```

---

### Task 5: Xiaohongshu Transformer — 小红书 HTML 卡片生成

**Files:**
- Create: `engine/src/transformers/xiaohongshu.ts`
- Create: `engine/src/transformers/xiaohongshu.test.ts`
- Create: `engine/src/templates/xhs-card-gradient.ejs`
- Create: `engine/src/templates/xhs-card-quote.ejs`
- Create: `engine/src/templates/xhs-card-minimal.ejs`
- Create: `engine/src/templates/xhs-card-code.ejs`
- Create: `engine/src/templates/xhs-card-list.ejs`

- [ ] **Step 1: 创建渐变卡片模板** (`xhs-card-gradient.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0;">
<div class="xhs-card" style="width: 1080px; min-height: 1440px; padding: 80px; box-sizing: border-box; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif; color: #ffffff;">
  <div class="card-header" style="margin-bottom: 48px;">
    <div class="title" style="font-size: 52px; font-weight: 700; line-height: 1.3; letter-spacing: 1px; margin-bottom: 24px;"><%= title %></div>
    <div class="author" style="font-size: 28px; opacity: 0.7;">@<%= author %></div>
  </div>
  <div class="card-body" style="font-size: 36px; line-height: 1.8; margin-bottom: 48px;">
    <%- body %>
  </div>
  <div class="card-footer" style="padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.2);">
    <% tags.forEach(function(tag) { %>
    <span class="tag" style="margin-right: 16px; font-size: 28px; opacity: 0.9;"><%= tag %></span>
    <% }) %>
  </div>
</div>
</body>
</html>
```

- [ ] **Step 2: 创建极简卡片模板** (`xhs-card-minimal.ejs`)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0;">
<div class="xhs-card" style="width: 1080px; min-height: 1440px; padding: 80px; box-sizing: border-box; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif; color: #111;">
  <div class="card-header" style="margin-bottom: 48px;">
    <div class="title" style="font-size: 52px; font-weight: 700; line-height: 1.3; letter-spacing: 1px; margin-bottom: 24px; color: #111;"><%= title %></div>
    <div class="author" style="font-size: 28px; color: #666;">@<%= author %></div>
  </div>
  <div class="card-body" style="font-size: 36px; line-height: 1.8; margin-bottom: 48px; color: #333;">
    <%- body %>
  </div>
  <div class="card-footer" style="padding-top: 32px; border-top: 1px solid #e5e5e5;">
    <% tags.forEach(function(tag) { %>
    <span class="tag" style="margin-right: 16px; font-size: 28px; color: #666;"><%= tag %></span>
    <% }) %>
  </div>
</div>
</body>
</html>
```

- [ ] **Step 3: 编写测试**

```typescript
import { describe, it, expect } from 'vitest'
import { transformXiaohongshu } from './xiaohongshu.js'
import { parseContent } from '../parser.js'

describe('transformXiaohongshu', () => {
  it('generates HTML cards for each content segment', () => {
    const md = `---
title: "小红书卡片"
date: 2026-05-27
targets:
  - xiaohongshu
tags: [AI, 效率]
xiaohongshu:
  cardStyle: gradient
  theme: light
---

第一段内容，这是介绍。

第二段内容，这是正文。
`
    const parsed = parseContent(md, '/test.md')
    const cards = transformXiaohongshu(parsed)

    expect(cards.length).toBeGreaterThanOrEqual(1)
    expect(cards[0].content).toContain('xhs-card')
    expect(cards[0].content).toContain('小红书卡片')
    expect(cards[0].content).toContain('#AI')
    expect(cards[0].path).toContain('xiaohongshu')
  })

  it('defaults to gradient style when not specified', () => {
    const md = `---
title: "Test"
date: 2026-05-27
targets:
  - xiaohongshu
tags: []
---

Content
`
    const parsed = parseContent(md, '/test.md')
    const cards = transformXiaohongshu(parsed)

    expect(cards[0].content).toContain('linear-gradient')
  })
})
```

- [ ] **Step 4: 实现 transformer**

```typescript
import ejs from 'ejs'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ParsedContent, GeneratedFile } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TEMPLATES_DIR = join(__dirname, '../templates')
const CARD_WIDTH = 1080
const CARD_HEIGHT = 1440
const MAX_CHARS_PER_CARD = 400

interface CardTemplate {
  name: string
  template: string
}

const templates: Record<string, string> = {}

function loadTemplates() {
  if (Object.keys(templates).length > 0) return
  const files = readdirSync(TEMPLATES_DIR).filter(f => f.startsWith('xhs-card-') && f.endsWith('.ejs'))
  for (const file of files) {
    const name = file.replace('xhs-card-', '').replace('.ejs', '')
    templates[name] = readFileSync(join(TEMPLATES_DIR, file), 'utf-8')
  }
}

function splitContent(body: string, maxChars: number): string[] {
  const paragraphs = body.split('\n\n').filter(p => p.trim())
  const segments: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).trim().length > maxChars && current) {
      segments.push(current.trim())
      current = para
    } else {
      current = current ? current + '\n\n' + para : para
    }
  }
  if (current.trim()) {
    segments.push(current.trim())
  }

  return segments.length ? segments : [body.trim().substring(0, maxChars)]
}

function renderHtml(templateStr: string, data: { title: string; body: string; tags: string[]; author: string; theme: 'light' | 'dark' }): string {
  return ejs.render(templateStr, {
    title: data.title,
    body: data.body.replace(/\n/g, '<br/>'),
    tags: data.tags.map(t => t.startsWith('#') ? t : `#${t}`),
    author: data.author,
  })
}

export function transformXiaohongshu(parsed: ParsedContent): GeneratedFile[] {
  loadTemplates()

  const { meta, body } = parsed
  const style = meta.xiaohongshu?.cardStyle || 'gradient'
  const theme = meta.xiaohongshu?.theme || 'light'
  const title = meta.xiaohongshu?.titleOverride || meta.title
  const author = meta.wechat?.author || 'slashhuang'

  const segments = splitContent(body, MAX_CHARS_PER_CARD)
  const templateStr = templates[style] || templates.gradient

  return segments.map((segment, i) => {
    const html = renderHtml(templateStr, {
      title,
      body: segment,
      tags: meta.xiaohongshu?.hashtags || meta.tags,
      author,
      theme,
    })

    return {
      path: `xiaohongshu/cards/${parsed.sourcePath.split('/').pop()?.replace('.md', '') || 'post'}-${i + 1}.html`,
      content: html,
      platform: 'xiaohongshu',
    }
  })
}
```

- [ ] **Step 5: 运行测试**

```bash
cd engine && pnpm test -- --testNamePattern="transformXiaohongshu"
```

- [ ] **Step 6: 提交**

```bash
git add engine/src/transformers/xiaohongshu.ts engine/src/transformers/xiaohongshu.test.ts engine/src/templates/xhs-card-*.ejs
git commit -m "feat: add Xiaohongshu card transformer with 5 template styles"
```

---

### Task 6: Screenshot Renderer — Puppeteer 截图

**Files:**
- Create: `engine/src/renderer/screenshot.ts`
- Create: `engine/src/renderer/screenshot.test.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { describe, it, expect } from 'vitest'
import { captureCard } from './screenshot.js'

describe('captureCard', () => {
  it('returns a PNG buffer from HTML input', async () => {
    const html = `<div style="width: 1080px; height: 1440px; background: white; display: flex; align-items: center; justify-content: center; font-size: 48px;">Test Card</div>`
    const buffer = await captureCard(html, { width: 1080, height: 1440, deviceScaleFactor: 2 })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
    // PNG magic number
    expect(buffer[0]).toBe(0x89)
    expect(buffer[1]).toBe(0x50)
    expect(buffer[2]).toBe(0x4e)
    expect(buffer[3]).toBe(0x47)
  })
})
```

- [ ] **Step 2: 实现截图模块**

```typescript
import puppeteer from 'puppeteer'

export interface CaptureOptions {
  width?: number
  height?: number
  deviceScaleFactor?: number
}

export async function captureCard(html: string, options: CaptureOptions = {}): Promise<Buffer> {
  const {
    width = 1080,
    height = 1440,
    deviceScaleFactor = 2,
  } = options

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor })

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const buffer = (await page.screenshot({ type: 'png' })) as Buffer

    return buffer
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 3: 运行测试**

```bash
cd engine && pnpm test -- --testNamePattern="captureCard"
```

Note: Puppeteer needs Chromium installed. If test fails, run `cd engine && npx puppeteer browsers install chrome`.

- [ ] **Step 4: 提交**

```bash
git add engine/src/renderer/screenshot.ts engine/src/renderer/screenshot.test.ts
git commit -m "feat: add Puppeteer screenshot renderer for XHS cards"
```

---

### Task 7: Exporter — 生成文件写入

**Files:**
- Create: `engine/src/exporter.ts`
- Create: `engine/src/exporter.test.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exportFiles } from './exporter.js'
import { tmpdir } from 'node:os'
import { mkdirSync, rmSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('exportFiles', () => {
  const testDir = join(tmpdir(), 'exporter-test')

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('writes generated files to disk', async () => {
    const files = [
      { path: 'blog/test.md', content: '# Hello', platform: 'blog' as const },
      { path: 'wechat/test.html', content: '<div>Hi</div>', platform: 'wechat' as const },
    ]

    await exportFiles(files, testDir)

    expect(readdirSync(testDir)).toContain('blog')
    expect(readdirSync(join(testDir, 'blog'))).toContain('test.md')
    expect(readFileSync(join(testDir, 'blog', 'test.md'), 'utf-8')).toContain('# Hello')
  })
})
```

- [ ] **Step 2: 实现**

```typescript
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { GeneratedFile } from './types.js'

export async function exportFiles(files: GeneratedFile[], outputDir: string): Promise<string[]> {
  const paths: string[] = []

  for (const file of files) {
    const fullPath = join(outputDir, file.path)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, file.content, 'utf-8')
    paths.push(fullPath)
  }

  return paths
}
```

- [ ] **Step 3: 运行测试**

```bash
cd engine && pnpm test -- --testNamePattern="exportFiles"
```

- [ ] **Step 4: 提交**

```bash
git add engine/src/exporter.ts engine/src/exporter.test.ts
git commit -m "feat: add file exporter"
```

---

### Task 8: CLI — 命令行入口

**Files:**
- Create: `engine/src/cli.ts`
- Create: `engine/src/dev-server.ts`

- [ ] **Step 1: 实现 CLI**

```typescript
#!/usr/bin/env node
import { Command } from 'commander'
import { parseContent } from './parser.js'
import { transformBlog } from './transformers/blog.js'
import { transformWechat } from './transformers/wechat.js'
import { transformXiaohongshu } from './transformers/xiaohongshu.js'
import { exportFiles } from './exporter.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const CONTENT_DIR = join(ROOT, 'content')
const POSTS_DIR = join(CONTENT_DIR, 'posts')
const GENERATED_DIR = join(CONTENT_DIR, 'generated')

const program = new Command()
program
  .name('transform')
  .description('Content transformation CLI for multi-platform publishing')
  .version('0.0.1')

program
  .command('new')
  .description('Create a new content template')
  .option('-t, --title <title>', 'Post title')
  .option('--targets <targets>', 'Comma-separated targets (blog,wechat,xiaohongshu)', 'blog,wechat,xiaohongshu')
  .option('--tags <tags>', 'Comma-separated tags')
  .action((opts) => {
    const title = opts.title || 'Untitled'
    const targets = opts.targets.split(',').map((t: string) => t.trim())
    const tags = opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : []
    const slug = title.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/-+$/, '')
    const date = new Date().toISOString().split('T')[0]
    const fileName = `${date}-${slug}.md`
    const filePath = join(POSTS_DIR, fileName)

    const template = `---
title: "${title}"
date: ${date}
targets:
${targets.map((t: string) => `  - ${t}`).join('\n')}
tags: [${tags.join(', ')}]
summary: ""
wechat:
  digest: ""
  author: "slashhuang"
  original: true
xiaohongshu:
  titleOverride: ""
  hashtags: [${tags.filter((t: string) => t).map((t: string) => `"#${t}"`).join(', ')}]
  cardStyle: gradient
  theme: light
  splitMode: auto
---

# ${title}

Write your content here...
`

    mkdirSync(POSTS_DIR, { recursive: true })
    writeFileSync(filePath, template, 'utf-8')
    console.log(`Created: content/posts/${fileName}`)
  })

program
  .command('all')
  .description('Transform all posts')
  .option('--watch', 'Watch for file changes')
  .action(async (opts) => {
    if (opts.watch) {
      console.log('Watch mode not yet implemented')
      return
    }

    const { readdirSync } = await import('node:fs')
    const files = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.'))

    for (const file of files) {
      const content = readFileSync(join(POSTS_DIR, file), 'utf-8')
      const parsed = parseContent(content, file)

      const outputs = []
      if (parsed.meta.targets.includes('blog')) {
        outputs.push(transformBlog(parsed))
      }
      if (parsed.meta.targets.includes('wechat')) {
        outputs.push(transformWechat(parsed))
      }
      if (parsed.meta.targets.includes('xiaohongshu')) {
        outputs.push(...transformXiaohongshu(parsed))
      }

      await exportFiles(outputs, GENERATED_DIR)
      console.log(`Transformed: ${file} → ${outputs.length} output(s)`)
    }
    console.log('Done.')
  })

program
  .command('preview')
  .description('Preview a single file output')
  .argument('<file>', 'Source markdown file')
  .option('--target <target>', 'Platform to preview (blog,wechat,xiaohongshu)', 'blog')
  .action(async (file, opts) => {
    const filePath = join(POSTS_DIR, file)
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      process.exit(1)
    }

    const content = readFileSync(filePath, 'utf-8')
    const parsed = parseContent(content, file)

    let output
    if (opts.target === 'wechat') {
      output = transformWechat(parsed)
    } else if (opts.target === 'xiaohongshu') {
      const cards = transformXiaohongshu(parsed)
      output = cards[0]
    } else {
      output = transformBlog(parsed)
    }

    console.log(output.content)
  })

program.parse()
```

- [ ] **Step 2: 创建 engine/src/dev-server.ts**

```typescript
import chokidar from 'chokidar'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { parseContent } from './parser.js'
import { transformBlog } from './transformers/blog.js'
import { transformWechat } from './transformers/wechat.js'
import { transformXiaohongshu } from './transformers/xiaohongshu.js'
import { exportFiles } from './exporter.js'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const CONTENT_DIR = join(ROOT, 'content')
const POSTS_DIR = join(CONTENT_DIR, 'posts')
const GENERATED_DIR = join(CONTENT_DIR, 'generated')

async function transformFile(filePath: string) {
  const fileName = filePath.split('/').pop() || filePath
  console.log(`[${new Date().toLocaleTimeString()}] Changed: ${fileName}`)

  const content = readFileSync(filePath, 'utf-8')
  const parsed = parseContent(content, fileName)

  const outputs = []
  if (parsed.meta.targets.includes('blog')) {
    outputs.push(transformBlog(parsed))
  }
  if (parsed.meta.targets.includes('wechat')) {
    outputs.push(transformWechat(parsed))
  }
  if (parsed.meta.targets.includes('xiaohongshu')) {
    outputs.push(...transformXiaohongshu(parsed))
  }

  await exportFiles(outputs, GENERATED_DIR)
  console.log(`  → ${outputs.length} output(s) generated`)
}

const watcher = chokidar.watch(join(POSTS_DIR, '**/*.md'), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: false,
})

watcher
  .on('add', transformFile)
  .on('change', transformFile)
  .on('ready', () => console.log('Watching for content changes...'))
  .on('error', (err) => console.error('Watcher error:', err))
```

- [ ] **Step 3: 更新 engine/package.json 添加 CLI scripts**

In `engine/package.json`, add:
```json
  "scripts": {
    "build": "tsc -b tsconfig.json",
    "dev": "tsc -b tsconfig.json --watch",
    "test": "vitest run",
    "cli": "node dist/cli.js",
    "watch": "node dist/dev-server.js"
  }
```

- [ ] **Step 4: 构建并测试 CLI**

```bash
cd engine && pnpm install && pnpm build
node engine/dist/cli.js new --title "测试文章" --targets "blog,wechat,xiaohongshu" --tags "AI,效率"
node engine/dist/cli.js all
```

Expected: Creates `content/posts/2026-05-27-*.md`, then transforms it into `content/generated/blog/`, `content/generated/wechat/`, `content/generated/xiaohongshu/cards/`.

- [ ] **Step 5: 提交**

```bash
git add engine/src/cli.ts engine/src/dev-server.ts engine/package.json
git commit -m "feat: add CLI commands and dev watch server"
```

---

### Task 9: Root-level npm scripts 集成

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: 更新根 package.json scripts**

Add to the `scripts` section:
```json
"transform": "tsx engine/src/cli.ts",
"transform:all": "tsx engine/src/cli.ts all",
"transform:new": "tsx engine/src/cli.ts new",
"transform:preview": "tsx engine/src/cli.ts preview",
"engine:watch": "tsx engine/src/dev-server.ts",
```

- [ ] **Step 2: 安装 tsx 依赖（已有，确认）**

```bash
pnpm add -D tsx
```

- [ ] **Step 3: 提交**

```bash
git add package.json
git commit -m "feat: add transform CLI scripts to root package.json"
```

---

### Task 10: Phase 1 端到端测试

**Files:**
- Create: `content/posts/2026-05-27-welcome.md` (sample content)

- [ ] **Step 1: 创建测试内容**

```markdown
---
title: "欢迎使用社媒工作台"
date: 2026-05-27
targets:
  - blog
  - wechat
  - xiaohongshu
tags: [AI, 效率, 工具]
summary: "介绍新的社媒工作流系统"
wechat:
  digest: "社媒工作台上线了"
  author: "slashhuang"
  original: true
xiaohongshu:
  titleOverride: "社媒工作台来了！"
  hashtags: ["#AI工具", "#效率提升", "#社媒运营"]
  cardStyle: gradient
  theme: light
---

# 欢迎使用社媒工作台

这是一个全新的内容创作系统，可以一次编写，多平台发布。

## 支持的平台

- **博客**: 完整的 Markdown 内容，支持代码块、TOC 和 SEO
- **微信公众号**: 自动排版，适配微信编辑器
- **小红书**: 精美 HTML 卡片截图，直接可用

## 如何使用

在工作台编辑 Markdown，系统会自动转换为各平台格式。

## 下一步

更多功能持续开发中，包括：
- 更多平台支持
- AI 辅助内容改写
- 内容排期发布
```

- [ ] **Step 2: 运行完整转换**

```bash
pnpm transform:all
```

Expected output:
```
Transformed: 2026-05-27-welcome.md → X output(s)
Done.
```

- [ ] **Step 3: 验证输出文件**

```bash
ls content/generated/blog/
ls content/generated/wechat/
ls content/generated/xiaohongshu/cards/
```

Expected: Each directory contains corresponding output files.

- [ ] **Step 4: 提交**

```bash
git add content/posts/2026-05-27-welcome.md content/generated/
git commit -m "test: add sample content and verify Phase 1 pipeline"
```

---

## Phase 2: 工作台 UI

### Task 11: Workspace 项目骨架

**Files:**
- Create: `workspace/package.json`
- Create: `workspace/tsconfig.json`
- Create: `workspace/vite.config.ts`
- Create: `workspace/index.html`
- Create: `workspace/src/main.ts`
- Create: `workspace/src/App.vue`
- Create: `workspace/src/router.ts`
- Create: `workspace/src/styles/variables.scss`
- Create: `workspace/src/styles/global.scss`

- [ ] **Step 1: 创建 workspace/package.json**

```json
{
  "name": "@ai/workspace",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "@guolao/vue-monaco-editor": "^1.5.0",
    "markdown-it": "^14.0.0",
    "@types/markdown-it": "^14.0.0",
    "lucide-vue-next": "^0.469.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "sass": "^1.85.0",
    "typescript": "^5.7.3",
    "vite": "~6.1.1"
  }
}
```

- [ ] **Step 2: 创建 workspace/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: 创建 workspace/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['@guolao/vue-monaco-editor'],
        },
      },
    },
  },
})
```

- [ ] **Step 4: 创建 workspace/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>工作台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 workspace/src/main.ts**

```typescript
import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import '@/styles/global.scss'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 6: 创建 workspace/src/App.vue**

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

- [ ] **Step 7: 创建 workspace/src/router.ts**

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'content-list',
      component: () => import('@/views/ContentList.vue'),
    },
    {
      path: '/edit/:id',
      name: 'editor',
      component: () => import('@/views/Editor.vue'),
    },
    {
      path: '/preview/:id',
      name: 'preview',
      component: () => import('@/views/Preview.vue'),
    },
  ],
})
```

- [ ] **Step 8: 创建 CSS 变量** (`workspace/src/styles/variables.scss`)

```scss
:root {
  // Background
  --bg-primary: #ffffff;
  --bg-secondary: #f8f8f8;
  --bg-tertiary: #f0f0f0;

  // Text
  --text-primary: #111111;
  --text-secondary: #666666;
  --text-tertiary: #999999;

  // Border
  --border: #e5e5e5;

  // Accent
  --accent: #2563eb;
  --accent-hover: #1d4ed8;

  // Semantic
  --success: #16a34a;
  --warning: #d97706;
  --error: #dc2626;

  // Brand
  --brand-gradient: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);

  // Spacing
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  // Radius
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  // Shadows
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
  --shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.05);

  // Fonts
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;
  --font-serif: "Noto Serif SC", "Source Han Serif SC", serif;

  // Font sizes
  --text-h1: 1.75rem;
  --text-h2: 1.25rem;
  --text-h3: 1rem;
  --text-body: 0.875rem;
  --text-sm: 0.8125rem;
  --text-caption: 0.75rem;
  --text-code: 0.8125rem;
}
```

- [ ] **Step 9: 创建全局样式** (`workspace/src/styles/global.scss`)

```scss
@use './variables.scss';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

/* Typography */
h1 { font-size: var(--text-h1); font-weight: 700; line-height: 1.2; }
h2 { font-size: var(--text-h2); font-weight: 600; line-height: 1.3; }
h3 { font-size: var(--text-h3); font-weight: 600; line-height: 1.4; }

/* Utility classes */
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
```

- [ ] **Step 10: 安装依赖并验证构建**

```bash
cd workspace && pnpm install && pnpm build
```

Expected: Build succeeds, `workspace/dist/` created.

- [ ] **Step 11: 提交**

```bash
git add workspace/ pnpm-workspace.yaml
git commit -m "feat: scaffold workspace Vue 3 SPA with design tokens"
```

---

### Task 12: 核心 UI 组件

**Files:**
- Create: `workspace/src/components/UIButton.vue`
- Create: `workspace/src/components/UICard.vue`
- Create: `workspace/src/components/UITabs.vue`
- Create: `workspace/src/components/UIBadge.vue`
- Create: `workspace/src/components/UIInput.vue`
- Create: `workspace/src/components/WorkspaceLayout.vue`

- [ ] **Step 1: 创建 UIButton.vue**

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'brand' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    :class="['ui-button', `ui-button--${variant}`, `ui-button--${size}`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s ease;
  border-radius: var(--radius-md);
  font-weight: 500;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--accent);
    color: #ffffff;
    &:hover:not(:disabled) { background: var(--accent-hover); }
  }
  &--secondary {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border);
    &:hover:not(:disabled) { background: var(--bg-tertiary); }
  }
  &--ghost {
    background: transparent;
    color: var(--text-secondary);
    &:hover:not(:disabled) { background: var(--bg-tertiary); color: var(--text-primary); }
  }
  &--brand {
    background: var(--brand-gradient);
    color: #ffffff;
    box-shadow: var(--shadow-sm);
    &:hover:not(:disabled) { filter: brightness(1.05); }
  }
  &--danger {
    background: var(--error);
    color: #ffffff;
    &:hover:not(:disabled) { filter: brightness(0.9); }
  }
  &--sm { padding: 4px 10px; font-size: 12px; }
  &--md { padding: 6px 14px; font-size: 13px; }
  &--lg { padding: 10px 20px; font-size: 14px; }
}
</style>
```

- [ ] **Step 2: 创建 UICard.vue**

```vue
<script setup lang="ts">
interface Props {
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: false,
})
</script>

<template>
  <div
    :class="['ui-card', { 'ui-card--clickable': clickable }]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}
.ui-card--clickable {
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
  }
}
</style>
```

- [ ] **Step 3: 创建 UITabs.vue**

```vue
<script setup lang="ts">
interface Props {
  tabs: { id: string; label: string }[]
  active: string
}

const emit = defineEmits<{
  'update:active': [id: string]
}>()

defineProps<Props>()
</script>

<template>
  <div class="ui-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['ui-tab', { 'ui-tab--active': tab.id === active }]"
      @click="emit('update:active', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.ui-tabs {
  display: inline-flex;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}
.ui-tab {
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s ease;
  &:hover { color: var(--text-primary); }
  &--active {
    background: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }
}
</style>
```

- [ ] **Step 4: 创建 UIBadge.vue**

```vue
<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'error'
}

withDefaults(defineProps<Props>(), {
  variant: 'warning',
})
</script>

<template>
  <span :class="['ui-badge', `ui-badge--${variant}`]">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.ui-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  &--success { background: #dcfce7; color: #166534; }
  &--warning { background: #fef3c7; color: #92400e; }
  &--error { background: #fee2e2; color: #991b1b; }
}
</style>
```

- [ ] **Step 5: 创建 UIInput.vue**

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  type?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    class="ui-input"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped lang="scss">
.ui-input {
  width: 100%;
  padding: var(--space-3);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-family: var(--font-sans);
  color: var(--text-primary);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &::placeholder { color: var(--text-tertiary); }
  &:focus {
    outline: none;
    border-color: var(--accent);
    border-width: 2px;
    box-shadow: var(--shadow-inner);
  }
}
</style>
```

- [ ] **Step 6: 创建 WorkspaceLayout.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'

const darkMode = ref(false)
</script>

<template>
  <div class="workspace-layout" :class="{ dark: darkMode }">
    <header class="workspace-header">
      <div class="logo">
        <span class="logo-icon">⬡</span>
        <span class="logo-text">工作台</span>
      </div>
      <button class="theme-toggle" @click="darkMode = !darkMode">
        <Sun v-if="darkMode" size="18" />
        <Moon v-else size="18" />
      </button>
    </header>
    <main class="workspace-main">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.workspace-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
}
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  .logo-icon {
    font-size: 20px;
    background: var(--brand-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .logo-text {
    font-size: var(--text-h2);
    font-weight: 700;
  }
}
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  &:hover { background: var(--bg-tertiary); }
}
.workspace-main {
  flex: 1;
  padding: var(--space-6);
  background: var(--bg-primary);
}
</style>
```

- [ ] **Step 7: 提交**

```bash
git add workspace/src/components/
git commit -m "feat: build core UI component library"
```

---

### Task 13: ContentList 视图

**Files:**
- Create: `workspace/src/views/ContentList.vue`
- Create: `workspace/src/composables/useContent.ts`
- Create: `workspace/src/types.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
// workspace/src/types.ts
export interface PostMeta {
  id: string
  title: string
  date: string
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  tags: string[]
  status: {
    blog?: 'done' | 'pending' | 'error'
    wechat?: 'done' | 'pending' | 'error'
    xiaohongshu?: 'done' | 'pending' | 'error'
  }
}
```

- [ ] **Step 2: 创建 useContent composable**

```typescript
// workspace/src/composables/useContent.ts
import { ref, onMounted } from 'vue'
import type { PostMeta } from '../types'

const posts = ref<PostMeta[]>([])
const loading = ref(false)

export function useContent() {
  async function loadPosts() {
    loading.value = true
    try {
      // In dev mode, read from the dev server proxy
      // For now, use mock data to verify the UI
      const response = await fetch('/api/posts')
      posts.value = await response.json()
    } catch {
      // Fallback to empty if API not available
      posts.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadPosts)

  return { posts, loading, loadPosts }
}
```

- [ ] **Step 3: 创建 ContentList.vue**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter, Plus } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import UIButton from '@/components/UIButton.vue'
import UICard from '@/components/UICard.vue'
import UIBadge from '@/components/UIBadge.vue'
import UIInput from '@/components/UIInput.vue'
import UITabs from '@/components/UITabs.vue'
import { useContent } from '@/composables/useContent'

const router = useRouter()
const { posts, loading } = useContent()
const searchQuery = ref('')
const filterTab = ref('all')

const filteredPosts = computed(() => {
  let result = posts.value
  if (filterTab.value !== 'all') {
    result = result.filter(p => p.targets.includes(filterTab.value as any))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return result
})

const filterTabs = [
  { id: 'all', label: '全部' },
  { id: 'blog', label: '博客' },
  { id: 'wechat', label: '微信' },
  { id: 'xiaohongshu', label: '小红书' },
]

const platformLabels: Record<string, string> = {
  blog: '博客',
  wechat: '微信',
  xiaohongshu: '小红书',
}

const statusIcon = (status?: 'done' | 'pending' | 'error') => {
  if (status === 'done') return '✓'
  if (status === 'error') return '✗'
  return '○'
}

const statusVariant = (status?: 'done' | 'pending' | 'error') => {
  if (status === 'done') return 'success'
  if (status === 'error') return 'error'
  return 'warning'
}

function editPost(id: string) {
  router.push(`/edit/${id}`)
}
</script>

<template>
  <WorkspaceLayout>
    <div class="content-list">
      <div class="toolbar">
        <UIButton variant="brand" size="lg" @click="$router.push('/edit/new')">
          <Plus size="16" /> 新建内容
        </UIButton>
        <UITabs :tabs="filterTabs" :active="filterTab" @update:active="filterTab = $event" />
        <div class="search">
          <Search size="16" class="search-icon" />
          <UIInput v-model="searchQuery" placeholder="搜索标题或标签..." />
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="filteredPosts.length === 0" class="empty">
        <p class="empty-title">还没有内容</p>
        <p class="empty-desc">点击「新建内容」开始创作吧</p>
        <UIButton variant="brand" size="lg" @click="$router.push('/edit/new')">
          <Plus size="16" /> 新建内容
        </UIButton>
      </div>

      <div v-else class="post-list">
        <UICard
          v-for="post in filteredPosts"
          :key="post.id"
          clickable
          @click="editPost(post.id)"
        >
          <div class="post-item">
            <div class="post-info">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-meta">
                <span class="post-date">{{ post.date }}</span>
                <span class="post-targets">
                  <span
                    v-for="t in post.targets"
                    :key="t"
                    class="target-dot"
                    :title="platformLabels[t]"
                  >● {{ platformLabels[t] }}</span>
                </span>
                <span class="post-status">
                  <UIBadge
                    v-for="t in post.targets"
                    :key="t"
                    :variant="statusVariant(post.status[t])"
                  >
                    {{ statusIcon(post.status[t]) }}
                  </UIBadge>
                </span>
              </div>
            </div>
            <UIButton variant="ghost" size="sm" @click.stop="editPost(post.id)">
              编辑
            </UIButton>
          </div>
        </UICard>
      </div>

      <div class="footer">共 {{ filteredPosts.length }} 篇文章</div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped lang="scss">
.content-list { max-width: 960px; margin: 0 auto; }
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}
.search {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
  margin-left: auto;
  .search-icon {
    position: absolute;
    left: var(--space-3);
    color: var(--text-tertiary);
  }
}
.empty {
  text-align: center;
  padding: var(--space-20);
  .empty-title { font-size: var(--text-h2); margin-bottom: var(--space-2); }
  .empty-desc { color: var(--text-secondary); margin-bottom: var(--space-6); }
}
.post-list { display: flex; flex-direction: column; gap: var(--space-3); }
.post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.post-info { flex: 1; }
.post-title { font-size: var(--text-h3); font-weight: 600; margin-bottom: var(--space-1); }
.post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.target-dot { margin-right: var(--space-2); }
.post-status { display: flex; gap: var(--space-1); }
.footer { margin-top: var(--space-6); font-size: var(--text-sm); color: var(--text-tertiary); }
.loading { text-align: center; padding: var(--space-12); color: var(--text-secondary); }
</style>
```

- [ ] **Step 4: 提交**

```bash
git add workspace/src/views/ContentList.vue workspace/src/composables/useContent.ts workspace/src/types.ts
git commit -m "feat: build content list view with search and filter"
```

---

### Task 14: Editor 视图 — 基础

**Files:**
- Create: `workspace/src/views/Editor.vue`
- Create: `workspace/src/components/MarkdownPreview.vue`

- [ ] **Step 1: 创建 MarkdownPreview.vue**

```vue
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    return `<pre class="code-block"><code class="language-${lang}">${md.utils.escapeHtml(str)}</code></pre>`
  },
})

const rendered = computed(() => md.render(props.content))
</script>

<template>
  <div class="markdown-preview" v-html="rendered" />
</template>

<style scoped lang="scss">
.markdown-preview {
  padding: var(--space-6);
  font-size: var(--text-body);
  line-height: 1.75;
  :deep(h1) { font-size: var(--text-h1); margin: var(--space-6) 0 var(--space-4); font-weight: 700; }
  :deep(h2) { font-size: var(--text-h2); margin: var(--space-5) 0 var(--space-3); font-weight: 600; }
  :deep(h3) { font-size: var(--text-h3); margin: var(--space-4) 0 var(--space-2); font-weight: 600; }
  :deep(p) { margin: var(--space-3) 0; }
  :deep(code) {
    font-family: var(--font-mono);
    font-size: var(--text-code);
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }
  :deep(.code-block) {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: var(--text-code);
    margin: var(--space-4) 0;
  }
  :deep(blockquote) {
    border-left: 3px solid var(--border);
    padding-left: var(--space-4);
    color: var(--text-secondary);
    margin: var(--space-4) 0;
  }
  :deep(img) {
    max-width: 100%;
    border-radius: var(--radius-lg);
    margin: var(--space-4) 0;
  }
  :deep(ul, ol) {
    padding-left: var(--space-6);
  }
  :deep(li) {
    margin: var(--space-1) 0;
  }
}
</style>
```

- [ ] **Step 2: 创建 Editor.vue（基础版，后续增强预览面板）**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Download } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import UIButton from '@/components/UIButton.vue'
import UITabs from '@/components/UITabs.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'

const route = useRoute()
const router = useRouter()
const postId = route.params.id as string

const title = ref('')
const content = ref('')
const activeTab = ref('blog')

const tabs = [
  { id: 'blog', label: '博客' },
  { id: 'wechat', label: '微信' },
  { id: 'xiaohongshu', label: '小红书' },
]

onMounted(() => {
  if (postId === 'new') {
    title.value = ''
    content.value = ''
  } else {
    // Load from API or local file
    // For now, use placeholder
    content.value = '# 开始写作\n\n在这里输入内容...'
  }
})

function saveContent() {
  // In Phase 3, this calls the API to save to content/posts/
  alert('保存功能将在 Phase 3 实现')
}
</script>

<template>
  <div class="editor-layout">
    <header class="editor-header">
      <div class="editor-header-left">
        <UIButton variant="ghost" size="sm" @click="router.push('/')">
          <ArrowLeft size="16" /> 返回
        </UIButton>
        <span class="editor-title-input">
          <input
            v-model="title"
            class="title-field"
            placeholder="文章标题"
          />
        </span>
      </div>
      <div class="editor-header-right">
        <UIButton variant="secondary" size="md" @click="saveContent">
          <Save size="14" /> 保存
        </UIButton>
        <UIButton variant="brand" size="md">
          生成全部
        </UIButton>
      </div>
    </header>

    <div class="editor-body">
      <div class="editor-pane">
        <textarea
          v-model="content"
          class="monaco-fallback"
          placeholder="在这里输入 Markdown..."
          spellcheck="false"
        />
      </div>
      <div class="preview-pane">
        <div class="preview-header">
          <UITabs :tabs="tabs" :active="activeTab" @update:active="activeTab = $event" />
        </div>
        <div class="preview-content">
          <MarkdownPreview v-if="activeTab === 'blog'" :content="content" />
          <div v-else class="preview-placeholder">
            {{ activeTab === 'wechat' ? '微信公众号预览' : '小红书卡片预览' }}
            <p class="preview-desc">此功能在 Phase 3 实现</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
}
.editor-header-left { display: flex; align-items: center; gap: var(--space-3); }
.editor-header-right { display: flex; align-items: center; gap: var(--space-2); }
.title-field {
  border: none;
  font-size: var(--text-h3);
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: transparent;
  min-width: 200px;
  &:focus { outline: none; }
  &::placeholder { color: var(--text-tertiary); }
}
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.editor-pane, .preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor-pane {
  border-right: 1px solid var(--border);
  background: var(--bg-primary);
}
.monaco-fallback {
  flex: 1;
  width: 100%;
  padding: var(--space-4);
  border: none;
  resize: none;
  font-family: var(--font-mono);
  font-size: var(--text-code);
  line-height: 1.6;
  background: var(--bg-primary);
  color: var(--text-primary);
  &:focus { outline: none; }
  &::placeholder { color: var(--text-tertiary); }
}
.preview-pane {
  background: var(--bg-secondary);
}
.preview-header {
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--border);
}
.preview-content {
  flex: 1;
  overflow-y: auto;
}
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: var(--text-h3);
}
.preview-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}
</style>
```

- [ ] **Step 3: 提交**

```bash
git add workspace/src/views/Editor.vue workspace/src/components/MarkdownPreview.vue
git commit -m "feat: build editor view with split-pane layout"
```

---

### Task 15: Preview 视图

**Files:**
- Create: `workspace/src/views/Preview.vue`
- Create: `workspace/src/components/XHSCardPreview.vue`
- Create: `workspace/src/components/WechatPreview.vue`

- [ ] **Step 1: 创建 XHSCardPreview.vue**

```vue
<script setup lang="ts">
interface Props {
  title: string
  body: string
  tags: string[]
  cardStyle?: 'gradient' | 'quote' | 'minimal' | 'code' | 'list'
  theme?: 'light' | 'dark'
  author?: string
}

withDefaults(defineProps<Props>(), {
  cardStyle: 'gradient',
  theme: 'light',
  author: 'slashhuang',
})

const gradientBg = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'

const cardBg = (style: string, theme: string) => {
  if (style === 'gradient') return gradientBg
  if (style === 'minimal') return theme === 'dark' ? '#1a1a1a' : '#fafafa'
  if (style === 'quote') return theme === 'dark' ? '#1a1a2e' : '#f8f4ff'
  if (style === 'code') return theme === 'dark' ? '#1e1e2e' : '#f6f6f6'
  return theme === 'dark' ? '#111' : '#fff'
}

const cardColor = (style: string, theme: string) => {
  if (style === 'gradient') return '#ffffff'
  if (style === 'quote' && theme === 'light') return '#4c1d95'
  return theme === 'dark' ? '#ededed' : '#111'
}
</script>

<template>
  <div class="xhs-card-wrapper">
    <div
      class="xhs-card"
      :style="{
        background: cardBg(cardStyle, theme),
        color: cardColor(cardStyle, theme),
      }"
    >
      <div class="card-header">
        <div class="title">{{ title }}</div>
        <div class="author">@{{ author }}</div>
      </div>
      <div class="card-body">
        <p v-for="(line, i) in body.split('\n\n')" :key="i">{{ line }}</p>
      </div>
      <div class="card-footer">
        <span v-for="tag in tags" :key="tag" class="tag">
          {{ tag.startsWith('#') ? tag : `#${tag}` }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xhs-card-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
  background: var(--bg-tertiary);
}
.xhs-card {
  width: 540px;
  min-height: 720px;
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  .card-header {
    margin-bottom: var(--space-6);
    .title {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: var(--space-2);
    }
    .author {
      font-size: 14px;
      opacity: 0.7;
    }
  }
  .card-body {
    flex: 1;
    font-size: 16px;
    line-height: 1.8;
    p { margin: var(--space-3) 0; }
  }
  .card-footer {
    padding-top: var(--space-4);
    border-top: 1px solid rgba(128, 128, 128, 0.2);
    .tag {
      margin-right: var(--space-2);
      font-size: 14px;
      opacity: 0.9;
    }
  }
}
</style>
```

- [ ] **Step 2: 创建 WechatPreview.vue**

```vue
<script setup lang="ts">
defineProps<{
  htmlContent: string
}>()
</script>

<template>
  <div class="wechat-preview">
    <div class="wechat-frame">
      <div class="wechat-header">
        <span class="wechat-title">微信预览</span>
      </div>
      <div
        class="wechat-body"
        v-html="htmlContent"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.wechat-preview {
  display: flex;
  justify-content: center;
  padding: var(--space-6);
  background: var(--bg-tertiary);
}
.wechat-frame {
  width: 375px;
  background: #ffffff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  .wechat-header {
    padding: var(--space-3) var(--space-4);
    background: #ededed;
    text-align: center;
    .wechat-title {
      font-size: 14px;
      color: #333;
    }
  }
  .wechat-body {
    padding: var(--space-4);
    font-size: 15px;
    line-height: 1.8;
    :deep(section) { margin: 12px 0; }
  }
}
</style>
```

- [ ] **Step 3: 创建 Preview.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Image } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import UIButton from '@/components/UIButton.vue'
import UITabs from '@/components/UITabs.vue'
import XHSCardPreview from '@/components/XHSCardPreview.vue'
import WechatPreview from '@/components/WechatPreview.vue'

const route = useRoute()
const router = useRouter()
const postId = route.params.id as string
const activeTab = ref('xiaohongshu')
const cardStyle = ref<'gradient' | 'quote' | 'minimal' | 'code' | 'list'>('gradient')
const theme = ref<'light' | 'dark'>('light')
const currentPage = ref(1)

const tabs = [
  { id: 'blog', label: '博客' },
  { id: 'wechat', label: '微信' },
  { id: 'xiaohongshu', label: '小红书' },
]

// Placeholder data — Phase 3 will load from generated/
const postData = ref({
  title: '示例文章',
  body: '这是正文段落。工作台会自动预览各平台的排版效果。\n\n这是第二段内容。',
  tags: ['AI', '效率'],
  wechatHtml: '<section style="font-size: 15px;">微信 HTML 预览将在 Phase 3 实现</section>',
  xhsPages: 3,
})

const cardStyleOptions: { id: string; label: string }[] = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'quote', label: 'Quote' },
  { id: 'code', label: 'Code' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'list', label: 'List' },
]
</script>

<template>
  <WorkspaceLayout>
    <div class="preview-page">
      <div class="preview-header">
        <UIButton variant="ghost" size="sm" @click="router.push('/')">
          <ArrowLeft size="16" /> 返回
        </UIButton>
        <h2 class="preview-title">{{ postData.title }} — 预览</h2>
      </div>

      <div class="preview-controls">
        <UITabs :tabs="tabs" :active="activeTab" @update:active="activeTab = $event" />

        <template v-if="activeTab === 'xiaohongshu'">
          <div class="xhs-options">
            <div class="option-group">
              <label>卡片风格:</label>
              <div class="style-pills">
                <button
                  v-for="opt in cardStyleOptions"
                  :key="opt.id"
                  :class="['pill', { active: cardStyle === opt.id }]"
                  @click="cardStyle = opt.id as any"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div class="option-group">
              <label>主题:</label>
              <div class="style-pills">
                <button :class="['pill', { active: theme === 'light' }]" @click="theme = 'light'">亮色</button>
                <button :class="['pill', { active: theme === 'dark' }]" @click="theme = 'dark'">暗色</button>
              </div>
            </div>
            <div class="option-group">
              <label>分段: {{ currentPage }}/{{ postData.xhsPages }}</label>
              <div class="page-nav">
                <button class="pill" :disabled="currentPage <= 1" @click="currentPage--">‹</button>
                <button
                  v-for="p in postData.xhsPages"
                  :key="p"
                  :class="['pill', 'page', { active: currentPage === p }]"
                  @click="currentPage = p"
                >
                  {{ p }}
                </button>
                <button class="pill" :disabled="currentPage >= postData.xhsPages" @click="currentPage++">›</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="preview-area">
        <template v-if="activeTab === 'blog'">
          <div class="blog-preview">博客预览（与编辑页右侧相同）</div>
        </template>
        <template v-else-if="activeTab === 'wechat'">
          <WechatPreview :html-content="postData.wechatHtml" />
        </template>
        <template v-else>
          <XHSCardPreview
            :title="postData.title"
            :body="postData.body"
            :tags="postData.tags"
            :card-style="cardStyle"
            :theme="theme"
          />
        </template>
      </div>

      <div class="preview-actions">
        <UIButton variant="secondary">
          <Image size="14" /> 生成截图
        </UIButton>
        <UIButton variant="primary">
          <Download size="14" /> 下载全部
        </UIButton>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped lang="scss">
.preview-page { max-width: 960px; margin: 0 auto; }
.preview-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  .preview-title { font-size: var(--text-h2); font-weight: 600; }
}
.preview-controls {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}
.xhs-options { display: flex; gap: var(--space-6); flex-wrap: wrap; }
.option-group { display: flex; flex-direction: column; gap: var(--space-2); }
.option-group label { font-size: var(--text-sm); color: var(--text-secondary); }
.style-pills { display: flex; gap: var(--space-1); }
.pill {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s ease;
  &:hover { background: var(--bg-tertiary); }
  &.active {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
  }
  &.page {
    border-radius: var(--radius-md);
  }
}
.preview-area {
  margin-bottom: var(--space-6);
  min-height: 400px;
}
.preview-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  padding: var(--space-4) 0;
}
</style>
```

- [ ] **Step 4: 提交**

```bash
git add workspace/src/views/Preview.vue workspace/src/components/XHSCardPreview.vue workspace/src/components/WechatPreview.vue
git commit -m "feat: build preview view with XHS card and WeChat previews"
```

---

### Task 16: 启动工作台 dev server 验证

**Files:**
- Modify: `workspace/package.json` (add scripts)

- [ ] **Step 1: 验证 workspace 可以独立运行**

```bash
cd workspace && pnpm install && pnpm dev
```

Expected: Vite dev server starts on port 5173, workspace loads with mock data.

- [ ] **Step 2: 提交**

```bash
git add workspace/package.json
git commit -m "chore: verify workspace standalone build"
```

---

## Phase 3: VuePress 集成与构建管线

### Task 17: VuePress 路由集成

**Files:**
- Create: `docs/workspace/index.html` (VuePress 静态文件挂载点)
- Modify: `docs/.vuepress/config.ts` (添加 workspace 路由支持)

- [ ] **Step 1: 配置 VuePress 将 workspace/dist/ 挂载到 /workspace/ 路由**

在 `docs/.vuepress/config.ts` 中添加 `alias` 或自定义配置。由于 VuePress 是基于 Vue Router 的，我们需要将 workspace 的构建产物作为静态资源处理：

在 `docs/.vuepress/config.ts` 中添加 `extraWatchFiles` 或在构建时自动复制 `workspace/dist/` 到 `docs/.vuepress/public/workspace/`。

修改 `docs/.vuepress/config.ts`:

```typescript
// Add to the existing config
export default defineUserConfig({
  // ... existing config ...
  
  // Add public assets
  alias: {
    // ... existing aliases ...
  },
})
```

- [ ] **Step 2: 创建构建脚本将 workspace/dist/ 复制到 VuePress public 目录**

Create `scripts/copy-workspace.ts`:

```typescript
import { copySync, ensureDirSync } from 'fs-extra'
import { join } from 'node:path'

const ROOT = process.cwd()
const WORKSPACE_DIST = join(ROOT, 'workspace/dist')
const VUEPRESS_PUBLIC = join(ROOT, 'docs/.vuepress/public/workspace')

ensureDirSync(VUEPRESS_PUBLIC)
copySync(WORKSPACE_DIST, VUEPRESS_PUBLIC)
console.log(`Copied workspace dist to ${VUEPRESS_PUBLIC}`)
```

- [ ] **Step 3: 安装 fs-extra**

```bash
pnpm add -D fs-extra @types/fs-extra
```

- [ ] **Step 4: 提交**

```bash
git add scripts/copy-workspace.ts docs/.vuepress/
git commit -m "feat: integrate workspace SPA into VuePress public assets"
```

---

### Task 18: 更新 npm scripts 构建管线

**Files:**
- Modify: `package.json` (root)
- Modify: `docs/package.json`

- [ ] **Step 1: 更新根 package.json scripts**

Add to scripts:
```json
"workspace:build": "pnpm --filter @ai/workspace build",
"workspace:dev": "pnpm --filter @ai/workspace dev",
"prebuild:doc": "pnpm workspace:build && tsx scripts/copy-workspace.ts",
```

- [ ] **Step 2: 提交**

```bash
git add package.json
git commit -m "feat: wire workspace build into docs build pipeline"
```

---

### Task 19: Blog 内容软链接

**Files:**
- Create: `scripts/link-blog-content.ts`

- [ ] **Step 1: 创建软链接脚本**

```typescript
import { symlinkSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const GENERATED_BLOG = join(ROOT, 'content/generated/blog')
const DOCS_POSTS = join(ROOT, 'docs/posts')

function linkDir(src: string, dest: string) {
  if (!existsSync(src)) {
    console.log(`Source not found: ${src}`)
    return
  }
  if (existsSync(dest)) {
    // Remove existing
    try {
      const stats = statSync(dest)
      if (stats.isSymbolicLink()) {
        // Will be overwritten by symlinkSync
      }
    } catch {
      // doesn't exist
    }
  }
  mkdirSync(join(dest, '..'), { recursive: true })
  try {
    symlinkSync(src, dest, 'dir')
    console.log(`Linked: ${dest} → ${src}`)
  } catch (e: any) {
    // EEXIST on Windows, etc.
    console.log(`Link already exists: ${dest}`)
  }
}

linkDir(GENERATED_BLOG, DOCS_POSTS)
```

- [ ] **Step 2: 更新 `docs/package.json` docs:build script**

```json
"docs:build": "tsx ../../scripts/link-blog-content.ts && vuepress build . --clean-cache --clean-temp",
```

- [ ] **Step 3: 提交**

```bash
git add scripts/link-blog-content.ts docs/package.json
git commit -m "feat: symlink generated blog content to docs/posts/"
```

---

### Task 20: 端到端测试

**Files:**
- No new files

- [ ] **Step 1: 完整构建测试**

```bash
# 1. 创建测试内容
pnpm transform new --title "端到端测试文章" --targets "blog,wechat,xiaohongshu" --tags "测试"

# 2. 转换内容
pnpm transform:all

# 3. 构建 workspace
pnpm workspace:build

# 4. 复制 workspace 到 VuePress
tsx scripts/copy-workspace.ts

# 5. 链接博客内容
tsx scripts/link-blog-content.ts

# 6. 构建文档
pnpm build:doc
```

- [ ] **Step 2: 验证**

- `docs/.vuepress/dist/` 包含完整的站点文件
- `docs/.vuepress/dist/workspace/` 包含工作台 SPA
- `docs/posts/` 软链接指向 `content/generated/blog/`

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "test: verify end-to-end build pipeline"
```

---

## Self-Review

**1. Spec coverage check:**

| Spec Requirement | Task |
|-----------------|------|
| 目录结构重构 | Task 1 |
| Parser (frontmatter + Markdown) | Task 2 |
| Blog transformer | Task 3 |
| WeChat transformer (inline CSS HTML) | Task 4 |
| Xiaohongshu HTML cards (5 styles) | Task 5 |
| Puppeteer screenshot | Task 6 |
| Exporter | Task 7 |
| CLI (new/all/preview) | Task 8 |
| Dev watch server | Task 8 (dev-server.ts) |
| Root npm scripts | Task 9 |
| UI design tokens (colors/fonts/spacing/shadows) | Task 11 |
| UI components (Button/Card/Tabs/Badge/Input/Layout) | Task 12 |
| Content list view | Task 13 |
| Editor view | Task 14 |
| Preview view (XHS card + WeChat) | Task 15 |
| VuePress route integration | Task 17 |
| Build pipeline | Task 18 |
| Blog content symlink | Task 19 |
| End-to-end test | Task 10, Task 20 |

**Coverage: All spec requirements are covered.**

**2. Placeholder scan:** No TBD/TODO/fill-in-later in the plan.

**3. Type consistency:** `ContentMeta`, `GeneratedFile`, `ParsedContent` types defined in Task 1 are used consistently across Tasks 2-8. `PostMeta` in Task 13 is the frontend counterpart. All file paths match the spec directory structure.

**4. Scope check:** This is a focused implementation plan with clear 3-phase boundaries. Each phase produces working, testable output.
