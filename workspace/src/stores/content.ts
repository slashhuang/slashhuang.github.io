import { reactive, computed } from 'vue'

export interface ContentEntry {
  id: string
  title: string
  date: string
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  tags: string[]
  status: 'draft' | 'published'
  body?: string
  author?: string
}

export const contentStore = reactive<{
  entries: ContentEntry[]
}>({
  entries: [
    {
      id: '1',
      title: 'Getting Started with Vue 3 Composition API',
      date: '2026-05-20',
      targets: ['blog'],
      tags: ['Vue', 'Frontend'],
      status: 'published',
      author: 'Slash Huang',
      body: `# Vue 3 Composition API

The Composition API is a set of APIs that allows you to author Vue components using imported functions instead of declaring options.

## Why Composition API?

- Better **TypeScript** support
- More flexible code organization
- Easier to share logic between components

## Basic Example

\`\`\`ts
import { ref } from 'vue'

const count = ref(0)
count.value++
\`\`\`

This is the foundation of modern Vue development.`,
    },
    {
      id: '2',
      title: '微信公众号排版技巧',
      date: '2026-05-18',
      targets: ['wechat'],
      tags: ['WeChat', 'Design'],
      status: 'published',
      author: 'Slash Huang',
      body: `# 微信公众号排版指南

好的排版可以让文章阅读体验大幅提升。

## 核心原则

1. **留白很重要** — 段落之间保持适当间距
2. **字体大小** — 正文建议使用 15px 或 16px
3. **配色简洁** — 主色 + 辅助色不超过三种

## 实用技巧

使用行内样式来保持排版一致性，特别是在标题和引用部分。`,
    },
    {
      id: '3',
      title: '小红书种草文案怎么写',
      date: '2026-05-15',
      targets: ['xiaohongshu'],
      tags: ['Xiaohongshu', 'Copywriting'],
      status: 'draft',
      author: 'Slash Huang',
      body: `# 种草文案写作秘籍

小红书文案有几个关键点：

## 标题要抓人

- 使用数字：**3个**必买好物
- 使用感叹：太好用了吧！
- 制造悬念：这个秘密很少有人知道

## 正文要真诚

分享真实的使用体验，配上 Emoji 更生动。`,
    },
    {
      id: '4',
      title: 'Multi-platform Content Strategy',
      date: '2026-05-10',
      targets: ['blog', 'wechat'],
      tags: ['Strategy', 'Marketing'],
      status: 'draft',
      author: 'Slash Huang',
      body: `# Multi-platform Content Strategy

Writing content once and publishing everywhere requires careful planning.

## Platform Differences

| Platform | Format | Tone |
|----------|--------|------|
| Blog | Long-form | Technical |
| WeChat | Medium-form | Conversational |
| Xiaohongshu | Short-form | Casual |

## Key Takeaway

Adapt your content to each platform's audience while maintaining a consistent brand voice.`,
    },
    {
      id: '5',
      title: 'TypeScript 高级类型体操',
      date: '2026-05-05',
      targets: ['blog', 'wechat', 'xiaohongshu'],
      tags: ['TypeScript', 'Programming'],
      status: 'published',
      author: 'Slash Huang',
      body: `# TypeScript 高级类型

TypeScript 的类型系统非常强大，可以用来做很多有趣的事情。

## 条件类型

\`\`\`ts
type IsString<T> = T extends string ? true : false
\`\`\`

## 模板字面量类型

\`\`\`ts
type EventName = \`on\${Capitalize<string>}\`
\`\`\`

## 实战应用

利用这些高级类型，可以构建出类型安全的 API。`,
    },
    {
      id: '6',
      title: 'Building a Static Site Generator',
      date: '2026-04-28',
      targets: ['blog'],
      tags: ['Tools', 'SSG'],
      status: 'draft',
      author: 'Slash Huang',
      body: `# Building a Static Site Generator

Static site generators are great for blogs and documentation sites.

## Architecture

1. **Parse** Markdown files
2. **Transform** to platform-specific HTML
3. **Export** to disk

## Tools

Use Vite for bundling, markdown-it for parsing, and a simple file watcher for dev mode.`,
    },
    {
      id: '7',
      title: 'Published Xiaohongshu Post',
      date: '2026-04-20',
      targets: ['xiaohongshu'],
      tags: ['Lifestyle'],
      status: 'published',
      author: 'Slash Huang',
      body: `# 生活好物分享

今天来分享最近发现的宝藏好物！

## 好物一：机械键盘

手感超级棒，打字体验完全不一样。

## 好物二：人体工学椅

久坐不累，程序员必备！

#好物推荐 #程序员 #办公好物`,
    },
  ],
})

type PlatformFilter = 'all' | 'blog' | 'wechat' | 'xiaohongshu'
type StatusFilter = 'all' | 'draft' | 'published'

export function useContentStore() {
  const platformFilter = reactive<{ value: PlatformFilter }>({ value: 'all' })
  const statusFilter = reactive<{ value: StatusFilter }>({ value: 'all' })

  const filtered = computed(() => {
    let result = contentStore.entries

    if (platformFilter.value !== 'all') {
      result = result.filter((e) => e.targets.includes(platformFilter.value))
    }

    if (statusFilter.value !== 'all') {
      result = result.filter((e) => e.status === statusFilter.value)
    }

    return [...result].sort((a, b) => b.date.localeCompare(a.date))
  })

  const platforms: PlatformFilter[] = ['all', 'blog', 'wechat', 'xiaohongshu']
  const statuses: StatusFilter[] = ['all', 'draft', 'published']

  function findById(id: string): ContentEntry | undefined {
    return contentStore.entries.find((e) => e.id === id)
  }

  function saveEntry(entry: ContentEntry) {
    const idx = contentStore.entries.findIndex((e) => e.id === entry.id)
    if (idx >= 0) {
      contentStore.entries[idx] = entry
    } else {
      contentStore.entries.unshift(entry)
    }
  }

  function createEntry(overrides: Partial<ContentEntry> = {}): ContentEntry {
    const id = String(Date.now())
    const entry: ContentEntry = {
      id,
      title: overrides.title ?? 'Untitled',
      date: new Date().toISOString().slice(0, 10),
      targets: overrides.targets ?? ['blog'],
      tags: overrides.tags ?? [],
      status: overrides.status ?? 'draft',
    }
    contentStore.entries.unshift(entry)
    return entry
  }

  return {
    platformFilter,
    statusFilter,
    filtered,
    platforms,
    statuses,
    findById,
    saveEntry,
    createEntry,
  }
}
