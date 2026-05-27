import matter from 'gray-matter'
import type { ContentMeta, ParsedContent } from './types.js'

export function parseContent(markdown: string, sourcePath: string): ParsedContent {
  const { data, content } = matter(markdown)

  const meta: ContentMeta = {
    title: data.title || '',
    date: data.date
      ? data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
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
