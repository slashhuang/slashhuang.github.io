import matter from 'gray-matter'
import type { ContentMeta, ParsedContent } from './types.js'

function formatDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function parseContent(markdown: string, sourcePath: string): ParsedContent {
  const { data, content } = matter(markdown)

  const meta: ContentMeta = {
    title: data.title || '',
    date: data.date
      ? data.date instanceof Date
        ? formatDate(data.date)
        : String(data.date)
      : '',
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
