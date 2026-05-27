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
