# slashhuang.github.io — Claude 上下文

## 项目概况

这是一个个人博客 + 社媒工作流系统。核心能力：一次编写 Markdown，自动适配博客/微信/小红书三个平台。

## 目录结构

| 路径 | 说明 |
|------|------|
| `engine/` | 内容引擎 (Node.js/TS) — 解析、转换、导出 |
| `workspace/` | 工作台 SPA (Vue 3 + Monaco Editor) |
| `content/posts/` | 内容源 Markdown |
| `content/generated/` | 引擎输出 |
| `docs/` | VuePress 站点 |
| `scripts/` | 构建脚本 |

## 关键技术选型

- **包管理**: pnpm workspaces
- **引擎**: gray-matter, markdown-it, EJS, puppeteer, commander, chokidar
- **工作台**: Vue 3 Composition API (`<script setup>`), Vue Router, Monaco Editor, SCSS
- **博客**: VuePress 2
- **测试**: Vitest + @vue/test-utils

## 开发规范

- TypeScript 项目引用 (composite builds)，import 用 `.js` 扩展名
- Vue 组件统一 `<script setup lang="ts">`
- 测试用 vitest，遵循 TDD
- 引擎的 transformer 返回 `GeneratedFile[]`，exporter 写入磁盘
- CLI 命令: `build` (一次性) 和 `dev` (chokidar 热重载)

## 常用命令

```bash
pnpm engine:test      # 引擎测试 (39 tests)
pnpm workspace:test   # 工作台测试 (45 tests)
pnpm build:doc        # 完整构建
node engine/dist/cli.js build  # 内容转换
```

## CI/CD

GitHub Actions (`.github/workflows/static.yml`):
- PR: 运行全部测试
- Push to master: 测试 → 构建 → 部署到 GitHub Pages
