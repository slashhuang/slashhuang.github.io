import { reactive, computed } from 'vue'

export interface ContentEntry {
  id: string
  title: string
  date: string
  targets: ('blog' | 'wechat' | 'xiaohongshu')[]
  tags: string[]
  status: 'draft' | 'published'
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
    },
    {
      id: '2',
      title: '微信公众号排版技巧',
      date: '2026-05-18',
      targets: ['wechat'],
      tags: ['WeChat', 'Design'],
      status: 'published',
    },
    {
      id: '3',
      title: '小红书种草文案怎么写',
      date: '2026-05-15',
      targets: ['xiaohongshu'],
      tags: ['Xiaohongshu', 'Copywriting'],
      status: 'draft',
    },
    {
      id: '4',
      title: 'Multi-platform Content Strategy',
      date: '2026-05-10',
      targets: ['blog', 'wechat'],
      tags: ['Strategy', 'Marketing'],
      status: 'draft',
    },
    {
      id: '5',
      title: 'TypeScript 高级类型体操',
      date: '2026-05-05',
      targets: ['blog', 'wechat', 'xiaohongshu'],
      tags: ['TypeScript', 'Programming'],
      status: 'published',
    },
    {
      id: '6',
      title: 'Building a Static Site Generator',
      date: '2026-04-28',
      targets: ['blog'],
      tags: ['Tools', 'SSG'],
      status: 'draft',
    },
    {
      id: '7',
      title: 'Published Xiaohongshu Post',
      date: '2026-04-20',
      targets: ['xiaohongshu'],
      tags: ['Lifestyle'],
      status: 'published',
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
