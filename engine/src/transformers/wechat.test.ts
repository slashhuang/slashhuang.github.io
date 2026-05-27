import { describe, it, expect } from 'vitest'
import { transformWechat } from './wechat.js'
import { parseContent } from '../parser.js'

describe('transformWechat', () => {
  it('generates HTML with inline styles for WeChat', () => {
    const md = `---
title: "微信文章"
date: 2026-05-27
targets:
  - wechat
tags: [test]
wechat:
  author: "slashhuang"
  original: true
---

# 标题

这是一段正文。

## 小标题

第二段内容。
`
    const parsed = parseContent(md, '/test.md')
    const output = transformWechat(parsed)

    expect(output.platform).toBe('wechat')
    expect(output.path).toMatch(/\.html$/)
    expect(output.content).toContain('<section')
    expect(output.content).toContain('这是一段正文')
    expect(output.content).toContain('第二段内容')
  })

  it('strips code blocks from output', () => {
    const md = `---
title: "Code Post"
date: 2026-05-27
targets:
  - wechat
tags: []
---

Normal text.

\`\`\`ts
const x = 1
\`\`\`

More text.
`
    const parsed = parseContent(md, '/test.md')
    const output = transformWechat(parsed)

    expect(output.content).not.toContain('const x = 1')
  })
})
