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
