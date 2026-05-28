# slashhuang.github.io

> 个人博客 & 社媒工作流系统 — 一次编写，多平台发布

## 架构

```
├── engine/           # 内容引擎 — 解析/转换/导出
├── workspace/        # Vue 3 工作台 SPA — 编辑/预览
├── content/          # 内容源文件
│   ├── posts/        #   博客 + 社媒源 Markdown
│   ├── generated/    #   引擎输出 (blog/wechat/xiaohongshu)
│   └── ideas/        #   草稿
├── docs/             # VuePress 站点 (https://slashhuang.github.io)
│   ├── blog → ../content/posts  (软链)
│   └── .vuepress/public/workspace/  (工作台 SPA)
└── scripts/          # 构建脚本
```

## 快速开始

```bash
pnpm install -r

# 开发
pnpm dev                          # VuePress 站点
pnpm workspace:dev                # 工作台 SPA (:5173/workspace/)
pnpm engine:dev                   # 引擎 TypeScript watch

# 构建
pnpm build:doc                    # workspace → VuePress → 完整站点
node engine/dist/cli.js build     # 内容转换 (blog + wechat + xiaohongshu)

# 测试
pnpm engine:test                  # 39 tests
pnpm workspace:test               # 45 tests
```

## 内容格式

```yaml
---
title: "文章标题"
date: 2026-05-27
targets:
  - blog          # 输出 VuePress Markdown
  - wechat        # 输出内联样式 HTML
  - xiaohongshu   # 输出卡片 HTML → 可转 PNG
tags: [AI, 效率]
wechat:
  author: "slashhuang"
xiaohongshu:
  cardStyle: gradient    # gradient | quote | minimal | code | list
  hashtags: ["#AI工具"]
---

正文内容...
```

## 技术栈

| 层 | 技术 |
|----|------|
| 内容引擎 | Node.js / TypeScript, gray-matter, markdown-it, EJS |
| 截图 | Puppeteer (headless Chrome), sharp |
| 工作台 | Vue 3, Vite, Vue Router, Monaco Editor, SCSS |
| 博客 | VuePress 2, Vite |
| 包管理 | pnpm workspaces |

## CI/CD

GitHub Actions 自动化：PR → 测试 → 合并后自动部署到 GitHub Pages。
