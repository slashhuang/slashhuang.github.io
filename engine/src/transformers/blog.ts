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
    .filter(([_, v]) => v !== undefined)
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

  const fileName = sourcePath.split('/').pop()?.replace(/\.md$/, '') || 'post'
  return {
    path: `blog/${fileName}.md`,
    content,
    platform: 'blog',
  }
}
