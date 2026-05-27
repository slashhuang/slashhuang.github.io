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
    expect(output.platform).toBe('blog')
  })

  it('includes all optional frontmatter fields when present', () => {
    const md = `---
title: "Full Post"
date: 2026-05-27
targets:
  - blog
tags: [AI, 效率]
cover: /assets/cover.jpg
summary: "A summary"
blog:
  category: "技术教程"
  pinned: true
---

Content
`
    const parsed = parseContent(md, '/full.md')
    const output = transformBlog(parsed)

    expect(output.content).toContain('category: "技术教程"')
    expect(output.content).toContain('pinned: true')
    expect(output.content).toContain('cover: "/assets/cover.jpg"')
    expect(output.content).toContain('summary: "A summary"')
    expect(output.content).toContain('tags: [AI, 效率]')
  })

  it('omits optional fields when not specified', () => {
    const md = `---
title: "Minimal"
date: 2026-05-27
targets:
  - blog
tags: []
---

Body
`
    const parsed = parseContent(md, '/minimal.md')
    const output = transformBlog(parsed)

    expect(output.content).not.toContain('category:')
    expect(output.content).not.toContain('pinned:')
    expect(output.content).not.toContain('cover:')
    expect(output.content).not.toContain('summary:')
    expect(output.content).toContain('tags: []')
  })

  it('handles filenames with multiple dots correctly', () => {
    const md = `---
title: "Test"
date: 2026-05-27
targets:
  - blog
tags: []
---

Body
`
    const parsed = parseContent(md, '/some.deep.file.name.md')
    const output = transformBlog(parsed)

    expect(output.path).toBe('blog/some.deep.file.name.md')
  })
})
